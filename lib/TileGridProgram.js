import { ShaderProgram } from "./ShaderProgram.js";

import vs from "./glsl/grid.vertex.glsl?raw"
import fs from "./glsl/grid.fragment.glsl?raw"

// Draws all tiles of a single zoom level
class TileGridProgram extends ShaderProgram {
	constructor(context) {
		super(context)
		this.compile(vs, fs)
		let gl = context

		// Cache uniform locations
		this.gridSizeUniformLocation      = gl.getUniformLocation(this.program, "gridSize")
		this.gridCenterUniformLocation    = gl.getUniformLocation(this.program, "gridCenter")
		this.gridZoomLevelUniformLocation = gl.getUniformLocation(this.program, "gridZoomLevel")

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

		this.tileBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tileBuffer)
		gl.vertexAttribPointer(this.tilePosAttributeLocation, 3, gl.FLOAT, false, 0, 0)
		gl.vertexAttribDivisor(this.tilePosAttributeLocation, 1)
	}

	activate() {
		this.context.useProgram(this.program)
	}

	setGridSize(width, height) {
		this.context.uniform2f(this.gridSizeUniformLocation, width, height)
	}

	setGridCenter(x, y) {
		this.context.uniform2f(this.gridCenterUniformLocation, x, y)
	}

	setGridZoomLevel(zoom) {
		this.context.uniform1f(this.gridZoomLevelUniformLocation, zoom)
	}

	setTilePosition(x, y, zoom) {
		let gl = this.context
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tileBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x, y, zoom]), gl.STATIC_DRAW)
	}

	setTileTexture(texture) {
		let gl = this.context
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, texture)
	}

	draw() {
		let gl = this.context
		gl.useProgram(this.program)
		gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, 1)
	}
}

export { TileGridProgram }