import type { MarkerLayer } from "./MarkerLayer"
import type { Icon } from "./Icon"

class Marker extends EventTarget {
	x: number
	y: number
	icon: Icon

	markerLayer: MarkerLayer | null = null
	index: number | null = null

	constructor(x: number, y: number, icon: Icon) {
		super()
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