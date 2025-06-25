import { ShaderProgram } from "./ShaderProgram.js"

import vs from "./glsl/shift.vertex.glsl?raw"
import fs from "./glsl/shift.fragment.glsl?raw"

// Draws a texture ("map pane") adjusted for zoom & translation
class BufferShiftProgram extends ShaderProgram {
	constructor(context) {
		super(context)
		this.compile(vs, fs)
		let gl = context

		// Cache uniform locations
		this.pixelShiftUniformLocation   = gl.getUniformLocation(this.program, "pixelShift")
		this.resolutionUniformLocation = gl.getUniformLocation(this.program, "resolution")
		this.textureSamplerUniformLocation = gl.getUniformLocation(this.program, "textureSampler")
		this.depthSamplerUniformLocation   = gl.getUniformLocation(this.program, "depthSampler")

		// Cache attribute locations & activate them
		this.vertexPosAttributeLocation = gl.getAttribLocation(this.program, "vertexPos")
		gl.enableVertexAttribArray(this.vertexPosAttributeLocation)

		// Setup buffers to fill attributes
		this.vertexBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
		gl.vertexAttribPointer(this.vertexPosAttributeLocation, 2, gl.FLOAT, false, 0, 0)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 0,1, 1,0, 1,1]), gl.STATIC_DRAW)	// Mesh never changes

		// Samplers always use same texture units
		this.activate()
		gl.uniform1i(this.textureSamplerUniformLocation, 0)
		gl.uniform1i(this.depthSamplerUniformLocation, 1)
	}

	setPixelShift(x, y) {
		this.context.uniform2f(this.pixelShiftUniformLocation, x, y)
	}

	setResolution(width, height) {
		this.context.uniform2f(this.resolutionUniformLocation, width, height)
	}

	setColorTexture(texture) {
		this.colorTexture = texture
	}

	setDepthTexture(texture) {
		this.depthTexture = texture
	}

	draw() {
		let gl = this.context
		gl.useProgram(this.program)
		// Bind textures
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, this.colorTexture)
		gl.activeTexture(gl.TEXTURE1)
		gl.bindTexture(gl.TEXTURE_2D, this.depthTexture)
		//gl.activeTexture(gl.TEXTURE0)	// Restore default binding
		// Draw
		gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, 1)
	}
}

export { BufferShiftProgram }