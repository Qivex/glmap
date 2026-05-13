import { MapElement } from "../element/MapElement"

import type { Icon } from "./Icon"

class Marker extends MapElement {
	x: number
	y: number
	icon: Icon
	rgba: [number,number,number,number]

	constructor(x: number, y: number, icon: Icon, rgba: [number,number,number,number]) {
		super()
		this.x = x
		this.y = y
		this.icon = icon
		this.rgba = rgba
	}

	serialize(): Array<number> {
		return [this.x, this.y, this.icon.slot, ...this.rgba]
	}
}

export { Marker }