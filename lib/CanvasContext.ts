class CanvasContext {
	constructor(canvasElement) {
		if (!(canvasElement instanceof HTMLCanvasElement) && !(canvasElement instanceof OffscreenCanvas))
			throw new Error("Provided element is not a suitable canvas!")

		// Obtain rendering context
		let gl = canvasElement.getContext("webgl2")
		if (gl === null)
			throw new Error("WebGL2 is required but not available on this canvas!")
		
		// Correctly stack tiles & do not cut off transparent markers
		gl.enable(gl.DEPTH_TEST)
		gl.depthFunc(gl.LEQUAL)
		gl.enable(gl.BLEND)
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

		this.context = gl
	}

	getContext() {
		return this.context
	}

	getCanvasElement() {
		return this.context.canvas
	}
}

export { CanvasContext }