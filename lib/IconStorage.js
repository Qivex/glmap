class IconStorage {
	constructor(context, maxIconCount, maxIconWidth, maxIconHeight) {
		// Note: maxIconWidth/-Height only limit the stored resolution, not the rendered size of the icon!

		this.context = context
		let gl = context

		this.nextIndex = 0
		this.lastIndex = maxIconCount - 1
		this.iconWidth = maxIconWidth
		this.iconHeight = maxIconHeight
		

		// Create texture array for icons
		let icons = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, icons)
		gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RGBA, maxIconWidth, maxIconHeight, maxIconCount, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
		this.texture = icons

		// Store icon data
		this.iconDimensions = []
		this.iconAnchors = []

		// Used to rescale images to fixed icon size before adding to texture
		this.offscreenContext = (new OffscreenCanvas(maxIconWidth, maxIconHeight)).getContext("2d", {willReadFrequently: true})
	}

	createIcon(image, displayWidth, displayHeight, anchorX, anchorY) {
		if (this.nextIndex >= this.lastIndex)
			throw Error("IconStorage is full!")

		let gl = this.context

		// Store metadata
		this.iconDimensions.push(displayWidth, displayHeight)
		this.iconAnchors.push(anchorX, anchorY)

		// Rescale image before storing
		let ctx = this.offscreenContext
		let w = this.iconWidth,
			h = this.iconHeight
		ctx.clearRect(0, 0, w, h)
		ctx.drawImage(image, 0, 0, w, h)
		let pixelData = ctx.getImageData(0, 0, w, h)
		gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, this.nextIndex, w, h, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixelData)

		return this.nextIndex++
	}

	getTexture() {
		return this.texture
	}

	constructBufferDataForIcons(iconIndexes) {
		let d = this.iconDimensions
		let a = this.iconAnchors
		return {
			dimensions: iconIndexes.flatMap(i => [d[2*i], d[2*i + 1]]),
			anchors:    iconIndexes.flatMap(i => [a[2*i], a[2*i + 1]])
		}
	}

	/*
	addIcon(image, width, height, anchorX, anchorY) {
		// TODO: Temp implementation
		let canvas = new OffscreenCanvas(128, 128)
		let ctx = canvas.getContext("2d", {willReadFrequently: true})
		let gl = this.context
		gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.texture)

		function fillSlice(ctx, gl, slice, color) {
			ctx.strokeStyle = color
			ctx.lineWidth = 16
			ctx.ellipse(64, 64, 56, 56, 0, 0, 2*Math.PI, false)
			ctx.stroke()
			let testImage = ctx.getImageData(0, 0, 128, 128)
			gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, slice, 128, 128, 1, gl.RGBA, gl.UNSIGNED_BYTE, testImage)
		}
		fillSlice(ctx, gl, 0, "blue")
		fillSlice(ctx, gl, 1, "red")
		fillSlice(ctx, gl, 2, "yellow")
		fillSlice(ctx, gl, 3, "purple")
		fillSlice(ctx, gl, 4, "black")
		// Todo: Image decoding? Rescale? Set all icons at once?

		this.iconDimensions.push([width, height])
		this.iconAnchors.push([anchorX, anchorY])
	}
	*/
}

export { IconStorage }