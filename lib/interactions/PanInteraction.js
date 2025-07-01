import { UserInteraction } from "./UserInteraction"

class PanInteraction extends UserInteraction {
	constructor(config) {
		super(config)
	}

	enableFor(element) {
		element.addEventListener("pointerdown", (e1) => {
			console.log(e1.offsetX, e1.offsetY)
			let startX = e1.offsetX
			let startY = e1.offsetY

			function onDrag(e) {
				mp.setPaneOffset(e.offsetX - startX, e.offsetY - startY)
			}
			canvasElement.addEventListener("pointermove", onDrag)
			canvasElement.addEventListener("pointerup", () => {
				canvasElement.removeEventListener("pointermove", onDrag)
			})
		})
	}
}