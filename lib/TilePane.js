import { RenderTarget } from "./RenderTarget.js"
import { TileSource } from "./TileSource.js"


class TilePane {
	constructor(gl) {
		this.context = gl
		
		// CONFIG START

		// Pixel dimensions of each tile
		let tileWidth = 256
		let tileHeight = 256

		// Additional distance between buffer- and canvas edge to avoid visible cleared pixels
		let offscreenMargin = 100

		// Template for fetching tile images
		let tileURLTemplate = "https://s.rsg.sc/sc/images/games/GTAV/map/render/{z}/{x}/{y}.jpg"

		// CONFIG END



		// Calculate grid dimensions from canvas size
		let gridWidth  = Math.ceil((gl.canvas.width  + offscreenMargin) / tileWidth )
		let gridHeight = Math.ceil((gl.canvas.height + offscreenMargin) / tileHeight)

		// Create fitting RenderTarget
		let targetWidth  = gridWidth  * tileWidth
		let targetHeight = gridHeight * tileHeight
		this.target = new RenderTarget(gl, targetWidth, targetHeight)
		
		// Create TileSource
		this.source = new TileSource(tileURLTemplate)

		

		// Test
		this.setMapCenter(1/4, 1.5/4)
		this.setMapZoom(2)

		// TODO: Re-Render only when Grid-Uniforms change
	}

	setMapCenter(x, y) {
		// TODO: This calculation is pretty complex but is only needed rarely: when the grid shifts
		this.mapCenterX = x
		this.mapCenterY = y

		// Update uniforms
		let scale = Math.pow(2, this.mapZoom)

		let gridCenterX = Math.round(x * scale * 2) / 2
		let gridCenterY = Math.round(x * scale * 2) / 2

		let paneOffsetX = ((gridCenterX / scale) - x) * tileWidth
		let paneOffsetY = ((gridCenterY / scale) - y) * tileHeight
	}

	setMapZoom(zoom) {
		this.mapZoom = zoom

		// Update uniforms
		this.gridZoomLevel = 0
		this.gridCenter = []
		this.paneZoom = 0
		this.paneOffset = []
	}



}

export { TilePane }