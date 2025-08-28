import { MapLayer } from "./MapLayer.ts"

import { TileProgram } from "../programs/TileProgram.ts"
import { TileSource } from "../TileSource.ts"
import { TileStorage } from "../storage/TileStorage.ts"
import { TilePosition } from "../types/TilePosition.ts"

import type { TileLayerConfig, TileBoundsType, QueueItemType } from "../types/types.ts"
import type { CoordEvent } from "../events/CoordEvent.ts"
import type { ZoomEvent } from "../events/ZoomEvent.ts"
import type { ResizeEvent } from "../events/ResizeEvent.ts"


function compareTileBounds(t1: TileBoundsType, t2: TileBoundsType) {
	return (t1.minX === t2.minX &&
			t1.maxX === t2.maxX &&
			t1.minY === t2.minY &&
			t1.maxY === t2.maxY &&
			t1.minZoom === t2.minZoom &&
			t1.maxZoom === t2.maxZoom)
}


class TileLayer extends MapLayer {
	tileWidth = 256
	tileHeight = 256

	// Experimental settings
	_tileFetchPadding = 0	// Fetch tiles outside of visible viewport to avoid missing tiles
	_tileCreationCountPerFrame = 8	// Limit tile creation to avoid texture upload bottleneck

	tileProgram: TileProgram
	tileSource: TileSource
	tileStorage: TileStorage

	hasUpdatedArea = false
	hasUpdatedTiles = false

	requiredTiles: Array<TilePosition> = []
	pendingTileIDs: Set<string> = new Set()
	tileCreateQueue: Array<QueueItemType> = []

	tileBounds: TileBoundsType = {minX: 0, maxX: 0, minY: 0, maxY: 0, minZoom: 0, maxZoom: 0}	// Tiles for current view
	tileLimits?: TileBoundsType	// Available tiles

	constructor(config: TileLayerConfig) {
		super(config)

		this.addEventListener("pan", this.onPan as EventListener)
		this.addEventListener("zoom", this.onZoom as EventListener)
		this.addEventListener("resize", this.onResize as EventListener)
		
		const {
			context,
			tileWidth = 256,
			tileHeight = 256,
			tileURL,
			tileLimits,
			_tileFetchPadding = 0,
			_tileCreationCountPerFrame = 8
		} = config
		Object.assign(this, {tileWidth, tileHeight, tileLimits, _tileFetchPadding, _tileCreationCountPerFrame})
		
		// Create tile source & force initial calculation + fetch
		this.tileSource = new TileSource(tileURL)
		this.hasUpdatedArea = true

		// Setup shader program
		this.tileProgram = new TileProgram(context)
		let tp = this.tileProgram
		tp.activate()
		
		// Set initial values before first render
		tp.setCenter(this.centerX, this.centerY)
		tp.setZoom(this.zoom)
		tp.setResolution(this.width, this.height)
		tp.setTileSize(this.tileWidth, this.tileHeight)

		// Create texture storage for icons
		this.tileStorage = new TileStorage(context, tileWidth, tileHeight)
		tp.setTileTexture(this.tileStorage.getTextureBinding())
	}

	onPan(panEvent: CoordEvent) {
		this.hasUpdatedArea = true

		this.tileProgram.activate()
		this.tileProgram.setCenter(panEvent.x, panEvent.y)
	}

	onZoom(zoomEvent: ZoomEvent) {
		this.hasUpdatedArea = true

		this.tileProgram.activate()
		this.tileProgram.setZoom(zoomEvent.zoom)
	}

	onResize(resizeEvent: ResizeEvent) {
		this.hasUpdatedArea = true

		this.tileProgram.activate()
		this.tileProgram.setResolution(resizeEvent.width, resizeEvent.height)
	}

	updateTileBounds(): boolean {
		let zoomLevel = Math.floor(this.zoom + 0.5)

		if (this.tileLimits) {
			if (zoomLevel < this.tileLimits.minZoom) zoomLevel = Math.ceil(this.tileLimits.minZoom)
			if (zoomLevel > this.tileLimits.maxZoom) zoomLevel = Math.floor(this.tileLimits.maxZoom)
		}

		let viewScale = Math.pow(2, this.zoom)

		// Add padding to viewport
		let paddedWidth  = (this.width  / 2 + this._tileFetchPadding) / viewScale,
			paddedHeight = (this.height / 2 + this._tileFetchPadding) / viewScale

		let requiredArea = {
			minX: this.centerX - paddedWidth,
			maxX: this.centerX + paddedWidth,
			minY: this.centerY - paddedHeight,
			maxY: this.centerY + paddedHeight,
			minZoom: 0,
			maxZoom: zoomLevel
		}
		
		// Account for tile limits
		if (this.tileLimits) {
			let {minX, maxX, minY, maxY, minZoom, maxZoom} = this.tileLimits
			let epsilon = 0.0000001	// Avoid fetching tiles JUST on the border
			if (minX > requiredArea.minX) requiredArea.minX = minX
			if (maxX < requiredArea.maxX) requiredArea.maxX = maxX - epsilon
			if (minY > requiredArea.minY) requiredArea.minY = minY
			if (maxY < requiredArea.maxY) requiredArea.maxY = maxY - epsilon
			if (minZoom > requiredArea.minZoom) requiredArea.minZoom = minZoom
			if (maxZoom < requiredArea.maxZoom) requiredArea.maxZoom = maxZoom
		}

		// Convert to grid coordinates
		let gridScale = Math.pow(2, zoomLevel)
		let horizontalGridScale = gridScale / this.tileWidth
		let verticalGridScale = gridScale / this.tileHeight

		requiredArea.minX = Math.floor(requiredArea.minX * horizontalGridScale)
		requiredArea.maxX = Math.floor(requiredArea.maxX * horizontalGridScale)
		requiredArea.minY = Math.floor(requiredArea.minY * verticalGridScale)
		requiredArea.maxY = Math.floor(requiredArea.maxY * verticalGridScale)

		if (compareTileBounds(requiredArea, this.tileBounds)) {
			return false
		} else {
			this.tileBounds = requiredArea
			let r = requiredArea
			console.log(`New Bounds: ${r.maxX-r.minX+1}x${r.maxY-r.minY+1} -> X: ${r.minX}-${r.maxX} & Y: ${r.minY}-${r.maxY}`)
			return true
		}
	}

	updateRequiredTiles() {
		this.requiredTiles = []

		let {minX, maxX, minY, maxY, minZoom, maxZoom} = this.tileBounds

		for (let z = maxZoom; z >= minZoom; z--) {
			for (let x = minX; x <= maxX; x++) {
				for (let y = minY; y <= maxY; y++) {
					this.requiredTiles.push(new TilePosition(x, y, z))
				}
			}

			// Decrease grid scale
			minX = Math.floor(minX / 2)
			maxX = Math.floor(maxX / 2)
			minY = Math.floor(minY / 2)
			maxY = Math.floor(maxY / 2)
		}
	}

	fetchMissingTiles() {
			this.requiredTiles
				.filter(tile => !this.tileStorage.hasTile(tile))
				.filter(tile => !this.pendingTileIDs.has(tile.toString()))
				.reverse()	// Improvised sort by importance -> Lower zoom levels first
				.forEach(tile => {
					this.pendingTileIDs.add(tile.toString())
					this.tileSource.fetchTile(tile.x, tile.y, tile.z)
						.then(image => {
							this.hasUpdatedTiles = true
							this.tileCreateQueue.push({image, tile})
						})
				})
	}

	render() {
		if (this.hasUpdatedArea === true) {
			this.hasUpdatedArea = false

			let hasUpdatedBounds = this.updateTileBounds()

			if (hasUpdatedBounds === true) {
				this.updateRequiredTiles()

				this.tileStorage.removeTilesExceptRequired(this.requiredTiles)
				this.hasUpdatedTiles = true	// Removing tiles must cause buffer update

				this.fetchMissingTiles()
			}
		}

		// Draw all available tiles
		let tp = this.tileProgram
		tp.activate()

		if (this.hasUpdatedTiles) {

			// Limit tiles created per frame to avoid dropped frames
			// Deep Dive: texSubImage3d acts synchronous on the GPU - only 1 buffer is written to the texture at any time
			for (let i = 0; i < this._tileCreationCountPerFrame; i++) {
				let queueItem = this.tileCreateQueue.pop()
				if (queueItem === undefined) {
					this.hasUpdatedTiles = false	// Only after queue has been emptied
					break
				}

				// Skip if no longer required (= when requiredTiles changed before download finished)
				if (this.requiredTiles.some(tile => tile.equals(queueItem.tile)))
					this.tileStorage.createTile(queueItem.image, queueItem.tile)

				this.pendingTileIDs.delete(queueItem.tile.toString())
			}

			let {slices, positions} = this.tileStorage.constructBufferDataForTiles()
			tp.setTileIndexes(slices)
			tp.setTilePositions(positions)
		}

		tp.draw()
	}
}

export { TileLayer }