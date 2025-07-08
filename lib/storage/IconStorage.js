import { TextureStorage } from "./TextureStorage"

class IconStorage extends TextureStorage {
	constructor(context, maxIconCount, maxIconWidth, maxIconHeight) {
		super(context, maxIconWidth, maxIconHeight, maxIconCount)

		// Note: maxIconWidth/-Height only limit the stored resolution, not the rendered size of the icon!

		// Store icon data
		this.iconDimensions = []
		this.iconAnchors = []

		// Used to rescale images to fixed icon size before adding to texture
		this.offscreenContext = (new OffscreenCanvas(maxIconWidth, maxIconHeight)).getContext("2d", {willReadFrequently: true})
	}

	createIcon(image, displayWidth, displayHeight, anchorX, anchorY) {
		// Store metadata
		this.iconDimensions.push(displayWidth, displayHeight)
		this.iconAnchors.push(anchorX, anchorY)

		// Rescale image before storing
		let ctx = this.offscreenContext
		let w = this.maxWidth,
			h = this.maxHeight
		ctx.clearRect(0, 0, w, h)
		ctx.drawImage(image, 0, 0, w, h)
		let pixelData = ctx.getImageData(0, 0, w, h)

		return this.addTexture(pixelData)
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
}

export { IconStorage }