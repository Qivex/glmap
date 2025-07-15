import { GLMap } from "../GLMap"

import { UserInteraction } from "./UserInteraction"

class ZoomInteraction extends UserInteraction {
	constructor(config: object) {
		super(config)
	}

	enableFor(glmap: GLMap) {
		let canvasElement = glmap.getCanvasElement()
		canvasElement.addEventListener("wheel", (wheelEvent: WheelEvent) => {
			wheelEvent.preventDefault()	// Prevent scrolling of body, "go back" etc.

			let currentZoom = glmap.getZoom()
			glmap.setZoom(currentZoom - wheelEvent.deltaY / 200)
		})
	}
}

export { ZoomInteraction }