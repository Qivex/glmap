import { ShaderProgram } from "./ShaderProgram"

import vs from "../glsl/marker.vertex.glsl?raw"
import fs from "../glsl/marker.fragment.glsl?raw"

class MarkerProgram extends ShaderProgram {
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
		this.markerPosAttributeLocation  = gl.getAttribLocation(this.program, "markerPos")
		this.iconSizeAttributeLocation   = gl.getAttribLocation(this.program, "iconSize")
		this.iconAnchorAttributeLocation = gl.getAttribLocation(this.program, "iconAnchor")
		this.iconIndexAttributeLocation  = gl.getAttribLocation(this.program, "iconIndex")
		gl.enableVertexAttribArray(this.vertexPosAttributeLocation)
		gl.enableVertexAttribArray(this.markerPosAttributeLocation)
		gl.enableVertexAttribArray(this.iconSizeAttributeLocation)
		gl.enableVertexAttribArray(this.iconAnchorAttributeLocation)
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

		this.sizeBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.sizeBuffer)
		gl.vertexAttribPointer(this.iconSizeAttributeLocation, 2, gl.FLOAT, false, 0, 0)
		gl.vertexAttribDivisor(this.iconSizeAttributeLocation, 1)

		this.anchorBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.anchorBuffer)
		gl.vertexAttribPointer(this.iconAnchorAttributeLocation, 2, gl.FLOAT, false, 0, 0)
		gl.vertexAttribDivisor(this.iconAnchorAttributeLocation, 1)

		this.indexBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.indexBuffer)
		gl.vertexAttribPointer(this.iconIndexAttributeLocation, 1, gl.FLOAT, false, 0, 0)
		gl.vertexAttribDivisor(this.iconIndexAttributeLocation, 1)
	}

	// Uniform setter
	setResolution(width, height) {
		this.context.uniform2f(this.resolutionUniformLocation, width, height)
	}

	setCenter(x, y) {
		this.context.uniform2f(this.centerUniformLocation, x, y)
	}

	setZoom(zoom) {
		this.context.uniform1f(this.zoomUniformLocation, zoom)
	}

	// Attribute buffer setter
	setMarkerCoordinates(coords) {
		this.markerCount = coords.length / 2
		let gl = this.context
		gl.bindBuffer(gl.ARRAY_BUFFER, this.markerBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(coords), gl.STATIC_DRAW)
	}

	setMarkerSizes(sizes) {
		let gl = this.context
		gl.bindBuffer(gl.ARRAY_BUFFER, this.sizeBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sizes), gl.STATIC_DRAW)
	}

	setMarkerAnchors(anchors) {
		let gl = this.context
		gl.bindBuffer(gl.ARRAY_BUFFER, this.anchorBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(anchors), gl.STATIC_DRAW)
	}

	setMarkerIcons(indexes) {
		let gl = this.context
		gl.bindBuffer(gl.ARRAY_BUFFER, this.indexBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(indexes), gl.STATIC_DRAW)
	}

	// Store texture
	setMarkerTexture(texture) {
		this.texture = texture
	}	

	draw() {
		let gl = this.context
		gl.activeTexture(gl.TEXTURE0)
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.texture)
		gl.bindVertexArray(this.attributeArray)
		gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.markerCount)
	}
}

export { MarkerProgram }