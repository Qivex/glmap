class TextureStorage {
	constructor(gl, maxWidth, maxHeight, maxCount) {
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
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture)
		gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RGBA, maxWidth, maxHeight, maxCount, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		this.texture = texture
		
		// Track slot usage
		this.usedSlots = []
		this.nextSlot = 0	// Points at lowest empty slot
	}

	getTextureBinding() {
		return this.texture
	}

	addTexture(image) {
		if (this.nextSlot > this.maxCount)
			throw Error("TextureStorage is full!")

		let slot = this.nextSlot
		this.updateTexture(slot, image)
		this.usedSlots[slot] = true

		// Find next empty slot
		while (this.usedSlots[this.nextSlot]) {
			this.nextSlot++
		}

		return slot
	}

	updateTexture(slot, image) {
		let gl = this.context
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.texture)
		gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, slot, this.maxWidth, this.maxHeight, 1, gl.RGBA, gl.UNSIGNED_BYTE, image)
	}

	removeTexture(slot) {
		this.usedSlots[slot] = false

		if (slot < this.nextSlot)
			this.nextSlot = slot
	}
}

export { TextureStorage }