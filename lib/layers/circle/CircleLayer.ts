import { MapLayer } from "../../MapLayer"
import type { MapLayerConfig } from "../../types/types"

import { Circle } from "./Circle"
import { CircleProgram } from "./CircleProgram"

import type { CoordEvent } from "../../events/CoordEvent"
import type { ZoomEvent } from "../../events/ZoomEvent"
import type { ResizeEvent } from "../../events/ResizeEvent"


class CircleLayer extends MapLayer {
	circleProgram: CircleProgram
	circles: Set<Circle> = new Set()
	hasUpdatedCircles = false

	constructor(config: MapLayerConfig) {
		super(config)

		this.circleProgram = new CircleProgram(config.context)
		let cp = this.circleProgram

		// Initial state
		cp.activate()
		cp.setCenter(this.centerX, this.centerY)
		cp.setZoom(this.zoom)
		cp.setResolution(this.width, this.height)

		// React to state changes
		this.addEventListener("pan", this.onPan as EventListener)
		this.addEventListener("zoom", this.onZoom as EventListener)
		this.addEventListener("resize", this.onResize as EventListener)
	}

	onPan(panEvent: CoordEvent) {
		this.circleProgram.activate()
		this.circleProgram.setCenter(panEvent.x, panEvent.y)
	}

	onZoom(zoomEvent: ZoomEvent) {
		this.circleProgram.activate()
		this.circleProgram.setZoom(zoomEvent.zoom)
	}

	onResize(resizeEvent: ResizeEvent) {
		this.circleProgram.activate()
		this.circleProgram.setResolution(resizeEvent.width, resizeEvent.height)
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