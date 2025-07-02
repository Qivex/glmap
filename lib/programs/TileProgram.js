import { ShaderProgram } from "./ShaderProgram"

import vs from "../glsl/tile.vertex.glsl?raw"
import fs from "../glsl/tile.fragment.glsl?raw"

class TileProgram extends ShaderProgram {
	constructor(context) {
		super(context)
		this.compile(vs, fs)
		let gl = context

		// Cache uniform locations
		this.gridSizeUniformLocation = gl.getUniformLocation(this.program, "gridSize")
		this.centerUniformLocation   = gl.getUniformLocation(this.program, "gridCenter")
		this.zoomUniformLocation     = gl.getUniformLocation(this.program, "gridZoomLevel")

		// Cache attribute locations & activate them
		this.vertexPosAttributeLocation = gl.getAttribLocation(this.program, "vertexPos")
		this.tilePosAttributeLocation   = gl.getAttribLocation(this.program, "tilePos")
		gl.enableVertexAttribArray(this.vertexPosAttributeLocation)
		gl.enableVertexAttribArray(this.tilePosAttributeLocation)

		// Setup buffers to fill attributes
		this.vertexBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
		gl.vertexAttribPointer(this.vertexPosAttributeLocation, 2, gl.FLOAT, false, 0, 0)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 0,1, 1,0, 1,1]), gl.STATIC_DRAW)	// Mesh never changes

		// Note: vertexAttribDivisor is used to pull buffer data once per instance (instead of per vertex)
		this.tileBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tileBuffer)
		gl.vertexAttribPointer(this.tilePosAttributeLocation, 3, gl.FLOAT, false, 0, 0)
		gl.vertexAttribDivisor(this.tilePosAttributeLocation, 1)
	}

	// Uniform setter
	setGridSize(width, height) {
		this.context.uniform2f(this.gridSizeUniformLocation, width, height)
	}

	setCenter(x, y) {
		this.context.uniform2f(this.centerUniformLocation, x, y)
	}

	setZoom(zoom) {
		this.context.uniform1f(this.zoomUniformLocation, zoom)
	}

	// Attribute buffer setter
	setTilePos(x, y, zoom) {
		let gl = this.context
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tileBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x, y, zoom]), gl.STATIC_DRAW)
	}

	// Store texture
	setTileTexture(texture) {
		this.texture = texture
	}

	draw() {
		let gl = this.context
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, this.texture)
		gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, 1)
	}
}

export { TileProgram }