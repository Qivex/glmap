import { MapLayer } from "../../lib/layers/MapLayer"
import type { MapLayerConfig } from "../../lib/types/types"

import { Arrow } from "./Arrow"
import { ArrowProgram } from "./ArrowProgram"

import type { CoordEvent } from "../../lib/events/CoordEvent"
import type { ZoomEvent } from "../../lib/events/ZoomEvent"
import type { ResizeEvent } from "../../lib/events/ResizeEvent"


interface ArrowLayerConfig extends MapLayerConfig {
	lineWidth?: number,
	arrowPeriod?: number,
	arrowWidth?: number,
	arrowHeight?: number,
	arrowShape?: TexImageSource
}


class ArrowLayer extends MapLayer {
	arrowProgram: ArrowProgram
	arrows: Set<Arrow> = new Set()
	hasUpdatedArrows = false

	constructor(config: ArrowLayerConfig) {
		super(config)

		const {
			context,
			lineWidth = 4,
			arrowPeriod = 100,
			arrowWidth = 20,
			arrowHeight = 20,
			arrowShape
		} = config

		this.arrowProgram = new ArrowProgram(context)
		let ap = this.arrowProgram

		// Initial state
		ap.activate()
		ap.setCenter(this.centerX, this.centerY)
		ap.setZoom(this.zoom)
		ap.setResolution(this.width, this.height)
		ap.setLineWidth(lineWidth)
		ap.setArrowPeriod(arrowPeriod)
		ap.setArrowHead(arrowWidth, arrowHeight)

		// React to state changes
		this.addEventListener("pan", this.onPan as EventListener)
		this.addEventListener("zoom", this.onZoom as EventListener)
		this.addEventListener("resize", this.onResize as EventListener)
	}

	onPan(panEvent: CoordEvent) {
		this.arrowProgram.activate()
		this.arrowProgram.setCenter(panEvent.x, panEvent.y)
	}

	onZoom(zoomEvent: ZoomEvent) {
		this.arrowProgram.activate()
		this.arrowProgram.setZoom(zoomEvent.zoom)
	}

	onResize(resizeEvent: ResizeEvent) {
		this.arrowProgram.activate()
		this.arrowProgram.setResolution(resizeEvent.width, resizeEvent.height)
	}

	addArrow(arrow: Arrow) {
		this.hasUpdatedArrows = true
		this.arrows.add(arrow)
	}

	removeArrow(arrow: Arrow) {
		this.hasUpdatedArrows = true
		this.arrows.delete(arrow)
	}

	render(time: number) {
		this.arrowProgram.activate()

		if (this.hasUpdatedArrows === true) {
			this.hasUpdatedArrows = false
			// Updates all buffers (will be slow for large amounts)
			this.arrowProgram.setArrows(this.arrows)
		}

		this.arrowProgram.draw()
	}
}

export { ArrowLayer }