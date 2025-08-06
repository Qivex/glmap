import { UserInteraction } from "./UserInteraction"

import type { GLMap } from "../GLMap"

class ClickInteraction extends UserInteraction {
	enableFor(glmap: GLMap) {
		super.enableFor(glmap)

		const clickHandler = (clickEvent: PointerEvent) => {
			let clickPos = glmap.canvas2map(clickEvent.offsetX, clickEvent.offsetY)
			glmap.onClick(clickPos.x, clickPos.y)
		}

		let canvasElement = glmap.getCanvasElement()

		const pointerStartHandler = () => {
			canvasElement.addEventListener("pointerup", clickHandler)
			canvasElement.addEventListener("pointermove", () => canvasElement.removeEventListener("pointerup", clickHandler))
		}

		canvasElement.addEventListener("pointerdown", pointerStartHandler)

	}
}

export { ClickInteraction }