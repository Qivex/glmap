import { GLMap } from "../GLMap"

import { UserInteraction } from "./UserInteraction"

class HoverInteraction extends UserInteraction {
	constructor(config: object) {
		super(config)
	}

	enableFor(glmap: GLMap) {
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