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
		this.iconStorage.updateIconImage(this.slot, image)
	}

	getSize() {
		return {
			width:  this.iconStorage.iconDimensions[2 * this.slot],
			height: this.iconStorage.iconDimensions[2 * this.slot + 1]
		}
	}

	setSize(width: number, height: number) {
		this.iconStorage.iconDimensions[2 * this.slot]     = width
		this.iconStorage.iconDimensions[2 * this.slot + 1] = height
	}

	getAnchor() {
		return {
			width:  this.iconStorage.iconAnchors[2 * this.slot],
			height: this.iconStorage.iconAnchors[2 * this.slot + 1]
		}
	}

	setAnchor(x: number, y: number) {
		this.iconStorage.iconAnchors[2 * this.slot]     = x
		this.iconStorage.iconAnchors[2 * this.slot + 1] = y
	}
}

export { Icon }