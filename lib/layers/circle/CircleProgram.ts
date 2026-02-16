import { ShaderProgram } from "../../ShaderProgram"

import vs from "./shader/circle.vertex.glsl?raw"
import fs from "./shader/circle.fragment.glsl?raw"

import type { Circle } from "./Circle"

class CircleProgram extends ShaderProgram {
	resolutionUniformLocation: WebGLUniformLocation | null
	centerUniformLocation: WebGLUniformLocation | null
	zoomUniformLocation: WebGLUniformLocation | null

	vertexPosAttributeLocation: number
	circlePosAttributeLocation: number
	radiusAttributeLocation: number
	colorAttributeLocation: number

	attributeArray: WebGLVertexArrayObject | null

	vertexBuffer: WebGLBuffer | null
	circleBuffer: WebGLBuffer | null
	radiusBuffer: WebGLBuffer | null
	colorBuffer: WebGLBuffer | null

	circleCount = 0

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
		this.circlePosAttributeLocation  = gl.getAttribLocation(this.program, "circlePos")
		this.radiusAttributeLocation     = gl.getAttribLocation(this.program, "radius")
		this.colorAttributeLocation      = gl.getAttribLocation(this.program, "color")
		gl.enableVertexAttribArray(this.vertexPosAttributeLocation)
		gl.enableVertexAttribArray(this.circlePosAttributeLocation)
		gl.enableVertexAttribArray(this.radiusAttributeLocation)
		gl.enableVertexAttribArray(this.colorAttributeLocation)

		// Setup buffers to fill attributes
		this.vertexBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
		gl.vertexAttribPointer(this.vertexPosAttributeLocation, 2, gl.FLOAT, false, 0, 0)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 0,1, 1,0, 1,1]), gl.STATIC_DRAW)	// Mesh never changes

		// Note: vertexAttribDivisor is used to pull buffer data once per instance (instead of per vertex)
		this.circleBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.circleBuffer)
		gl.vertexAttribPointer(this.circlePosAttributeLocation, 2, gl.FLOAT, false, 0, 0)
		gl.vertexAttribDivisor(this.circlePosAttributeLocation, 1)

		this.radiusBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.radiusBuffer)
		gl.vertexAttribPointer(this.radiusAttributeLocation, 1, gl.FLOAT, false, 0, 0)
		gl.vertexAttribDivisor(this.radiusAttributeLocation, 1)

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

	// Attribute buffer setter
	setCircles(circles: Set<Circle>) {
		this.circleCount = circles.size

		let pos: Array<number> = [],
		    rad: Array<number> = [],
		    col: Array<number> = []
		for (let circle of circles) {
			pos.push(...circle.center)
			rad.push(circle.radius)
			col.push(...circle.color)
		}

		let gl = this.context
		gl.bindBuffer(gl.ARRAY_BUFFER, this.circleBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.radiusBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(rad), gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(col), gl.STATIC_DRAW)
	}	

	draw() {
		let gl = this.context
		gl.bindVertexArray(this.attributeArray)
		gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.circleCount)
	}
}

export { CircleProgram }