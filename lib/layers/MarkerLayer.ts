import { MapLayer } from "./MapLayer"
import { MarkerProgram } from "../programs/MarkerProgram"
import { IconStorage } from "../storage/IconStorage"

import type { MarkerLayerConfig } from "../types/types.ts"

import { Icon } from "../wrapper/Icon"
import type { Marker } from "../wrapper/Marker"


class MarkerLayer extends MapLayer {
	markerProgram: MarkerProgram
	iconStorage: IconStorage

	activeMarkers: Set<Marker> = new Set()

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
		let marker = this.findClosestMarker(x, y)
		if (marker) {
			let markerCanvasPos = this.glmap.map2canvas(marker.x, marker.y)
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
		return new Icon(this.iconStorage, iconIndex)	// Todo: Wrap this with class which has wrapper functions to get/set values
	}

	addMarker(marker: Marker) {
		this.hasUpdatedMarkers = true
		this.activeMarkers.add(marker)
	}

	findClosestMarker(hitX: number, hitY: number) {
		let closestMarker = null
		let closestDistance = Infinity
		for (let marker of this.activeMarkers) {
			let distance = Math.pow(hitX - marker.x, 2) + Math.pow(hitY - marker.y, 2)	// Omit sqrt until final result, doesnt change order
			if (distance < closestDistance) {
				closestDistance = distance
				closestMarker = marker
			}
		}
		return closestMarker
	}

	render(time: number) {
		let mp = this.markerProgram
		mp.activate()

		// Only update program buffers at most once per draw call
		if (this.hasUpdatedMarkers) {
			this.hasUpdatedMarkers = false

			let markerIcons = []
			let markerLatLngs = []

			for (let marker of this.activeMarkers) {
				markerIcons.push(marker.icon.slot)
				markerLatLngs.push(marker.x, marker.y)
			}

			mp.setMarkerIcons(markerIcons)
			mp.setMarkerCoordinates(markerLatLngs)
			
			let iconData = this.iconStorage.constructBufferDataForIcons(markerIcons)
			mp.setMarkerSizes(iconData.dimensions)
			mp.setMarkerAnchors(iconData.anchors)
		}
		
		mp.draw()
	}
}

export { MarkerLayer }