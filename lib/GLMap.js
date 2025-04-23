import { TileLayerProgram } from "./TileLayerProgram.js"
import { TileGridProgram } from "./TileGridProgram.js"
import { TileSource } from "./TileSource.js"

function loadImages(urls) {
	return new Promise((resolve) => {
		var images = []
		var remaining = urls.length
		for (let i=0; i<remaining; i++) {
			let img = new Image()
			images.push(img)
			img.crossOrigin = "anonymous"
			img.src = urls[i]
			img.onload = function() {
				if (--remaining == 0)
					resolve(images)
			}
		}
	})
}

let testURLs = [
	"https://s.rsg.sc/sc/images/games/GTAV/map/render/0/0/0.jpg",
	"https://s.rsg.sc/sc/images/games/GTAV/map/render/2/0/0.jpg",
	"https://s.rsg.sc/sc/images/games/GTAV/map/render/2/0/1.jpg",
	"https://s.rsg.sc/sc/images/games/GTAV/map/render/2/0/2.jpg",
	"https://s.rsg.sc/sc/images/games/GTAV/map/render/2/1/0.jpg",
	"https://s.rsg.sc/sc/images/games/GTAV/map/render/2/1/1.jpg"
]

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
		// Init program
		let tg = new TileGridProgram(gl)
		tg.activate()
		tg.setGridSize(6, 3)
		tg.setGridCenter(1, 1.5)
		tg.setGridZoomLevel(3)
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
			tg.draw()
		})
		
		s.requestTiles(0, 1, 0, 2, 2)

		/*
		// Render loop
		let t = new TileLayerProgram(gl)
		t.setCenter(64, 96)
		t.setZoom(2)
		function render() {
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
			t.setResolution(gl.drawingBufferWidth, gl.drawingBufferHeight)
			t.draw()
			requestAnimationFrame(render)
		}
		render()
		*/
	}
}

export { GLMap }