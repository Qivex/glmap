import { MapElement } from "../element/MapElement"

import type { Color } from "../../types/types"

class Circle extends MapElement {
	serialized: Uint8Array

	x: number
	y: number
	radius: number
	color: Color

	constructor(x: number, y: number, radius: number, color: Color) {
		super()

		let serialized = new Uint8Array(16)
		new Float32Array(serialized.buffer).set([x, y, radius])
		serialized.set(color, 12)

		Object.assign(this, {serialized, x, y, radius, color})
		Object.freeze(this)
	}
}

export { Circle }