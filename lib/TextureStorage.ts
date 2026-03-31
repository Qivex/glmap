class TextureStorage {
	context: WebGL2RenderingContext

	maxWidth: number
	maxHeight: number
	maxCount: number

	texture: WebGLTexture

	// Track slot usage
	slotFull: Array<boolean> = []
	nextSlot = 0	// Lowest available slot

	constructor(gl: WebGL2RenderingContext, maxWidth: number, maxHeight: number, maxCount: number) {
		this.context = gl

		// Check dimensions
		let limit = gl.getParameter(gl.MAX_3D_TEXTURE_SIZE)

		if (maxWidth > limit || maxHeight > limit || maxCount > limit)
			throw new Error(`All dimensions must be below ${limit}!`)

		this.maxWidth = maxWidth
		this.maxHeight = maxHeight
		this.maxCount = maxCount

		// Create texture array
		let texture = gl.createTexture()
		if (texture === null)
			throw new Error("Texture creation failed")
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture)
		gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, maxWidth, maxHeight, maxCount)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		this.texture = texture
	}

	getTextureBinding(): WebGLTexture {
		return this.texture
	}

	addTexture(image: TexImageSource): number {
		if (this.nextSlot > this.maxCount)
			throw Error("TextureStorage is full!")

		let slot = this.nextSlot
		this.updateTexture(slot, image)
		this.slotFull[slot] = true

		// Find next empty slot
		while (this.slotFull[this.nextSlot]) {
			this.nextSlot++
		}

		return slot
	}

	updateTexture(slot: number, image: TexImageSource) {
		let gl = this.context
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.texture)
		gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, slot, this.maxWidth, this.maxHeight, 1, gl.RGBA, gl.UNSIGNED_BYTE, image)
	}

	removeTexture(slot: number) {
		this.slotFull[slot] = false

		if (slot < this.nextSlot)
			this.nextSlot = slot
	}
}

export { TextureStorage }