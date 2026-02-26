import { MapElement } from "../element/MapElement"

import type { MarkerLayer } from "./MarkerLayer"
import type { Icon } from "./Icon"

class Marker extends MapElement {
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

	serialize(): Array<number> {
		return [this.x, this.y, this.icon.slot]
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