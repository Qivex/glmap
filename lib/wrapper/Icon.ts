import { IconStorage } from "../storage/IconStorage"

// Wraps IconStorage functionality and hides internal slot-index
class Icon {
	iconStorage: IconStorage
	slot: number
	width: number
	height: number
	anchorX: number
	anchorY: number

	// Not public, only returned from IconStorage.createIcon
	constructor(iconStorage: IconStorage, slot: number, width: number, height: number, anchorX: number, anchorY: number) {
		this.iconStorage = iconStorage
		this.slot = slot
		this.width = width
		this.height = height
		this.anchorX = anchorX
		this.anchorY = anchorY
	}

	setImage(image: CanvasImageSource) {
		this.iconStorage.setIconImage(this.slot, image)
	}

	setSize(width: number, height: number) {
		this.width = width
		this.height = height
		this.iconStorage.setIconSize(this.slot, width, height)
	}

	setAnchor(x: number, y: number) {
		this.anchorX = x
		this.anchorY = y
		this.iconStorage.setIconAnchor(this.slot, x, y)
	}
}

export { Icon }