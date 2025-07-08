import { MapLayer } from "./MapLayer"

import { TileProgram } from "../programs/SimpleTileProgram"
import { TileSource } from "../TileSource"
import { TileStorage } from "../TileStorage"

// TODO: From config
const MIN_ZOOM = 0
const PADDING = 100

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

		this.hasUpdatedArea = false

		this.requiredTiles = []

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
		let maxX = Math.ceil((this.centerX * gridScale + paddedWidth) / this.tileWidth)

		let paddedHeight = this.height / 2 + PADDING
		let minY = Math.floor((this.centerY * gridScale - paddedHeight) / this.tileHeight)
		let maxY = Math.ceil((this.centerY * gridScale + paddedHeight) / this.tileHeight)

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
		console.log(`${maxX-minX}x${maxY-minY} -> [${minX},${maxX}] & [${minY},${maxY}]`)
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

		for (let z = this.zoomLevel; z >= MIN_ZOOM; z-=1000) {
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
		console.log(this.requiredTiles)
	}

	fetchMissingTiles() {
			// Check available tiles
			let missingTiles = []
			for (let tile of this.requiredTiles) {
				let tileTexture = this.tileStorage.getTile(tile.x, tile.y, tile.z)
				if (!tileTexture)
					missingTiles.push(tile)
			}
			
			// TODO: Order by importance (lowest zoom, center of view etc.)
			missingTiles.reverse()

			// TODO: Filter tiles outside of valid range

			// Fetch tiles
			for (let tile of missingTiles) {
				this.tileSource.fetchTile(tile.x, tile.y, tile.z)
					.then(image => this.tileStorage.createTile(image, tile.x, tile.y, tile.z))
			}
	}

	render(time) {
		if (this.hasUpdatedArea === true) {
			this.hasUpdatedArea = false

			let hasUpdatedBounds = this.updateTileBounds()

			if (hasUpdatedBounds === true) {
				this.updateRequiredTiles()
				this.fetchMissingTiles()
			}
		}

		// Draw all available tiles
		let tp = this.tileProgram
		tp.activate()
		for (let tile of this.requiredTiles) {
			let texture = this.tileStorage.getTile(tile.x, tile.y, tile.z)
			if (texture) {
				tp.setTilePos(tile.x, tile.y, tile.z)
				tp.setTileTexture(texture)
				tp.draw()
			}
		}
	}
}

export { TileLayer }