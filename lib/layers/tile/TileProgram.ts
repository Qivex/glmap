import { ElementProgram } from "../element/ElementProgram"

import vs from "./shader/tile.vertex.glsl?raw"
import fs from "./shader/tile.fragment.glsl?raw"

class TileProgram extends ElementProgram {
	tileSizeUniformLocation: WebGLUniformLocation | null

	texture: WebGLTexture

	constructor(context: WebGL2RenderingContext) {
		super(context)
		this.compile(vs, fs)
		let gl = context

		// Cache uniform locations
		this.tileSizeUniformLocation   = gl.getUniformLocation(this.program, "tileSize")

		// Store attributes
		this.attributeArray = gl.createVertexArray()
		gl.bindVertexArray(this.attributeArray)

		this.initDefaultMesh()
		this.initElementAttributes([
			{name: "tilePos", length: 2},
			{name: "tileZoom", length: 1},
			{name: "tileIndex", length: 1}
		])
	}

	// Uniform setter
	setTileSize(width: number, height: number) {
		this.context.uniform2f(this.tileSizeUniformLocation, width, height)
	}

	setTileTexture(texture: WebGLTexture) {
		this.texture = texture
	}

	draw() {
		let gl = this.context
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.texture)
		super.draw()
	}
}

export { TileProgram }