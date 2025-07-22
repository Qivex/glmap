class Popup {
	element: HTMLElement
	anchorX: number
	anchorY: number
	mapX: number
	mapY: number

	constructor(element: HTMLElement, anchorX: number, anchorY: number) {
		this.element = element
		this.anchorX = anchorX
		this.anchorY = anchorY

		element.style.position = "fixed"
	}

	showAt(x: number, y: number) {
		this.mapX = x
		this.mapY = y
	}

	close() {

	}
}

export { Popup }