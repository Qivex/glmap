import { TileLayerProgram } from "./TileLayerProgram.js"

class GLMap {
	constructor(canvasElement, config) {
		if (!(canvasElement instanceof HTMLCanvasElement) && !(canvasElement instanceof OffscreenCanvas))
			throw new Error("Provided element is not a suitable canvas!")
		// Obtain rendering context
		let context = canvasElement.getContext("webgl2")
		if (context === null)
			throw new Error("WebGL2 is required but not available on this canvas!")
		// Test
		this.t = new TileLayerProgram(context)
	}
}

export { GLMap }