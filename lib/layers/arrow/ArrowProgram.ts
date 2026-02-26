import { ElementProgram } from "../element/ElementProgram"

import vs from "./shader/arrow.vertex.glsl?raw"
import fs from "./shader/arrow.fragment.glsl?raw"

class ArrowProgram extends ElementProgram {
	lineWidthUniformLocation: WebGLUniformLocation | null
	headPeriodUnformLocation: WebGLUniformLocation | null
	headWidthUniformLocation: WebGLUniformLocation | null
	headHeightUniformLocation: WebGLUniformLocation | null

	arrowCount = 0
	texture: WebGLTexture

	constructor(context: WebGL2RenderingContext) {
		super(context)
		this.compile(vs, fs)
		let gl = context

		// Cache uniform locations
		this.lineWidthUniformLocation  = gl.getUniformLocation(this.program, "lineWidth")
		this.headPeriodUnformLocation  = gl.getUniformLocation(this.program, "headPeriod")
		this.headWidthUniformLocation  = gl.getUniformLocation(this.program, "headWidth")
		this.headHeightUniformLocation = gl.getUniformLocation(this.program, "headHeight")

		// Store attributes
		this.attributeArray = gl.createVertexArray()
		gl.bindVertexArray(this.attributeArray)

		this.initDefaultMesh()
		this.initElementAttributes([
			{name: "arrowCoords", length: 4},
			{name: "color", length: 4}
		])
	}

	// Uniform setter
	setLineWidth(width: number) {
		this.context.uniform1f(this.lineWidthUniformLocation, width)
	}

	setArrowPeriod(period: number) {
		this.context.uniform1f(this.headPeriodUnformLocation, period)
	}

	setArrowHead(width: number, height: number, shape: TexImageSource) {
		let gl = this.context
		gl.uniform1f(this.headWidthUniformLocation, width)
		gl.uniform1f(this.headHeightUniformLocation, height)
		// TODO: Shape texture is only required for alpha, RGBA is wasteful
		let texture = gl.createTexture()
		if (texture === null)
			throw new Error("Texture creation failed")
		gl.bindTexture(gl.TEXTURE_2D, texture)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, shape)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		this.texture = texture
	}	

	draw() {
		let gl = this.context
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, this.texture)
		super.draw()
	}
}

export { ArrowProgram }