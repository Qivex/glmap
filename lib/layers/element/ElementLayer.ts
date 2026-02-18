import { MapLayer } from "../../MapLayer"
import type { ElementProgram } from "./ElementProgram"
import type { MapElement } from "./MapElement"

abstract class ElementLayer extends MapLayer {
	program: ElementProgram
	elements: Set<MapElement> = new Set()
	hasUpdatedElements = false

	addElement(element: MapElement) {
		this.hasUpdatedElements = true
		this.elements.add(element)
	}

	removeElement(element: MapElement) {
		this.hasUpdatedElements = true
		this.elements.delete(element)
	}

	clearElements() {
		this.hasUpdatedElements = true
		this.elements.clear()
	}

	render() {
		this.program.activate()

		if (this.hasUpdatedElements === true) {
			this.hasUpdatedElements = false
			this.program.setElements(this.elements)
		}

		this.program.draw()
	}
}

export { ElementLayer }