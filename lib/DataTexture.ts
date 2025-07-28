/**
 * Used to move data to a shader when:
 * a) Data length varies (uniform arrays have fixed length) or
 * b) An attribute array would contain a lot of redundant data (expensive buffer transfer on every frame)
 */
class DataTexture {
	context: WebGL2RenderingContext
	texture: WebGLTexture
	width: number
	height: number

	internalFormat: number
	format: number
	type: number

	constructor(gl: WebGL2RenderingContext, dataLength: number, maxCount: number) {
		if (dataLength <= 0)
			throw new Error("dataLength must be positive!")

		this.context = gl
		this.width = dataLength	// Values per entry
		this.height = maxCount	// Number of entries

		// Only use 1 channel per pixel - up to 4 would be possible, but texSubImage2D can't update them seperate from each other
		// https://registry.khronos.org/webgl/specs/latest/2.0/#TEXTURE_TYPES_FORMATS_FROM_DOM_ELEMENTS_TABLE
		this.internalFormat = gl.R32F
		this.format = gl.RED
		this.type = gl.FLOAT

		// Create texture
		let tex = gl.createTexture()
		if (tex === null)
			throw new Error("Texture creation failed")
		gl.bindTexture(gl.TEXTURE_2D, tex)
		gl.texImage2D(gl.TEXTURE_2D, 0, this.internalFormat, this.width, this.height, 0, this.format, this.type, null)
		// Must be set to NEAREST: https://developer.mozilla.org/en-US/docs/Web/API/OES_texture_float#limitation_linear_filtering
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
		this.texture = tex
	}

	getTextureBinding() {
		return this.texture
	}

	setData(index: number, data: Array<number>, offset?: number) {
		if (index < 0 || index > this.height)
			throw new Error("Index out of range!")

		offset = offset || 0
		let length = data.length

		if (offset + length > this.width)
			throw new Error("Too much data!")

		let gl = this.context
		gl.bindTexture(gl.TEXTURE_2D, this.texture)
		gl.texSubImage2D(gl.TEXTURE_2D, 0, offset, index, length, 1, this.format, this.type, new Float32Array(data))
	}
}

export { DataTexture }