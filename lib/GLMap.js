import { TileGridProgram } from "./TileGridProgram.js"
import { MapPaneProgram}  from "./MapPaneProgram.js"

import { TileSource } from "./TileSource.js"


class GLMap {
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

		// Setup frame buffer
		let testBuffer = gl.createFramebuffer()
		gl.bindFramebuffer(gl.FRAMEBUFFER, testBuffer)

		let colorbufferTex = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D, colorbufferTex)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 512, 768, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)	// Without this the output is full black...
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, colorbufferTex, 0)

		let depthbufferTex = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D, depthbufferTex)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, 512, 768, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null)
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depthbufferTex, 0)

		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)	// Required to fill the textures (otherwise alignment is broken)
		

		// Grid program
		let tg = new TileGridProgram(gl)
		tg.activate()
		tg.setGridSize(2, 3)
		tg.setGridCenter(1, 1.5)
		tg.setGridZoomLevel(2)
		// Load images
		let s = new TileSource("https://s.rsg.sc/sc/images/games/GTAV/map/render/{z}/{x}/{y}.jpg")
		s.setCallback((img, x, y, zoom) => {
			// Create texture
			let tex = gl.createTexture()
			gl.bindTexture(gl.TEXTURE_2D, tex)
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 256, 256, 0, gl.RGBA, gl.UNSIGNED_BYTE, img)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
			// Draw texture
			tg.activate()
			tg.setTilePosition(x, y, zoom)
			tg.setTileTexture(tex)
			gl.bindFramebuffer(gl.FRAMEBUFFER, testBuffer)	// Render onto framebuffer
			gl.viewport(0, 0, 512, 768)
			tg.draw()
		})
		
		s.requestTiles(0, 0, 0, 0, 0)
		s.requestTiles(1, 1, 4, 4, 3)
		setTimeout(() => s.requestTiles(0, 0, 0, 0, 1), 1000)
		setTimeout(() => s.requestTiles(0, 1, 0, 0, 2), 2000)
		


		// Main program
		let mp = new MapPaneProgram(gl)
		mp.activate()
		mp.setPaneOffset(30, 30)
		mp.setPaneSize(512, 768)
		mp.setPaneZoom(1)
		mp.setPaneTexture(colorbufferTex)

		// Render loop
		function render(time) {
			let w = gl.canvas.width
			let h = gl.canvas.height
			mp.activate()
			mp.setResolution(w, h)
			//mp.setPaneZoom(1 - (time%4000)/4000)	// Test for smooth movement
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