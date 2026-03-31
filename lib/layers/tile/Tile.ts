import { MapElement } from "../element/MapElement"

class Tile extends MapElement {
	x: number
	y: number
	z: number
	slot: number

	constructor(x: number, y: number, z: number, slot: number) {
		super()
		this.x = x
		this.y = y
		this.z = z
		this.slot = slot
	}

	serialize(): Array<number> {
		return [this.x, this.y, this.z, this.slot]
	}
}

export { Tile }