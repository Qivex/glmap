import { ShaderProgram } from "./ShaderProgram"

import vs from "../glsl/tile.vertex.glsl?raw"
import fs from "../glsl/tile.fragment.glsl?raw"

class TileProgram extends ShaderProgram {
	constructor(context: WebGL2RenderingContext) {
		super(context)
		this.compile(vs, fs)
		let gl = context

		// Cache uniform locations
		this.resolutionUniformLocation = gl.getUniformLocation(this.program, "resolution")
		this.tileSizeUniformLocation   = gl.getUniformLocation(this.program, "tileSize")
		this.centerUniformLocation     = gl.getUniformLocation(this.program, "center")
		this.zoomUniformLocation       = gl.getUniformLocation(this.program, "zoom")

		// Store attributes
		this.attributeArray = gl.createVertexArray()
		gl.bindVertexArray(this.attributeArray)

		// Cache attribute locations & activate them
		this.vertexPosAttributeLocation = gl.getAttribLocation(this.program, "vertexPos")
		this.tilePosAttributeLocation   = gl.getAttribLocation(this.program, "tilePos")
		this.tileIndexAttributeLocation = gl.getAttribLocation(this.program, "tileIndex")
		gl.enableVertexAttribArray(this.vertexPosAttributeLocation)
		gl.enableVertexAttribArray(this.tilePosAttributeLocation)
		gl.enableVertexAttribArray(this.tileIndexAttributeLocation)

		// Setup buffers to fill attributes
		this.vertexBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
		gl.vertexAttribPointer(this.vertexPosAttributeLocation, 2, gl.FLOAT, false, 0, 0)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 0,1, 1,0, 1,1]), gl.STATIC_DRAW)	// Mesh never changes

		// Note: vertexAttribDivisor is used to pull buffer data once per instance (instead of per vertex)
		this.tilePosBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tilePosBuffer)
		gl.vertexAttribPointer(this.tilePosAttributeLocation, 3, gl.FLOAT, false, 0, 0)
		gl.vertexAttribDivisor(this.tilePosAttributeLocation, 1)

		this.tileIndexBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tileIndexBuffer)
		gl.vertexAttribPointer(this.tileIndexAttributeLocation, 1, gl.FLOAT, false, 0, 0)
		gl.vertexAttribDivisor(this.tileIndexAttributeLocation, 1)
	}

	// Uniform setter
	setResolution(width, height) {
		this.context.uniform2f(this.resolutionUniformLocation, width, height)
	}

	setTileSize(width, height) {
		this.context.uniform2f(this.tileSizeUniformLocation, width, height)
	}

	setCenter(x, y) {
		this.context.uniform2f(this.centerUniformLocation, x, y)
	}

	setZoom(zoom) {
		this.context.uniform1f(this.zoomUniformLocation, zoom)
	}

	// Attribute buffer setter
	setTilePositions(positions) {
		let gl = this.context
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tilePosBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
	}

	setTileIndexes(indexes) {
		this.tileCount = indexes.length
		let gl = this.context
		gl.bindBuffer(gl.ARRAY_BUFFER, this.tileIndexBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(indexes), gl.STATIC_DRAW)
	}

	// Store texture
	setTileTexture(texture) {
		this.texture = texture
	}

	draw() {
		let gl = this.context
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.texture)
		gl.bindVertexArray(this.attributeArray)
		gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.tileCount)
	}
}

export { TileProgram }