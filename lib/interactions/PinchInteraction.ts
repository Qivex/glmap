import { PointerInteraction } from "./PointerInteraction"

class PinchInteraction extends PointerInteraction {
	pinnedPos: {x: number, y: number}
	startZoom: number
	startDist: number

	constructor() {
		super()
	}

	getPointerAverage() {
		let sumX = 0,
			sumY = 0,
			count = this.pointers.size
		for (let pointerPos of this.pointers.values()) {
			sumX += pointerPos.x
			sumY += pointerPos.y
		}
		return {
			x: sumX / count,
			y: sumY / count
		}
	}

	getTotalPointerDistanceFrom(pixelX: number, pixelY: number) {
		let distance = 0
		for (let pointerPos of this.pointers.values()) {
			distance += Math.sqrt(
				Math.pow(pointerPos.x - pixelX, 2) +
				Math.pow(pointerPos.y - pixelY, 2)
			)
		}
		return distance
	}

	onPointerAmountChange(newAmount: number): void {
		if (newAmount > 0) {
			// Store new position to remain pinned at new pointer average
			const pointerAverage = this.getPointerAverage()
			this.pinnedPos = this.glmap.canvas2map(pointerAverage.x, pointerAverage.y)
			this.startZoom = this.glmap.getZoom()
			this.startDist = this.getTotalPointerDistanceFrom(pointerAverage.x, pointerAverage.y)
		}
	}

	onPointerMove() {
		const pointerAverage = this.getPointerAverage()

		// Adjust zoom (only when multiple pointers)
		if (this.pointers.size > 1) {
			let currentDist = this.getTotalPointerDistanceFrom(pointerAverage.x, pointerAverage.y)
			let zoomOffset = Math.log2(currentDist / this.startDist)	// Normalized because of logarithmic zoom
			this.glmap.setZoom(this.startZoom + zoomOffset)
		}

		// Adjust center (second because currentPos changed after zoom)
		let currentCenter = this.glmap.getCenter()
		let currentPos = this.glmap.canvas2map(pointerAverage.x, pointerAverage.y)
		// Move center so that pinned target (coordinate) is located at pointer average (pixel) again
		this.glmap.setCenter(
			currentCenter.x + this.pinnedPos.x - currentPos.x,
			currentCenter.y + this.pinnedPos.y - currentPos.y
		)
	}

	// Not required
	onPointerStart(){}
	onPointerEnd(){}
}

export { PinchInteraction }