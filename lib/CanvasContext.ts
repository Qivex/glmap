class CanvasContext {
	context: WebGL2RenderingContext

	constructor(canvasElement: HTMLCanvasElement) {
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
		return this.context.canvas as HTMLCanvasElement
	}
}

export { CanvasContext }