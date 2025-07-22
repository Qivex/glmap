import { MapLayer } from "./MapLayer"

import type { MapLayerConfig } from "../types/types"
import type { Popup } from "../Popup"

class PopupLayer extends MapLayer {
	openPopups: Array<Popup> = []
	popupResizeObserver: ResizeObserver

	constructor(config: MapLayerConfig) {
		super(config)

		// Clip resizing popups correctly
		this.popupResizeObserver = new ResizeObserver((elems) => {
			for (let el of elems) {
				let popup = this.openPopups.find(p => p.element === el.target)
				if (popup) {
					const {width, height} = el.contentRect
					popup.width = width
					popup.height = height
				}
			}
			this.updatePopupPositions()
		})
	}

	addPopup(popup: Popup) {
		this.openPopups.push(popup)
		this.popupResizeObserver.observe(popup.element)
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
			// Calculate client position
			let canvasPos = this.glmap.map2canvas(popup.mapX, popup.mapY)

			let offsetLeft = canvasPos.x - popup.anchorX
			let offsetTop  = canvasPos.y - popup.anchorY

			let clientX = canvasBox.x + offsetLeft
			let clientY = canvasBox.y + offsetTop
			
			// Move popup
			let popupStyle = popup.element.style
			popupStyle.left = `${clientX}px`
			popupStyle.top  = `${clientY}px`

			// Clip Popup at canvas border
			let overflowLeft   = Math.max(0, -offsetLeft),
				overflowTop    = Math.max(0, -offsetTop),
				overflowRight  = Math.max(0, clientX + popup.width  - canvasBox.right),
				overflowBottom = Math.max(0, clientY + popup.height - canvasBox.bottom)
				
			popupStyle.clipPath = `inset(${overflowTop}px ${overflowRight}px ${overflowBottom}px ${overflowLeft}px)`
		}
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