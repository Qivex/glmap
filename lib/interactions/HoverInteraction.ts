import { UserInteraction } from "./UserInteraction"

import type { GLMap } from "../GLMap"

class HoverInteraction extends UserInteraction {
	constructor() {
		super()
	}

	enableFor(glmap: GLMap) {
		super.enableFor(glmap)

		let canvasElement = glmap.getCanvasElement()
		canvasElement.addEventListener("pointermove", (event: Event) => {
			const moveEvent = event as PointerEvent
			const hoverCoord = glmap.canvas2map(moveEvent.offsetX, moveEvent.offsetY)
			// Temp: Hit test
			const {x,y} = hoverCoord
			glmap.layers[1].onHover(x, y)
		})
	}
}

export { HoverInteraction }