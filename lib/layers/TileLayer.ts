import { MapLayer } from "./MapLayer.ts"

import { TileProgram } from "../programs/TileProgram.ts"
import { TileSource } from "../TileSource.ts"
import { TileStorage } from "../storage/TileStorage.ts"

import type { TileLayerConfig, TileBoundsType, TilePositionType, QueueItemType } from "../types/types.ts"



// TODO: From config
const PADDING = 0	// Used to fetch tiles outside of viewport (avoid empty tiles)

const MAX_TILE_CREATIONS_PER_FRAME = 8	// Empiric: 256x256 tiles take 1-2ms -> ~8 tiles @ 60fps are usually safe


function compareTileBounds(t1: TileBoundsType, t2: TileBoundsType) {
	return (t1.minX === t2.minX &&
			t1.maxX === t2.maxX &&
			t1.minY === t2.minY &&
			t1.maxY === t2.maxY &&
			t1.minZoom === t2.minZoom &&
			t1.maxZoom === t2.maxZoom)
}

function compareTilePositions(t1: TilePositionType, t2: TilePositionType) {
	return (t1.x === t2.x &&
			t1.y === t2.y &&
			t1.z === t2.z)
}


class TileLayer extends MapLayer {
	tileWidth = 256
	tileHeight = 256

	tileProgram: TileProgram
	tileSource: TileSource
	tileStorage: TileStorage

	hasUpdatedArea = false
	hasUpdatedTiles = false

	requiredTiles: Array<TilePositionType> = []
	tileCreateQueue: Array<QueueItemType> = []

	tileBounds: TileBoundsType = {minX: 0, maxX: 0, minY: 0, maxY: 0, minZoom: 0, maxZoom: 0}	// Tiles for current view
	tileLimits?: TileBoundsType	// Available tiles

	constructor(config: TileLayerConfig) {
		super(config)
		
		const {
			context,
			tileWidth = 256,
			tileHeight = 256,
			tileURL,
			tileLimits
		} = config
		Object.assign(this, {tileWidth, tileHeight, tileLimits})
			
		this.tileProgram = new TileProgram(context)
		this.tileSource = new TileSource(tileURL)
		this.tileStorage = new TileStorage(context, tileWidth, tileHeight)

		this.tileProgram.activate()
		this.tileProgram.setTileSize(this.tileWidth, this.tileHeight)
		this.tileProgram.setTileTexture(this.tileStorage.getTextureBinding())
	}

	onPan(newCenterX: number, newCenterY: number) {
		this.hasUpdatedArea = true

		this.tileProgram.activate()
		this.tileProgram.setCenter(newCenterX, newCenterY)
	}

	onZoom(newZoom: number) {
		this.hasUpdatedArea = true

		this.tileProgram.activate()
		this.tileProgram.setZoom(newZoom)
	}

	onResize(newWidth: number, newHeight: number) {
		this.hasUpdatedArea = true

		this.tileProgram.activate()
		this.tileProgram.setResolution(newWidth, newHeight)
	}

	// Not required
	onHover() {}
	onClick() {}

	updateTileBounds(): boolean {
		let zoomLevel = Math.floor(this.zoom + 0.5)

		if (this.tileLimits) {
			if (zoomLevel < this.tileLimits.minZoom) zoomLevel = Math.ceil(this.tileLimits.minZoom)
			if (zoomLevel > this.tileLimits.maxZoom) zoomLevel = Math.floor(this.tileLimits.maxZoom)
		}

		let viewScale = Math.pow(2, this.zoom)

		// Add padding to viewport
		let paddedWidth  = (this.width  / 2 + PADDING) / viewScale,
			paddedHeight = (this.height / 2 + PADDING) / viewScale

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
					this.requiredTiles.push({x, y, z})
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
			// Check available tiles
			let missingTiles = []
			for (let tile of this.requiredTiles) {
				let slot = this.tileStorage.findTile(tile)
				if (!slot)
					missingTiles.push(tile)
			}
			
			// TODO: Order by importance (lowest zoom, center of view etc.)
			missingTiles.reverse()

			// Fetch tiles
			for (let tile of missingTiles) {
				this.tileSource.fetchTile(tile.x, tile.y, tile.z)
					.then(image => {
						this.hasUpdatedTiles = true
						this.tileCreateQueue.push({image, tile})
					})
			}
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
			for (let i = 0; i < MAX_TILE_CREATIONS_PER_FRAME; i++) {
				let queueItem = this.tileCreateQueue.pop()
				if (queueItem === undefined) {
					this.hasUpdatedTiles = false	// Only set when queue is empty
					break
				}
				// Skip if no longer required (= when requiredTiles changed before download finished)
				if (this.requiredTiles.some(tile => compareTilePositions(queueItem.tile, tile)))
					this.tileStorage.createTile(queueItem.image, queueItem.tile)
			}

			let {slices, positions} = this.tileStorage.constructBufferDataForTiles()
			tp.setTileIndexes(slices)
			tp.setTilePositions(positions)
		}

		tp.draw()
	}
}

export { TileLayer }