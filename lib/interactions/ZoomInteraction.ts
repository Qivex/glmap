import { UserInteraction } from "./UserInteraction"

class ZoomInteraction extends UserInteraction {
	constructor(config) {
		super(config)
	}

	enableFor(glmap) {
		let canvasElement = glmap.getCanvasElement()
		canvasElement.addEventListener("wheel", (wheelEvent) => {
			wheelEvent.preventDefault()	// Prevent scrolling of body, "go back" etc.

			let currentZoom = glmap.getZoom()
			glmap.setZoom(currentZoom - wheelEvent.deltaY / 200)
		})
	}
}

export { ZoomInteraction }