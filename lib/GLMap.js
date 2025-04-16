import { TileLayerProgram } from "./TileLayerProgram.js"

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
		// Load images
		loadImages(testURLs)
			.then(images => {
				t.setTileLocations([
					{x:0,y:0,z:0,slice:0},
					{x:0,y:0,z:2,slice:1},
					{x:0,y:1,z:2,slice:2},
					{x:0,y:2,z:2,slice:3},
					{x:1,y:0,z:2,slice:4},
					{x:1,y:1,z:2,slice:5}
				])
				t.setTileTextures(images, 256, 256)
			})
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
		
	}
}

export { GLMap }