import { ShaderProgram } from "./ShaderProgram.js";

import vs from "./glsl/pane.vertex.glsl?raw"
import fs from "./glsl/pane.fragment.glsl?raw"

// Draws a texture ("map pane") adjusted for zoom & translation
class MapPaneProgram extends ShaderProgram {
	constructor(context) {
		super(context)
		this.compile(vs, fs)
		let gl = context

		// Cache uniform locations
		this.resolutionUniformLocation = gl.getUniformLocation(this.program, "resolution")
		this.paneSizeUniformLocation   = gl.getUniformLocation(this.program, "paneSize")
		this.paneOffsetUniformLocation = gl.getUniformLocation(this.program, "paneOffset")
		this.paneZoomUniformLocation   = gl.getUniformLocation(this.program, "paneZoom")

		// Cache attribute locations & activate them
		this.vertexPosAttributeLocation = gl.getAttribLocation(this.program, "vertexPos")
		gl.enableVertexAttribArray(this.vertexPosAttributeLocation)

		// Setup buffers to fill attributes
		this.vertexBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
		gl.vertexAttribPointer(this.vertexPosAttributeLocation, 2, gl.FLOAT, false, 0, 0)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 0,1, 1,0, 1,1]), gl.STATIC_DRAW)	// Mesh never changes
	}

	setResolution(width, height) {
		this.context.uniform2f(this.resolutionUniformLocation, width, height)
	}

	setPaneSize(width, height) {
		this.context.uniform2f(this.paneSizeUniformLocation, width, height)
	}

	setPaneOffset(x, y) {
		this.context.uniform2f(this.paneOffsetUniformLocation, x, y)
	}

	setPaneZoom(zoom) {
		this.context.uniform1f(this.paneZoomUniformLocation, zoom)
	}

	setPaneTexture(texture) {
		this.texture = texture
	}

	draw() {
		let gl = this.context
		gl.useProgram(this.program)
		// Bind texture
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, this.texture)
		// Draw
		gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, 1)
	}
}

export { MapPaneProgram }