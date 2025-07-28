import { UserInteraction } from "./UserInteraction"

import type { GLMap } from "../GLMap"

class HoverInteraction extends UserInteraction {
	enableFor(glmap: GLMap) {
		super.enableFor(glmap)

		const hoverHandler = (event: Event) => {
			const moveEvent = event as PointerEvent
			let hoverPos = glmap.canvas2map(moveEvent.offsetX, moveEvent.offsetY)
			glmap.onHover(hoverPos.x, hoverPos.y)
		}

		glmap.getCanvasElement().addEventListener("pointermove", hoverHandler)
	}
}

export { HoverInteraction }