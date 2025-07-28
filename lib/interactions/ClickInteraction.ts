import { UserInteraction } from "./UserInteraction"

import type { GLMap } from "../GLMap"

class ClickInteraction extends UserInteraction {
	enableFor(glmap: GLMap) {
		super.enableFor(glmap)

		const clickHandler = (event: Event) => {
			const clickEvent = event as PointerEvent
			let clickPos = glmap.canvas2map(clickEvent.offsetX, clickEvent.offsetY)
			glmap.onClick(clickPos.x, clickPos.y)
		}

		glmap.getCanvasElement().addEventListener("click", clickHandler)
	}
}

export { ClickInteraction }