import { TileGridProgram } from "./TileGridProgram.js"
import { MapPaneProgram}  from "./MapPaneProgram.js"

import { TileSource } from "./TileSource.js"

import { RenderTarget } from "./RenderTarget.js"


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

	// Simple test of shader program
	test() {
		let gl = this.context

		// Later each map pane will manage its own target, these will then be rendered by the map
		let target = new RenderTarget(gl, 512, 768)

		// Grid program
		let tg = new TileGridProgram(gl)
		tg.activate()
		tg.setGridSize(2, 3)
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
			target.activate()
			tg.activate()
			tg.setTilePosition(x, y, zoom)
			tg.setTileTexture(currentTexture)
			tg.draw()
		})
		
		s.requestTiles(0, 0, 0, 0, 0)
		s.requestTiles(1, 1, 4, 4, 3)
		setTimeout(() => s.requestTiles(0, 0, 0, 0, 1), 1000)
		setTimeout(() => s.requestTiles(0, 1, 0, 0, 2), 2000)

		setTimeout(() => {
			target.activate()
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
			tg.activate()
			tg.setGridZoomLevel(1)
			s.requestTiles(0, 1, 0, 2, 2)
		}, 3000)

		// This shouldnt overdraw
		setTimeout(() => s.requestTiles(0, 0, 0, 0, 0), 4000)

		// Main program
		let mp = new MapPaneProgram(gl)
		mp.activate()
		mp.setPaneOffset(0, 0)
		mp.setPaneSize(512, 768)
		mp.setPaneZoom(1)
		mp.setPaneTexture(target.getColor())

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
			gl.bindFramebuffer(gl.FRAMEBUFFER, null)	// Render to canvas
			gl.clearColor(1, 0, 0, 1)
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
			gl.viewport(0, 0, w, h)
			mp.draw()
			requestAnimationFrame(render)
		}
		render()
	}
}

export { GLMap }