import { UserInteraction } from "./UserInteraction"

import type { GLMap } from "../GLMap"

class PanInteraction extends UserInteraction {
	constructor() {
		super()
	}

	enableFor(glmap: GLMap) {
		super.enableFor(glmap)

		let canvasElement = glmap.getCanvasElement()
		canvasElement.addEventListener("pointerdown", (event: Event)  => {
			const downEvent = event as PointerEvent
			// This location of initial pointerdown is set to remain "under" the pointer during the pan
			let targetPointerCoord = glmap.canvas2map(downEvent.offsetX, downEvent.offsetY)

			function onDrag(event: Event) {
				const moveEvent = event as MouseEvent
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

			canvasElement.style.cursor = "grabbing"
			canvasElement.addEventListener("pointermove", onDrag)

			canvasElement.addEventListener("pointerup", () => {
				canvasElement.style.removeProperty("cursor")
				canvasElement.removeEventListener("pointermove", onDrag)
			})
		})
	}
}

export { PanInteraction }