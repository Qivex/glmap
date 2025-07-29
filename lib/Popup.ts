class Popup {
	element: HTMLElement
	anchorX: number
	anchorY: number
	mapX: number
	mapY: number
	width: number
	height: number

	constructor(element: HTMLElement, anchorX: number, anchorY: number) {
		this.element = element
		this.anchorX = anchorX
		this.anchorY = anchorY

		// Only read once, then use ResizeObserver
		this.width = element.clientWidth
		this.height = element.clientHeight

		element.style.position = "fixed"
	}

	setLocation(x: number, y: number) {
		this.mapX = x
		this.mapY = y
	}

	show() {
		this.element.style.removeProperty("display")
	}

	hide() {
		this.element.style.display = "none"
	}
}

export { Popup }