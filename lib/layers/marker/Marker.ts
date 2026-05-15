import { MapElement } from "../element/MapElement"

import type { Icon } from "./Icon"
import type { Color } from "../../types/types"

class Marker extends MapElement {
	serialized: Uint8Array

	x: number
	y: number
	icon: Icon
	color: Color

	constructor(x: number, y: number, icon: Icon, color: Color) {
		super()
		
		let serialized = new Uint8Array(16)
		new Float32Array(serialized.buffer).set([x, y, icon.slot])
		serialized.set(color, 12)

		Object.assign(this, {serialized, x, y, icon, color})
		Object.freeze(this)
	}
}

export { Marker }