import { MapLayer } from "../../MapLayer"
import type { MapLayerConfig } from "../../types/types"

import { Circle } from "./Circle"
import { CircleProgram } from "./CircleProgram"


class CircleLayer extends MapLayer {
	circleProgram: CircleProgram
	circles: Set<Circle> = new Set()
	hasUpdatedCircles = false

	constructor(config: MapLayerConfig) {
		super(config)
		this.circleProgram = new CircleProgram(config.context)
	}

	addCircle(circle: Circle) {
		this.hasUpdatedCircles = true
		this.circles.add(circle)
	}

	removeCircle(circle: Circle) {
		this.hasUpdatedCircles = true
		this.circles.delete(circle)
	}

	render(time: number) {
		this.circleProgram.activate()

		if (this.hasUpdatedCircles === true) {
			this.hasUpdatedCircles = false
			// Updates all buffers (will be slow for large amounts)
			this.circleProgram.setCircles(this.circles)
		}

		this.circleProgram.draw()
	}
}

export { CircleLayer }