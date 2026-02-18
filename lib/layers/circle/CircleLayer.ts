import { ElementLayer } from "../element/ElementLayer"
import type { MapLayerConfig } from "../../types/types"

import { Circle } from "./Circle"
import { CircleProgram } from "./CircleProgram"


class CircleLayer extends ElementLayer {
	constructor(config: MapLayerConfig) {
		super(config)
		this.program = new CircleProgram(config.context)
	}

	addCircle(circle: Circle) {
		this.addElement(circle)
	}

	removeCircle(circle: Circle) {
		this.removeElement(circle)
	}

	clearCircles() {
		this.clearElements()
	}
}

export { CircleLayer }