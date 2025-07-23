import type { MarkerLayer } from "../layers/MarkerLayer"
import type { Icon } from "./Icon"

class Marker {
	x: number
	y: number
	icon: Icon

	markerLayer: MarkerLayer | null = null
	index: number | null = null

	constructor(x: number, y: number, icon: Icon) {
		this.x = x
		this.y = y
		this.icon = icon
	}

	addTo(markerLayer: MarkerLayer) {
		this.markerLayer = markerLayer
	}

	remove() {
		if (this.markerLayer) {
			this.markerLayer = null
		}
	}
}

export { Marker }