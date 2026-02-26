import { ElementLayer } from "../element/ElementLayer.ts"
import { MarkerProgram } from "./MarkerProgram"
import { IconStorage } from "./IconStorage.ts"

import type { MarkerLayerConfig, IconHitTestType } from "../../types/types.ts"

import { Icon } from "./Icon.ts"
import type { Marker } from "./Marker.ts"

import { CoordEvent } from "../../events/CoordEvent.ts"


class MarkerLayer extends ElementLayer {
	iconStorage: IconStorage

	iconHitTest: IconHitTestType
	alphaTestFramebuffer: WebGLFramebuffer | null

	constructor(config: MarkerLayerConfig) {
		super(config)

		const {
			context,
			maxIconWidth,
			maxIconHeight,
			maxIconCount,
			iconHitTest = "box"
		} = config

		this.iconHitTest = iconHitTest

		this.addEventListener("click", this.onClick as EventListener)
		this.addEventListener("hover", this.onHover as EventListener)

		// Setup shader program
		let mp = new MarkerProgram(context)
		this.program = mp
		
		// Create texture storage for icons
		this.iconStorage = new IconStorage(context, maxIconCount, maxIconWidth, maxIconHeight)
		mp.activate()
		mp.setIconDataTexture(this.iconStorage.getDataTextureBinding())
		mp.setMarkerTexture(this.iconStorage.getTextureBinding())

		// Create framebuffer to attach icon texture for alpha test
		let gl = this.context
		this.alphaTestFramebuffer = gl.createFramebuffer()
	}

	onClick(clickEvent: CoordEvent) {
		const {x, y} = clickEvent
		let marker = this.findMarkerAt(x, y)
		if (marker) {
			clickEvent.preventDefault()
			marker.dispatchEvent(new CoordEvent("click", {x, y}))
		}
	}

	onHover(hoverEvent: CoordEvent) {
		let canvasClasses = this.glmap.getCanvasElement().classList

		let {x, y} = hoverEvent
		let marker = this.findMarkerAt(x, y)
		if (marker) {
			hoverEvent.preventDefault()
			canvasClasses.add("glmap-marker-hover")
			marker.dispatchEvent(new CoordEvent("hover", {x, y}))
		} else {
			canvasClasses.remove("glmap-marker-hover")
		}
	}

	createIcon(image: CanvasImageSource, width: number, height: number, anchorX: number, anchorY: number) {
		let iconIndex = this.iconStorage.createIcon(image, width, height, anchorX, anchorY)
		return new Icon(this.iconStorage, iconIndex, width, height, anchorX, anchorY)
	}

	addMarker(marker: Marker) {
		this.addElement(marker)
	}

	removeMarker(marker: Marker) {
		this.removeElement(marker)
	}

	getMarkers() {
		return this.elements as Set<Marker>
	}

	clearMarkers() {
		this.clearElements()
	}

	findClosestMarker(x: number, y: number): Marker | null {
		let closestMarker = null
		let closestDistance = Infinity
		for (let marker of this.getMarkers()) {
			let distance = Math.pow(x - marker.x, 2) + Math.pow(y - marker.y, 2)	// Omit sqrt until final result, doesnt change order
			if (distance < closestDistance) {
				closestDistance = distance
				closestMarker = marker
			}
		}
		return closestMarker
	}

	findMarkerAt(x: number, y: number) {
		let marker = this.findClosestMarker(x, y)
		if (marker) {
			// Compare both positions
			let markerCanvasPos = this.glmap.map2canvas(marker.x, marker.y)
			let pointerCanvasPos = this.glmap.map2canvas(x, y)
			// scale = texture size / rendered size
			let icon = marker.icon
			let hIconScale = this.iconStorage.maxWidth  / icon.width
			let vIconScale = this.iconStorage.maxHeight / icon.height
			// Determine equivalent pixel in icon texture
			let testX = hIconScale * (pointerCanvasPos.x - markerCanvasPos.x + icon.anchorX)
			let testY = vIconScale * (pointerCanvasPos.y - markerCanvasPos.y + icon.anchorY)
			// Execute hit test: Does the pointer "hit" the marker?
			let isHit = false
			switch (this.iconHitTest) {
				case "alpha": {
					isHit = this.alphaHitTest(icon, testX, testY)
					break
				}
				case "box": {
					isHit = (
						testX > 0 &&
						testY > 0 &&
						testX < this.iconStorage.maxWidth &&
						testY < this.iconStorage.maxHeight
					)
				}
			}
			if (isHit)
				return marker
		}
		return null
	}

	alphaHitTest(icon: Icon, x: number, y: number) {
		let gl = this.context
		// Attach marker icon
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.alphaTestFramebuffer)
		gl.framebufferTextureLayer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, this.iconStorage.getTextureBinding(), 0, icon.slot)
		// Read pixel value
		let pixel = new Uint8Array(4)
		gl.readPixels(x, y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel)
		// Bind to canvas again
		gl.bindFramebuffer(gl.FRAMEBUFFER, null)
		// Alpha test
		return pixel[3] > 0
	}
}

export { MarkerLayer }