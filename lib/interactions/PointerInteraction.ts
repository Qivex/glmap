import { UserInteraction } from "./UserInteraction"

import type { GLMap } from "../GLMap"

abstract class PointerInteraction extends UserInteraction {
	pointers: Map<number, {x: number, y: number}> = new Map()

	constructor() {
		super()
	}

	enableFor(glmap: GLMap) {
		super.enableFor(glmap)

		const pointerStartHandler = (event: Event) => {
			const pointerEvent = event as PointerEvent

			if (this.pointers.size === 0)
				canvasElement.addEventListener("pointermove", pointerDragHandler)

			this.pointers.set(pointerEvent.pointerId, {
				x: pointerEvent.offsetX,
				y: pointerEvent.offsetY
			})
			this.onPointerAmountChange(this.pointers.size)
			this.onPointerStart(pointerEvent)
		}

		const pointerDragHandler = (event: Event) => {
			const pointerEvent = event as PointerEvent
			this.pointers.set(pointerEvent.pointerId, {
				x: pointerEvent.offsetX,
				y: pointerEvent.offsetY
			})
			this.onPointerMove(pointerEvent)
		}

		const pointerEndHandler = (event: Event) => {
			const pointerEvent = event as PointerEvent
			this.pointers.delete(pointerEvent.pointerId)

			if (this.pointers.size === 0)
				canvasElement.removeEventListener("pointermove", pointerDragHandler)

			this.onPointerAmountChange(this.pointers.size)
			this.onPointerEnd(pointerEvent)
		}

		// Connect handlers
		let canvasElement = glmap.getCanvasElement()
		canvasElement.addEventListener("pointerdown",   pointerStartHandler)
		canvasElement.addEventListener("pointerup",     pointerEndHandler)
		canvasElement.addEventListener("pointerout",    pointerEndHandler)
		canvasElement.addEventListener("pointerleave",  pointerEndHandler)
		canvasElement.addEventListener("pointercancel", pointerEndHandler)
	}

	abstract onPointerStart(event: PointerEvent): void

	abstract onPointerMove(event: PointerEvent): void

	abstract onPointerEnd(event: PointerEvent): void

	abstract onPointerAmountChange(newAmount: number): void
}

export { PointerInteraction }