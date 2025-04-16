import { ShaderProgram } from "./ShaderProgram.js";

import vs from "./glsl/layer.vertex.glsl?raw"
import fs from "./glsl/layer.fragment.glsl?raw"

// Draws all tiles of a single zoom level
class TileLayerProgram extends ShaderProgram {
	constructor(context) {
		super(context)
		this.compile(vs, fs)
		let gl = context

		// Cache uniform locations
		this.resolutionUniformLocation = gl.getUniformLocation(this.program, "resolution")
		this.tilesizeUniformLocation   = gl.getUniformLocation(this.program, "tilesize")
		this.centerUniformLocation     = gl.getUniformLocation(this.program, "center")
		this.zoomUniformLocation       = gl.getUniformLocation(this.program, "zoom")

		// Cache attribute locations & activate them
		this.positionAttributeLocation = gl.getAttribLocation(this.program, "vertexPos")
		this.offsetAttributeLocation   = gl.getAttribLocation(this.program, "tileOffset")
		this.sliceAttributeLocation    = gl.getAttribLocation(this.program, "tileID")
		gl.enableVertexAttribArray(this.positionAttributeLocation)
		gl.enableVertexAttribArray(this.offsetAttributeLocation)
		gl.enableVertexAttribArray(this.sliceAttributeLocation)

		// Setup buffers to fill attributes
		this.positionBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer)
		gl.vertexAttribPointer(this.positionAttributeLocation, 2, gl.FLOAT, false, 0, 0)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 0,1, 1,0, 1,1]), gl.STATIC_DRAW)	// Mesh never changes

		this.offsetBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.offsetBuffer)
		gl.vertexAttribPointer(this.offsetAttributeLocation, 3, gl.FLOAT, false, 0, 0)
		gl.vertexAttribDivisor(this.offsetAttributeLocation, 1)

		// Could use gl_InstanceID when each tile is used exactly once (which prevents wrapping or fallback-tiles)
		this.sliceBuffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, this.sliceBuffer)
		gl.vertexAttribPointer(this.sliceAttributeLocation, 1, gl.FLOAT, false, 0, 0)
		gl.vertexAttribDivisor(this.sliceAttributeLocation, 1)

		// Defaults
		this.activate()
		this.setResolution(1920, 1080)
		this.setTileSize(256, 256)
		this.setCenter(0, 0)
		this.setZoom(1)
		// No tiles available
		//this.setTileLocations([])
		//this.setTileTextures([], 0, 0)
		this.tileCount = 0
	}

	activate() {
		this.context.useProgram(this.program)
	}

	// TODO: Do these setters require a call to gl.useProgram() first,
	// or does this also work while another program is active on the
	// same context?

	setResolution(width, height) {
		this.context.uniform2f(this.resolutionUniformLocation, width, height)
	}

	setTileSize(width, height) {
		this.context.uniform2f(this.tilesizeUniformLocation, width, height)
	}

	setCenter(x, y) {
		this.context.uniform2f(this.centerUniformLocation, x, y)
	}

	setZoom(zoom) {
		this.context.uniform1f(this.zoomUniformLocation, zoom)
	}

	setTileLocations(tiles) {
		let tileOffsetArray = new Array(tiles.length * 3)
		let tileOrderArray = new Array(tiles.length)
		for (let i = 0; i < tiles.length; i++) {
			tileOffsetArray[3*i]     = tiles[i].x
			tileOffsetArray[3*i + 1] = tiles[i].y
			tileOffsetArray[3*i + 2] = tiles[i].z
			tileOrderArray[i] = tiles[i].slice
		}
		this.tileCount = tiles.length
		// Update buffers
		let gl = this.context
		gl.bindBuffer(gl.ARRAY_BUFFER, this.offsetBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tileOffsetArray), gl.STATIC_DRAW)
		gl.bindBuffer(gl.ARRAY_BUFFER, this.sliceBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tileOrderArray), gl.STATIC_DRAW)
	}

	// Todo: Use texSubImage3D() & async loading of images
	setTileTextures(tiles, width, height) {
		let count = tiles.length
		// Combine all tiles on a canvas
		let canvas = new OffscreenCanvas(width, height * count)
		let ctx = canvas.getContext("2d")
		for (let i = 0; i < tiles.length; i++) {
			let img = tiles[i]
			ctx.drawImage(img, 0, height * i)
		}
		
		let data = ctx.getImageData(0, 0, width, height * count)
		// Create texture from canvas bytes
		let gl = this.context
		let tex = gl.createTexture()	// TEXTURE0 by default
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex)
		gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RGBA, width, height, count, 0, gl.RGBA, gl.UNSIGNED_BYTE, data)
		// Set params
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
	}

	draw() {
		let gl = this.context
		gl.useProgram(this.program)
		gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.tileCount)
	}
}

export { TileLayerProgram }