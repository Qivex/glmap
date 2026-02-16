import { MapLayer } from "../../MapLayer"

import type { MapLayerConfig } from "../../types/types"
import type { Popup } from "./Popup"

class PopupLayer extends MapLayer { 
	openPopups: Map<HTMLElement, Popup> = new Map()
	popupResizeObserver: ResizeObserver

	constructor(config: MapLayerConfig) {
		super(config)

		this.addEventListener("pan", this.updatePopupPositions as EventListener)
		this.addEventListener("zoom", this.updatePopupPositions as EventListener)
		this.addEventListener("resize", this.updatePopupPositions as EventListener)

		// Clip resizing popups correctly
		this.popupResizeObserver = new ResizeObserver((elems) => {
			for (let el of elems) {
				let popup = this.openPopups.get(el.target as HTMLElement)
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
		popup.show()
		this.openPopups.set(popup.element, popup)
		this.popupResizeObserver.observe(popup.element)
		this.updatePopupPositions()	// Force update to display immediately
	}

	removePopup(popup: Popup) {
		popup.hide()
		this.openPopups.delete(popup.element)
		this.popupResizeObserver.unobserve(popup.element)
	}

	clearPopups() {
		for (let popup of this.openPopups.values()) {
			popup.hide()
		}
		this.openPopups.clear()
		this.popupResizeObserver.disconnect()
	}

	updatePopupPositions() {
		let canvasBox = this.glmap.getCanvasElement().getBoundingClientRect()

		for (let popup of this.openPopups.values()) {
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

	// No need to render, this layer just moves the popup elements
}

export { PopupLayer }