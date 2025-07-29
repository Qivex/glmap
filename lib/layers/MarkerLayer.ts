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
		mp.setIconDataTexture(this.iconStorage.getDataTextureBinding())
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

	onClick(x: number, y: number) {
		let marker = this.findMarkerAt(x, y)
		if (marker) {
			marker.onClick()
		}
	}

	onHover(x: number, y: number) {
		let canvasClasses = this.glmap.getCanvasElement().classList

		let marker = this.findMarkerAt(x, y)
		if (marker) {
			canvasClasses.add("glmap-marker-hover")
		} else {
			canvasClasses.remove("glmap-marker-hover")
		}
	}

	createIcon(image: CanvasImageSource, width: number, height: number, anchorX: number, anchorY: number) {
		let iconIndex = this.iconStorage.createIcon(image, width, height, anchorX, anchorY)
		return new Icon(this.iconStorage, iconIndex)
	}

	addMarker(marker: Marker) {
		this.hasUpdatedMarkers = true
		this.activeMarkers.add(marker)
	}

	findClosestMarker(x: number, y: number) {
		let closestMarker = null
		let closestDistance = Infinity
		for (let marker of this.activeMarkers) {
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
			// Hit test - For now just matching circle
			// TODO: Give choice: circle, bounding box, alpha != 0 etc.
			let markerCanvasPos = this.glmap.map2canvas(marker.x, marker.y)
			let pointerCanvasPos = this.glmap.map2canvas(x, y)

			let distancePixels = Math.sqrt(
				Math.pow(markerCanvasPos.x - pointerCanvasPos.x, 2) +
				Math.pow(markerCanvasPos.y - pointerCanvasPos.y, 2)
			)

			if (distancePixels < 16)
				return marker
		}
		return null
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
		}
		
		mp.draw()
	}
}

export { MarkerLayer }