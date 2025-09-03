import { ShaderProgram } from "../../lib/programs/ShaderProgram"

import vs from "./shader/arrow.vertex.glsl?raw"
import fs from "./shader/arrow.fragment.glsl?raw"

import type { Arrow } from "./Arrow"

class ArrowProgram extends ShaderProgram {
	resolutionUniformLocation: WebGLUniformLocation | null
	centerUniformLocation: WebGLUniformLocation | null
	zoomUniformLocation: WebGLUniformLocation | null
	lineWidthUniformLocation: WebGLUniformLocation | null
	headPeriodUnformLocation: WebGLUniformLocation | null
	headWidthUniformLocation: WebGLUniformLocation | null
	headHeightUniformLocation: WebGLUniformLocation | null

	vertexPosAttributeLocation: number
	arrowCoordsAttributeLocation: number
	colorAttributeLocation: number

	attributeArray: WebGLVertexArrayObject | null

	vertexBuffer: WebGLBuffer | null
	coordBuffer: WebGLBuffer | null
	colorBuffer: WebGLBuffer | null

	arrowCount = 0
	texture: WebGLTexture

	constructor(context: WebGL2RenderingContext) {
		super(context)
		this.compile(vs, fs)
		let gl = context

		// Cache uniform locations
		this.resolutionUniformLocation = gl.getUniformLocation(this.program, "resolution")
		this.centerUniformLocation     = gl.getUniformLocation(this.program, "center")
		this.zoomUniformLocation       = gl.getUniformLocation(this.program, "zoom")
		this.lineWidthUniformLocation  = gl.getUniformLocation(this.program, "lineWidth")
		this.headPeriodUnformLocation  = gl.getUniformLocation(this.program, "headPeriod")
		this.headWidthUniformLocation  = gl.getUniformLocation(this.program, "headWidth")
		this.headHeightUniformLocation = gl.getUniformLocation(this.program, "headHeight")

		// Store attributes
		this.attributeArray = gl.createVertexArray()
		gl.bindVertexArray(this.attributeArray)

		// Cache attribute locations & activate them
		this.vertexPosAttributeLocation   = gl.getAttribLocation(this.program, "vertexPos")
		this.arrowCoordsAttributeLocation = gl.getAttribLocation(this.program, "arrowCoords")
		this.colorAttributeLocation       = gl.getAttribLocation(this.program, "color")
		gl.enableVertexAttribArray(this.vertexPosAttributeLocation)
		gl.enableVertexAttribArray(this.arrowCoordsAttributeLocation)
		gl.enableVertexAttribArray(this.colorAttributeLocation)

		// Setup buffers to fill attributes
		this.vertexBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
		gl.vertexAttribPointer(this.vertexPosAttributeLocation, 2, gl.FLOAT, false, 0, 0)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 0,1, 1,0, 1,1]), gl.STATIC_DRAW)	// Mesh never changes

		// Note: vertexAttribDivisor is used to pull buffer data once per instance (instead of per vertex)
		this.coordBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer)
		gl.vertexAttribPointer(this.arrowCoordsAttributeLocation, 4, gl.FLOAT, false, 0, 0)
		gl.vertexAttribDivisor(this.arrowCoordsAttributeLocation, 1)

		this.colorBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
		gl.vertexAttribPointer(this.colorAttributeLocation, 4, gl.FLOAT, false, 0, 0)
		gl.vertexAttribDivisor(this.colorAttributeLocation, 1)
	}

	// Uniform setter
	setResolution(width: number, height: number) {
		this.context.uniform2f(this.resolutionUniformLocation, width, height)
	}

	setCenter(x: number, y: number) {
		this.context.uniform2f(this.centerUniformLocation, x, y)
	}

	setZoom(zoom: number) {
		this.context.uniform1f(this.zoomUniformLocation, zoom)
	}

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

	// Attribute buffer setter
	setArrows(arrows: Set<Arrow>) {
		this.arrowCount = arrows.size

		let coords: Array<number> = [],
			colors: Array<number> = []
		for (let arrow of arrows) {
			coords.push(...arrow.startPoint)
			coords.push(...arrow.endPoint)
			colors.push(...arrow.color)
		}

		let gl = this.context
		gl.bindBuffer(gl.ARRAY_BUFFER, this.coordBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
	}	

	draw() {
		let gl = this.context
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D, this.texture)
		gl.bindVertexArray(this.attributeArray)
		gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.arrowCount)
	}
}

export { ArrowProgram }