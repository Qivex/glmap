import { ShaderProgram } from "../../lib/programs/ShaderProgram"

import vs from "./shader/arrow.vertex.glsl?raw"
import fs from "./shader/arrow.fragment.glsl?raw"

import type { Arrow } from "./Arrow"

class ArrowProgram extends ShaderProgram {
	resolutionUniformLocation: WebGLUniformLocation | null
	centerUniformLocation: WebGLUniformLocation | null
	zoomUniformLocation: WebGLUniformLocation | null

	vertexPosAttributeLocation: number
	startPosAttributeLocation: number
	endPosAttributeLocation: number
	headSizeAttributeLocation: number
	lineWidthAttributeLocation: number
	colorAttributeLocation: number
	periodAttributeLocation: number

	attributeArray: WebGLVertexArrayObject | null

	vertexBuffer: WebGLBuffer | null
	startBuffer: WebGLBuffer | null
	endBuffer: WebGLBuffer | null
	headSizeBuffer: WebGLBuffer | null
	lineWidthBuffer: WebGLBuffer | null
	colorBuffer: WebGLBuffer | null
	periodBuffer: WebGLBuffer | null

	arrowCount = 0

	constructor(context: WebGL2RenderingContext) {
		super(context)
		this.compile(vs, fs)
		let gl = context

		// Cache uniform locations
		this.resolutionUniformLocation = gl.getUniformLocation(this.program, "resolution")
		this.centerUniformLocation     = gl.getUniformLocation(this.program, "center")
		this.zoomUniformLocation       = gl.getUniformLocation(this.program, "zoom")

		// Store attributes
		this.attributeArray = gl.createVertexArray()
		gl.bindVertexArray(this.attributeArray)

		// Cache attribute locations & activate them
		this.vertexPosAttributeLocation  = gl.getAttribLocation(this.program, "vertexPos")
		this.startPosAttributeLocation   = gl.getAttribLocation(this.program, "startPos")
		this.endPosAttributeLocation     = gl.getAttribLocation(this.program, "endPos")
		this.headSizeAttributeLocation   = gl.getAttribLocation(this.program, "headSize")
		this.lineWidthAttributeLocation  = gl.getAttribLocation(this.program, "lineWidth")
		this.colorAttributeLocation      = gl.getAttribLocation(this.program, "color")
		this.periodAttributeLocation     = gl.getAttribLocation(this.program, "headPeriod")
		gl.enableVertexAttribArray(this.vertexPosAttributeLocation)
		gl.enableVertexAttribArray(this.startPosAttributeLocation)
		gl.enableVertexAttribArray(this.endPosAttributeLocation)
		gl.enableVertexAttribArray(this.headSizeAttributeLocation)
		gl.enableVertexAttribArray(this.lineWidthAttributeLocation)
		gl.enableVertexAttribArray(this.colorAttributeLocation)
		gl.enableVertexAttribArray(this.periodAttributeLocation)

		// Setup buffers to fill attributes
		this.vertexBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
		gl.vertexAttribPointer(this.vertexPosAttributeLocation, 2, gl.FLOAT, false, 0, 0)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 0,1, 1,0, 1,1]), gl.STATIC_DRAW)	// Mesh never changes

		// Note: vertexAttribDivisor is used to pull buffer data once per instance (instead of per vertex)
		this.startBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.startBuffer)
		gl.vertexAttribPointer(this.startPosAttributeLocation, 2, gl.FLOAT, false, 0, 0)
		gl.vertexAttribDivisor(this.startPosAttributeLocation, 1)

		this.endBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.endBuffer)
		gl.vertexAttribPointer(this.endPosAttributeLocation, 2, gl.FLOAT, false, 0, 0)
		gl.vertexAttribDivisor(this.endPosAttributeLocation, 1)

		this.headSizeBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.headSizeBuffer)
		gl.vertexAttribPointer(this.headSizeAttributeLocation, 2, gl.FLOAT, false, 0, 0)
		gl.vertexAttribDivisor(this.headSizeAttributeLocation, 1)

		this.lineWidthBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.lineWidthBuffer)
		gl.vertexAttribPointer(this.lineWidthAttributeLocation, 1, gl.FLOAT, false, 0, 0)
		gl.vertexAttribDivisor(this.lineWidthAttributeLocation, 1)

		this.colorBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
		gl.vertexAttribPointer(this.colorAttributeLocation, 4, gl.FLOAT, false, 0, 0)
		gl.vertexAttribDivisor(this.colorAttributeLocation, 1)

		this.periodBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.periodBuffer)
		gl.vertexAttribPointer(this.periodAttributeLocation, 1, gl.FLOAT, false, 0, 0)
		gl.vertexAttribDivisor(this.periodAttributeLocation, 1)
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

	// Attribute buffer setter
	setArrows(arrows: Set<Arrow>) {
		this.arrowCount = arrows.size

		let sta: Array<number> = [],
		    end: Array<number> = [],
		    headSizes: Array<number> = [],
			lineWidths: Array<number> = [],
			colors: Array<number> = [],
			periods: Array<number> = []
		for (let arrow of arrows) {
			sta.push(...arrow.startPoint)
			end.push(...arrow.endPoint)
			headSizes.push(...arrow.headSize)
			lineWidths.push(arrow.lineWidth)
			colors.push(...arrow.color)
			periods.push(arrow.headPeriod)
		}

		let gl = this.context
		gl.bindBuffer(gl.ARRAY_BUFFER, this.startBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sta), gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.endBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(end), gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.headSizeBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(headSizes), gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.lineWidthBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lineWidths), gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.periodBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(periods), gl.STATIC_DRAW)
	}	

	draw() {
		let gl = this.context
		gl.bindVertexArray(this.attributeArray)
		gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.arrowCount)
	}
}

export { ArrowProgram }