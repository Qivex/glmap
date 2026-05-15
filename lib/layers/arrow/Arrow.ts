import { MapElement } from "../element/MapElement"

import type { Point, Color } from "../../types/types"

class Arrow extends MapElement {
	serialized: Uint8Array

	startPoint: Point
	endPoint: Point
	color: Color

	constructor(startPoint: Point, endPoint: Point, color: Color) {
		super()
		
		let serialized = new Uint8Array(20)
		new Float32Array(serialized.buffer).set([startPoint[0], startPoint[1], endPoint[0], endPoint[1]])
		serialized.set(color, 16)

		Object.assign(this, {serialized, startPoint, endPoint, color})
		Object.freeze(this)
	}
}

export { Arrow }