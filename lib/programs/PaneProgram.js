import { ShaderProgram } from "./ShaderProgram"

import vs from "../glsl/pane.vertex.glsl?raw"
import fs from "../glsl/pane.fragment.glsl?raw"

class PaneProgram extends ShaderProgram {
	constructor(context) {
		super(context)
		this.compile(vs, fs)
		let gl = context

		// Cache uniform locations
		this.resolutionUniformLocation = gl.getUniformLocation(this.program, "resolution")
		this.sizeUniformLocation       = gl.getUniformLocation(this.program, "paneSize")
		this.offsetUniformLocation     = gl.getUniformLocation(this.program, "paneOffset")

		// Cache attribute locations & activate them
		this.vertexPosAttributeLocation = gl.getAttribLocation(this.program, "vertexPos")
		gl.enableVertexAttribArray(this.vertexPosAttributeLocation)

		// Setup buffers to fill attributes
		this.vertexBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
		gl.vertexAttribPointer(this.vertexPosAttributeLocation, 2, gl.FLOAT, false, 0, 0)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 0,1, 1,0, 1,1]), gl.STATIC_DRAW)	// Mesh never changes
	}

	// Uniform setter
	setResolution(width, height) {
		this.context.uniform2f(this.resolutionUniformLocation, width, height)
	}

	setPaneSize(width, height) {
		this.context.uniform2f(this.sizeUniformLocation, width, height)
	}

	setOffset(x, y) {
		this.context.uniform2f(this.offsetUniformLocation, x, y)
	}

	// Store texture
	setPaneTexture(texture) {
		this.texture = texture
	}

	draw() {
		let gl = this.context
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, this.texture)
		gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, 1)
	}
}

export { PaneProgram }