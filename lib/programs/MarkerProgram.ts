import { ShaderProgram } from "./ShaderProgram"

import vs from "../glsl/marker.vertex.glsl?raw"
import fs from "../glsl/marker.fragment.glsl?raw"

class MarkerProgram extends ShaderProgram {
	resolutionUniformLocation: WebGLUniformLocation | null
	centerUniformLocation: WebGLUniformLocation | null
	zoomUniformLocation: WebGLUniformLocation | null

	vertexPosAttributeLocation: number
	markerPosAttributeLocation: number
	iconIndexAttributeLocation: number

	attributeArray: WebGLVertexArrayObject | null

	vertexBuffer: WebGLBuffer | null
	markerBuffer: WebGLBuffer | null
	indexBuffer: WebGLBuffer | null

	markerCount = 0
	dataTexture: WebGLTexture
	iconTexture: WebGLTexture

	constructor(context: WebGL2RenderingContext) {
		super(context)
		this.compile(vs, fs)
		let gl = context

		// Cache uniform locations
		this.resolutionUniformLocation = gl.getUniformLocation(this.program, "resolution")
		this.centerUniformLocation     = gl.getUniformLocation(this.program, "center")
		this.zoomUniformLocation       = gl.getUniformLocation(this.program, "zoom")

		// Set texture units
		this.activate()
		gl.uniform1i(gl.getUniformLocation(this.program, "iconData"), 0)
		gl.uniform1i(gl.getUniformLocation(this.program, "icons"   ), 1)

		// Store attributes
		this.attributeArray = gl.createVertexArray()
		gl.bindVertexArray(this.attributeArray)

		// Cache attribute locations & activate them
		this.vertexPosAttributeLocation  = gl.getAttribLocation(this.program, "vertexPos")
		this.markerPosAttributeLocation  = gl.getAttribLocation(this.program, "markerPos")
		this.iconIndexAttributeLocation  = gl.getAttribLocation(this.program, "iconIndex")
		gl.enableVertexAttribArray(this.vertexPosAttributeLocation)
		gl.enableVertexAttribArray(this.markerPosAttributeLocation)
		gl.enableVertexAttribArray(this.iconIndexAttributeLocation)

		// Setup buffers to fill attributes
		this.vertexBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
		gl.vertexAttribPointer(this.vertexPosAttributeLocation, 2, gl.FLOAT, false, 0, 0)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 0,1, 1,0, 1,1]), gl.STATIC_DRAW)	// Mesh never changes

		// Note: vertexAttribDivisor is used to pull buffer data once per instance (instead of per vertex)
		this.markerBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.markerBuffer)
		gl.vertexAttribPointer(this.markerPosAttributeLocation, 2, gl.FLOAT, false, 0, 0)
		gl.vertexAttribDivisor(this.markerPosAttributeLocation, 1)

		this.indexBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.indexBuffer)
		gl.vertexAttribPointer(this.iconIndexAttributeLocation, 1, gl.FLOAT, false, 0, 0)
		gl.vertexAttribDivisor(this.iconIndexAttributeLocation, 1)
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
	setMarkerCoordinates(coords: Array<number>) {
		this.markerCount = coords.length / 2
		let gl = this.context
		gl.bindBuffer(gl.ARRAY_BUFFER, this.markerBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW)
	}

	setMarkerIcons(indexes: Array<number>) {
		let gl = this.context
		gl.bindBuffer(gl.ARRAY_BUFFER, this.indexBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(indexes), gl.STATIC_DRAW)
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
		gl.bindVertexArray(this.attributeArray)
		gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.markerCount)
	}
}

export { MarkerProgram }