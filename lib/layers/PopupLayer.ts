import { MapLayer } from "./MapLayer"

import type { MapLayerConfig } from "../types/types"
import type { Popup } from "../Popup"

class PopupLayer extends MapLayer {
	openPopups: Array<Popup> = []

	constructor(config: MapLayerConfig) {
		super(config)
	}

	addPopup(popup: Popup) {
		this.openPopups.push(popup)
		this.updatePopupPositions()	// Force update to display immediately
	}

	clearPopups() {
		for (let popup of this.openPopups) {
			popup.close()
		}
		this.openPopups = []
	}

	updatePopupPositions() {
		let canvasBox = this.glmap.getCanvasElement().getBoundingClientRect()

		for (let popup of this.openPopups) {
			let canvasPos = this.glmap.map2canvas(popup.mapX, popup.mapY)
			let windowPosX = canvasBox.x + canvasPos.x - popup.anchorX
			let windowPosY = canvasBox.y + canvasPos.y - popup.anchorY

			popup.element.style.left = `${windowPosX}px`
			popup.element.style.top  = `${windowPosY}px`

			// Todo: Check distance to border to avoid overflow
		}
	}

	onPopupResize(popup: Popup) {
		// Todo: ResizeObserver
	}

	onPan = this.updatePopupPositions
	onResize = this.updatePopupPositions
	onZoom = this.updatePopupPositions

	// Not required
	onHover() {}
	onClick() {}

	// No need to render, this layer just moves the popup elements
	render() {}
}

export { PopupLayer }