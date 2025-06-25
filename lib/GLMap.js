import { TileLayerProgram } from "./TileLayerProgram.js"

import { TileGridProgram } from "./TileGridProgram.js"
import { MapPaneProgram}  from "./MapPaneProgram.js"

import { TileSource } from "./TileSource.js"

import { RenderTarget } from "./RenderTarget.js"
import { MapPane } from "./MapPane.js"


class GLMap {
	textureCache = {}

	constructor(canvasElement, config) {
		if (!(canvasElement instanceof HTMLCanvasElement) && !(canvasElement instanceof OffscreenCanvas))
			throw new Error("Provided element is not a suitable canvas!")
		// Obtain rendering context
		let context = canvasElement.getContext("webgl2")
		if (context === null)
			throw new Error("WebGL2 is required but not available on this canvas!")
		this.context = context
		context.enable(context.DEPTH_TEST)	// Required to correctly stack tiles
	}

	setMapCenter(x, y) {
		this.mapCenterX = x
		this.mapCenterY = y

		let scale = Math.pow(2, this.mapZoom)
		let gridCenterX = Math.round(x * scale * 2) * 0.5	// Round to 0.5
		let paneOffsetX = 0 // Remaining offset
	}

	setMapZoom(zoom) {
		this.mapZoom = zoom
		// Always use tiles higher than native resolution
		let gridZoomLevel = Math.ceil(zoom)
		// Scale pane to match selected zoom
		let paneZoom = (1 - gridZoomLevel + zoom) * 0.5 + 0.5	// paneZoom e ]0.5, 1]
		// Update programs
		this.tg.activate()
		this.tg.setGridZoomLevel(gridZoomLevel)
		// Todo: Grid size

		this.mp.activate()
		this.mp.setPaneZoom(paneZoom)
		// Draw new tiles

	}

	// Simple test of shader program
	test() {
		let gl = this.context

		// Later each map pane will manage its own target, these will then be rendered by the map
		let target = new RenderTarget(gl, 1024, 768)
		let tilepane = new MapPane(gl, 1024, 768)

		// Grid program
		let tg = new TileGridProgram(gl)
		tg.activate()
		tg.setGridSize(4, 3)
		tg.setGridCenter(1, 1.5)
		tg.setGridZoomLevel(2)
		// Load images
		let s = new TileSource("https://s.rsg.sc/sc/images/games/GTAV/map/render/{z}/{x}/{y}.jpg")
		s.setCallback((img, x, y, zoom) => {
			// Re-use or create texture
			let id = `${x},${y},${zoom}`
			let cachedTexture = this.textureCache[id]
			let currentTexture
			if (cachedTexture) {
				currentTexture = cachedTexture
			} else {
				// Create texture
				currentTexture = gl.createTexture()
				gl.bindTexture(gl.TEXTURE_2D, currentTexture)
				gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, img)
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
				gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
				this.textureCache[id] = currentTexture
			}
			// Draw texture onto target
			tilepane.getTarget().activate()
			tg.activate()
			tg.setTilePosition(x, y, zoom)
			tg.setTileTexture(currentTexture)
			tg.draw()
		})
		
		//s.requestTiles(0, 0, 0, 0, 0)
		s.requestTiles(1, 1, 3, 3, 3)
		setTimeout(() => s.requestTiles(0, 0, 0, 0, 1), 1000)
		setTimeout(() => s.requestTiles(0, 1, 0, 0, 2), 2000)

		setTimeout(() => {
			/*
			tilepane.getTarget().activate()
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
			tg.activate()
			//tg.setGridZoomLevel(1)
			*/
			//s.requestTiles(0, 1, 0, 2, 2)
		}, 3000)

		// This shouldnt overdraw
		setTimeout(() => {
			//tilepane.shiftPixels(256, -256)
			tilepane.switchTargets()
		}, 4000)
		setTimeout(() => {
			// Should be behind other tiles, but in front of cleared background
			s.requestTiles(0,0,0,0,0)
			// Should be in front of everything
			s.requestTiles(4,4,4,4,4)
		}, 5000)

		setTimeout(() => tilepane.switchTargets(), 6000)

		// Main program
		let mp = new MapPaneProgram(gl)
		mp.activate()
		mp.setPaneOffset(0, 0)
		mp.setPaneSize(1024, 768)
		mp.setPaneZoom(1)
		mp.setPaneTexture(tilepane.getTarget().getColor())

		// Panning interaction test
		let canvasElement = gl.canvas
		canvasElement.addEventListener("pointerdown", (e1) => {
			console.log(e1.offsetX, e1.offsetY)
			let startX = e1.offsetX
			let startY = e1.offsetY

			function onDrag(e) {
				mp.setPaneOffset(e.offsetX - startX, e.offsetY - startY)
			}
			canvasElement.addEventListener("pointermove", onDrag)
			canvasElement.addEventListener("pointerup", () => {
				canvasElement.removeEventListener("pointermove", onDrag)
			})
		})

		// Render loop
		function render(time) {
			let w = gl.canvas.width
			let h = gl.canvas.height
			mp.activate()
			mp.setResolution(w, h)
			// Required because the target might be switched
			mp.setPaneTexture(tilepane.getTarget().getColor())
			gl.bindFramebuffer(gl.FRAMEBUFFER, null)	// Render to canvas
			gl.clearColor(1, 0, 0, 1)
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
			gl.viewport(0, 0, w, h)
			mp.draw()
			requestAnimationFrame(render)
		}
		render()

		this.tg = tg
		this.mp = mp
	}
}

export { GLMap }