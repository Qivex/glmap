import { UserInteraction } from "./UserInteraction"

import type { GLMap } from "../GLMap"

class ClickInteraction extends UserInteraction {
	dragLimit: number

	constructor(config: {dragLimit: number}) {
		super()
		this.dragLimit = config.dragLimit
	}

	enableFor(glmap: GLMap) {
		super.enableFor(glmap)

		const clickHandler = (clickEvent: PointerEvent) => {
			let clickPos = glmap.canvas2map(clickEvent.offsetX, clickEvent.offsetY)
			glmap.onClick(clickPos.x, clickPos.y)
		}

		// Small tolerance for movement during click for mobile
		let lastDownEvent: PointerEvent

		const pointerDownHandler = (downEvent: PointerEvent) => {
			lastDownEvent = downEvent
		}

		const pointerUpHandler = (upEvent: PointerEvent) => {
			if (Math.abs(upEvent.offsetX - lastDownEvent.offsetX) < this.dragLimit &&
				Math.abs(upEvent.offsetY - lastDownEvent.offsetY) < this.dragLimit)
				clickHandler(upEvent)
		}

		let canvasElement = glmap.getCanvasElement()
		canvasElement.addEventListener("pointerdown", pointerDownHandler)
		canvasElement.addEventListener("pointerup", pointerUpHandler)

	}
}

export { ClickInteraction }