import { TextureStorage } from "./TextureStorage"

class IconStorage extends TextureStorage {
	// Store icon data
	iconDimensions: Array<number> = []
	iconAnchors: Array<number> = []

	// Used to rescale images to fixed icon size before adding to texture
	offscreenContext: OffscreenCanvasRenderingContext2D
	
	constructor(context: WebGL2RenderingContext, maxIconCount: number, maxIconWidth: number, maxIconHeight: number) {
		super(context, maxIconWidth, maxIconHeight, maxIconCount)
		// Note: maxIconWidth/-Height only limit the stored resolution, not the rendered size of the icon!
		let ctx = (new OffscreenCanvas(maxIconWidth, maxIconHeight)).getContext("2d", {willReadFrequently: true})
		if (ctx === null)
			throw new Error("OffscreenCanvas creation failed")
		this.offscreenContext = ctx
	}

	createIcon(image: CanvasImageSource, displayWidth: number, displayHeight: number, anchorX: number, anchorY: number): number {
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

	getTexture(): WebGLTexture {
		return this.texture
	}

	constructBufferDataForIcons(iconIndexes: Array<number>): {dimensions: Array<number>, anchors: Array<number>} {
		let d = this.iconDimensions
		let a = this.iconAnchors
		return {
			dimensions: iconIndexes.flatMap(i => [d[2*i], d[2*i + 1]]),
			anchors:    iconIndexes.flatMap(i => [a[2*i], a[2*i + 1]])
		}
	}
}

export { IconStorage }