import { ElementProgram } from "../element/ElementProgram"

import vs from "./shader/marker.vertex.glsl?raw"
import fs from "./shader/marker.fragment.glsl?raw"

class MarkerProgram extends ElementProgram {
	dataTexture: WebGLTexture
	iconTexture: WebGLTexture

	constructor(context: WebGL2RenderingContext) {
		super(context)
		this.compile(vs, fs)
		let gl = context

		// Store attributes
		this.attributeArray = gl.createVertexArray()
		gl.bindVertexArray(this.attributeArray)

		this.initDefaultMesh()
		this.initElementAttributes([
			{name: "markerPos", length: 2},
			{name: "iconIndex", length: 1}
		])

		// Set texture units
		this.activate()
		gl.uniform1i(gl.getUniformLocation(this.program, "iconData"), 0)
		gl.uniform1i(gl.getUniformLocation(this.program, "icons"   ), 1)
	}

	// Store textures
	setIconDataTexture(texture: WebGLTexture) {
		this.dataTexture = texture
	}

	setMarkerTexture(texture: WebGLTexture) {
		this.iconTexture = texture
	}	

	draw() {
		let gl = this.context
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, this.dataTexture)
		gl.activeTexture(gl.TEXTURE1)
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.iconTexture)
		super.draw()
	}
}

export { MarkerProgram }