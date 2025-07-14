import { MapLayer } from "./MapLayer"

import { TileProgram } from "../programs/SimpleTileProgram"
import { TileSource } from "../TileSource"
import { TileStorage } from "../storage/TileStorage"

// TODO: From config
const MIN_ZOOM = 0
const PADDING = 0	// Used to fetch tiles outside of viewport (avoid empty tiles)

const MAX_TILE_CREATIONS_PER_FRAME = 8	// Empiric: 256x256 tiles take 1-2ms -> ~8 tiles @ 60fps are usually safe

class TileLayer extends MapLayer {
	constructor(config) {
		super(config)
		
		this.tileWidth = config.tileWidth
		this.tileHeight = config.tileHeight
		this.tileURL = config.tileURL
			
		this.tileProgram = new TileProgram(config.context)
		this.tileSource = new TileSource(this.tileURL)
		this.tileStorage = new TileStorage(config.context, this.tileWidth, this.tileHeight)

		//TEMP
		this.tileProgram.activate()
		this.tileProgram.setTileSize(this.tileWidth, this.tileHeight)
		this.tileProgram.setTileTexture(this.tileStorage.getTextureBinding())

		this.hasUpdatedArea = false
		this.hasUpdatedTiles = false

		this.requiredTiles = []

		this.tileCreateQueue = []

		// Required tiles are calculated from these values:
		// TODO: Into parent class MapLayer - these are required for all layers! Also handle change detection there...
		this.centerX = 0
		this.centerY = 0
		this.zoom = 0
		this.width = 1
		this.height = 1

		// Current tile grid bounds
		this.zoomLevel = 0
		this.tileMinX = 0
		this.tileMaxX = 0
		this.tileMinY = 0
		this.tileMaxY = 0
	}

	onPan(newCenterX, newCenterY) {
		this.hasUpdatedArea = true
		this.centerX = newCenterX
		this.centerY = newCenterY

		this.tileProgram.activate()
		this.tileProgram.setCenter(newCenterX, newCenterY)
	}

	onZoom(newZoom) {
		this.hasUpdatedArea = true
		this.zoom = newZoom
		this.zoomLevel = Math.floor(newZoom)

		this.tileProgram.activate()
		this.tileProgram.setZoom(newZoom)
	}

	onResize(newWidth, newHeight) {
		this.hasUpdatedArea = true
		this.width = newWidth
		this.height = newHeight

		this.tileProgram.activate()
		this.tileProgram.setResolution(newWidth, newHeight)
	}

	updateTileBounds() {
		let gridScale = Math.pow(2, this.zoomLevel)
		
		let paddedWidth = this.width / 2 + PADDING
		let minX = Math.floor((this.centerX * gridScale - paddedWidth) / this.tileWidth)
		let maxX = Math.floor((this.centerX * gridScale + paddedWidth) / this.tileWidth)

		let paddedHeight = this.height / 2 + PADDING
		let minY = Math.floor((this.centerY * gridScale - paddedHeight) / this.tileHeight)
		let maxY = Math.floor((this.centerY * gridScale + paddedHeight) / this.tileHeight)

		if (
			minX === this.tileMinX &&
			maxX === this.tileMaxX &&
			minY === this.tileMinY &&
			maxY === this.tileMaxY
		) return false

		this.tileMinX = minX
		this.tileMaxX = maxX
		this.tileMinY = minY
		this.tileMaxY = maxY
		console.log(`New Bounds: ${maxX-minX+1}x${maxY-minY+1} -> X: ${minX}-${maxX} & Y: ${minY}-${maxY}`)
		return true
	}

	getTileBounds() {
		return [
			this.tileMinX,
			this.tileMaxX,
			this.tileMinY,
			this.tileMaxY
		]
	}

	updateRequiredTiles() {
		this.requiredTiles = []

		let [minX, maxX, minY, maxY] = this.getTileBounds()

		for (let z = this.zoomLevel; z >= MIN_ZOOM; z--) {
			for (let x = minX; x <= maxX; x++) {
				for (let y = minY; y <= maxY; y++) {
					this.requiredTiles.push({x, y, z})
				}
			}

			// 1x1 tile covers entire canvas
			if (maxX <= minX && maxY <= minY)
				break

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

			// TODO: Filter tiles outside of valid range

			// Fetch tiles
			for (let tile of missingTiles) {
				this.tileSource.fetchTile(tile.x, tile.y, tile.z)
					.then(image => {
						this.hasUpdatedTiles = true
						this.tileCreateQueue.push({image, tile})
					})
			}
	}

	render(time) {
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