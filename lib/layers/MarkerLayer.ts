import { MapLayer } from "./MapLayer"
import { MarkerProgram } from "../programs/MarkerProgram"
import { IconStorage } from "../storage/IconStorage"

import type { MarkerLayerConfig } from "../types/types.ts"


class MarkerLayer extends MapLayer {
	markerProgram: MarkerProgram
	iconStorage: IconStorage

	defaultIconIndex = 0

	markerIndexes: Array<number> = []
	markerLatLngs: Array<number> = []

	hasUpdatedMarkers = false

	constructor(config: MarkerLayerConfig) {
		super(config)

		const {
			context,
			maxIconWidth,
			maxIconHeight,
			maxIconCount
		} = config

		// Setup shader program
		let mp = new MarkerProgram(context)
		this.markerProgram = mp
		
		// Create texture storage for icons
		this.iconStorage = new IconStorage(context, maxIconCount, maxIconWidth, maxIconHeight)
		mp.setMarkerTexture(this.iconStorage.getTextureBinding())	// Should never change
	}

	onPan(x: number, y: number) {
		this.markerProgram.activate()
		this.markerProgram.setCenter(x, y)
	}

	onZoom(z: number) {
		this.markerProgram.activate()
		this.markerProgram.setZoom(z)
	}

	onResize(w: number, h: number) {
		this.markerProgram.activate()
		this.markerProgram.setResolution(w, h)
	}

	onClick() {}

	onHover(x: number, y: number) {
		let m = this.findClosestMarker(x, y)
		// Check if pointer is actually over icon
		if (m) {
			let markerX = this.markerLatLngs[m]
			let markerY = this.markerLatLngs[m+1]

			let markerCanvasPos = this.glmap.map2canvas(markerX, markerY)
			let pointerCanvasPos = this.glmap.map2canvas(x, y)

			// TODO: Give choice for hit test: circle, bounding box, alpha != 0 etc. (For now just matching circle)
			let distancePixels = Math.sqrt(
				Math.pow(markerCanvasPos.x - pointerCanvasPos.x, 2) +
				Math.pow(markerCanvasPos.y - pointerCanvasPos.y, 2)
			)

			let canvasElement = this.glmap.getCanvasElement()
			if (distancePixels < 16) {
				canvasElement.style.cursor = "pointer"
			} else if (canvasElement.style.cursor === "pointer") {
				canvasElement.style.removeProperty("cursor")
			}
		}
	}

	createIcon(image: CanvasImageSource, width: number, height: number, anchorX: number, anchorY: number) {
		let iconIndex = this.iconStorage.createIcon(image, width, height, anchorX, anchorY)
		return iconIndex	// Todo: Wrap this with class which has wrapper functions to get/set values
	}

	addMarker(lat: number, lng: number, iconIndex: number) {
		this.hasUpdatedMarkers = true

		if (typeof iconIndex != "number")
			iconIndex = this.defaultIconIndex

		this.markerIndexes.push(iconIndex)
		this.markerLatLngs.push(lat, lng)
		// Todo: Same as with Icon, use wrapper class for ref when removing is required
	}

	findClosestMarker(hitX: number, hitY: number) {
		let closestIndex = null
		let closestDistance = Infinity
		for (let i = 0; i < this.markerLatLngs.length; i += 2) {
			let x = this.markerLatLngs[i]
			let y = this.markerLatLngs[i+1]
			let distance = Math.pow(hitX - x, 2) + Math.pow(hitY - y, 2)	// Omit sqrt until final result, doesnt change order
			if (distance < closestDistance) {
				closestDistance = distance
				closestIndex = i
			}
		}
		//console.log(closestIndex / 2, this.markerLatLngs[closestIndex], this.markerLatLngs[closestIndex + 1])
		return closestIndex
	}

	render(time: number) {
		let mp = this.markerProgram
		mp.activate()

		// Only update program buffers at most once per draw call
		if (this.hasUpdatedMarkers) {
			this.hasUpdatedMarkers = false

			mp.setMarkerIcons(this.markerIndexes)
			mp.setMarkerCoordinates(this.markerLatLngs)
			
			let iconData = this.iconStorage.constructBufferDataForIcons(this.markerIndexes)
			mp.setMarkerSizes(iconData.dimensions)
			mp.setMarkerAnchors(iconData.anchors)
		}
		
		mp.draw()
	}
}

export { MarkerLayer }