import { MapElement } from "../element/MapElement"

import type { Icon } from "./Icon"

class Marker extends MapElement {
	x: number
	y: number
	icon: Icon

	constructor(x: number, y: number, icon: Icon) {
		super()
		this.x = x
		this.y = y
		this.icon = icon
	}

	serialize(): Array<number> {
		return [this.x, this.y, this.icon.slot]
	}
}

export { Marker }