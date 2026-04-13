class TextureStorage {
	context: WebGL2RenderingContext

	maxWidth: number
	maxHeight: number
	maxLength: number	// = amount of texture slices

	texture: WebGLTexture
	expandBuffer: WebGLFramebuffer | null

	// Track slot usage
	slotFull: Array<boolean> = []
	nextSlot = 0	// Lowest available slot

	constructor(gl: WebGL2RenderingContext, initialWidth: number, initialHeight: number, initialLength: number) {
		this.context = gl

		// Check dimensions
		let limit = gl.getParameter(gl.MAX_3D_TEXTURE_SIZE)

		if (initialWidth > limit || initialHeight > limit || initialLength > limit)
			throw new Error(`All dimensions must be below ${limit}!`)

		this.maxWidth = initialWidth
		this.maxHeight = initialHeight
		this.maxLength = initialLength

		this.texture = this.createTextureArray(initialWidth, initialHeight, initialLength)
		this.expandBuffer = gl.createFramebuffer()
	}

	createTextureArray(width: number, height: number, length: number) {
		let gl = this.context
		let texture = gl.createTexture()
		if (texture === null)
			throw new Error("Texture creation failed")
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, texture)
		gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, width, height, length)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		return texture
	}

	getTextureBinding(): WebGLTexture {
		return this.texture
	}

	addTexture(image: TexImageSource): number {
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
		// Check if image fits inside storage
		let expandRequired = false
		let {maxWidth, maxHeight, maxLength} = this

		if (slot >= maxLength) {
			maxLength *= 2
			expandRequired = true
		}

		// "let isVideo = image instanceof VideoFrame" not recognized by Typescript...
		let imgWidth  = image instanceof VideoFrame ? image.displayWidth  : image.width
		let imgHeight = image instanceof VideoFrame ? image.displayHeight : image.height

		if (imgWidth > maxWidth) {
			maxWidth = imgWidth
			expandRequired = true
		}

		if (imgHeight > maxHeight) {
			maxHeight = imgHeight
			expandRequired = true
		}

		// Expand storage if necessary
		if (expandRequired === true) {
			this.expand(maxWidth, maxHeight, maxLength)
		}

		// Update texture
		let gl = this.context
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.texture)
		gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, slot, imgWidth, imgHeight, 1, gl.RGBA, gl.UNSIGNED_BYTE, image)
	}

	removeTexture(slot: number) {
		this.slotFull[slot] = false

		if (slot < this.nextSlot)
			this.nextSlot = slot
	}

	expand(newWidth: number, newHeight: number, newLength: number) {
		let gl = this.context
		// Create new texture
		let expandedTexture = this.createTextureArray(newWidth, newHeight, newLength)
		// Use framebuffer to copy each slice from previous texture
		gl.bindFramebuffer(gl.READ_FRAMEBUFFER, this.expandBuffer)
		for (let slice = 0; slice < this.maxLength; slice++) {
			gl.framebufferTextureLayer(gl.READ_FRAMEBUFFER, gl.COLOR_ATTACHMENT0, this.texture, 0, slice)
			gl.copyTexSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, slice, 0, 0, this.maxWidth, this.maxHeight)	// Texture still bound after this.createTextureArray()
		}
		// Update metadata
		this.maxWidth  = newWidth
		this.maxHeight = newHeight
		this.maxLength = newLength
		// Switch texture
		gl.deleteTexture(this.texture)
		this.texture = expandedTexture
	}
}

export { TextureStorage }