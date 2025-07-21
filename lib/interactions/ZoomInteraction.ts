import { UserInteraction } from "./UserInteraction"

import type { GLMap } from "../GLMap"

class ZoomInteraction extends UserInteraction {
	constructor() {
		super()
	}

	enableFor(glmap: GLMap) {
		super.enableFor(glmap)

		let canvasElement = glmap.getCanvasElement()
		canvasElement.addEventListener("wheel", (event: Event) => {
			const wheelEvent = event as WheelEvent
			wheelEvent.preventDefault()	// Prevent scrolling of body, "go back" etc.

			let x = wheelEvent.offsetX,
				y = wheelEvent.offsetY

			let cursorCoordBeforeZoom = glmap.canvas2map(x, y)

			// Update zoom
			let currentZoom = glmap.getZoom()
			glmap.setZoom(currentZoom - wheelEvent.deltaY / 200)
			
			// Update center so cursor still points at same location
			let cursorCoordAfterZoom = glmap.canvas2map(x, y)

			let currentCenter = glmap.getCenter()
			glmap.setCenter(
				currentCenter.x + (cursorCoordBeforeZoom.x - cursorCoordAfterZoom.x),
				currentCenter.y + (cursorCoordBeforeZoom.y - cursorCoordAfterZoom.y)
			)
		})
	}
}

export { ZoomInteraction }