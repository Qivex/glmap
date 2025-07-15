import { UserInteraction } from "./UserInteraction"

class PanInteraction extends UserInteraction {
	constructor(config) {
		super(config)
	}

	enableFor(glmap) {
		let canvasElement = glmap.getCanvasElement()
		canvasElement.addEventListener("pointerdown", (downEvent) => {
			// This location of initial pointerdown is set to remain "under" the pointer during the pan
			let targetPointerCoord = glmap.canvas2map(downEvent.offsetX, downEvent.offsetY)

			function onDrag(moveEvent) {
				let currentPointerCoord = glmap.canvas2map(moveEvent.offsetX, moveEvent.offsetY)

				// Required shift for pointer to point at target again
				let diffX = targetPointerCoord.x - currentPointerCoord.x
				let diffY = targetPointerCoord.y - currentPointerCoord.y

				// Shift map
				let currentCenter = glmap.getCenter()
				glmap.setCenter(
					currentCenter.x + diffX,
					currentCenter.y + diffY
				)
			}

			canvasElement.addEventListener("pointermove", onDrag)

			canvasElement.addEventListener("pointerup", () => {
				canvasElement.removeEventListener("pointermove", onDrag)
			})
		})
	}
}

export { PanInteraction }