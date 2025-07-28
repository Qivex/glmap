import { IconStorage } from "../storage/IconStorage"

// Wraps IconStorage functionality and hides internal slot-index
class Icon {
	iconStorage: IconStorage
	slot: number

	// Not public, only returned from IconStorage.createIcon
	constructor(iconStorage: IconStorage, slot: number) {
		this.iconStorage = iconStorage
		this.slot = slot
	}

	setImage(image: CanvasImageSource) {
		this.iconStorage.setIconImage(this.slot, image)
	}

	setSize(width: number, height: number) {
		this.iconStorage.setIconSize(this.slot, width, height)
	}

	setAnchor(x: number, y: number) {
		this.iconStorage.setIconAnchor(this.slot, x, y)
	}
}

export { Icon }