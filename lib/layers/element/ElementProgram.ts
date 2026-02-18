import { MapLayerProgram } from "../MapLayerProgram"
import type { MapElement } from "./MapElement"

abstract class ElementProgram extends MapLayerProgram {
	elementCount = 0
	elementBuffer: WebGLBuffer	// Includes all attributes for the elements

	setElements(elements: Set<MapElement>) {
		this.elementCount = elements.size
		// Serialize attribute data of each element
		let data = []
		for (let el of elements) {
			data.push(...el.serialize())
		}
		// Upload to buffer
		let gl = this.context
		gl.bindBuffer(gl.ARRAY_BUFFER, this.elementBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
	}

	abstract draw(): void
}

export { ElementProgram }