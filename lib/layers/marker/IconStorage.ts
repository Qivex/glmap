import { TextureStorage } from "../../TextureStorage"
import { DataTexture } from "../../DataTexture"

class IconStorage extends TextureStorage {
	// Stores iconSize & iconAnchor
	iconDataTexture: DataTexture

	// Used to rescale images to fixed icon size before adding to texture
	offscreenContext: OffscreenCanvasRenderingContext2D
	
	constructor(context: WebGL2RenderingContext, maxIconCount: number, maxIconWidth: number, maxIconHeight: number) {
		super(context, maxIconWidth, maxIconHeight, maxIconCount)
		// Note: maxIconWidth/-Height only limit the stored resolution, not the rendered size of the icon!
		let ctx = (new OffscreenCanvas(maxIconWidth, maxIconHeight)).getContext("2d", {willReadFrequently: true})
		if (ctx === null)
			throw new Error("OffscreenCanvas creation failed")
		this.offscreenContext = ctx

		// Used as lookup of variable length (vertex attribute would be very redundant, uniforms have fixed length)
		this.iconDataTexture = new DataTexture(context, 4, maxIconCount)
	}

	getImagePixels(image: CanvasImageSource) {
		// Rescale image before storing
		let ctx = this.offscreenContext
		let w = this.maxWidth,
			h = this.maxHeight
		ctx.clearRect(0, 0, w, h)
		ctx.drawImage(image, 0, 0, w, h)
		return ctx.getImageData(0, 0, w, h)
	}

	createIcon(image: CanvasImageSource, displayWidth: number, displayHeight: number, anchorX: number, anchorY: number): number {
		// Store texture
		let pixelData = this.getImagePixels(image)
		let iconIndex = this.addTexture(pixelData)

		// Store additional data
		this.iconDataTexture.setData(iconIndex, [displayWidth, displayHeight, anchorX, anchorY])

		return iconIndex
	}

	setIconImage(slot: number, image: CanvasImageSource) {
		let pixelData = this.getImagePixels(image)
		this.updateTexture(slot, pixelData)
	}

	setIconSize(slot: number, width: number, height: number) {
		this.iconDataTexture.setData(slot, [width, height])
	}

	setIconAnchor(slot: number, x: number, y: number) {
		this.iconDataTexture.setData(slot, [x, y], 2)
	}

	getDataTextureBinding(): WebGLTexture {
		return this.iconDataTexture.getTextureBinding()
	}
}

export { IconStorage }