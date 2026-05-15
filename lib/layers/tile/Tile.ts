import { MapElement } from "../element/MapElement"

class Tile extends MapElement {
	serialized: Uint8Array

	constructor(x: number, y: number, z: number, slot: number) {
		super()
		
		this.serialized = new Uint8Array(new Float32Array([x, y, z, slot]).buffer)
	}
}

export { Tile }