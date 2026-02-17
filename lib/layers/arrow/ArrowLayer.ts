import { MapLayer } from "../../MapLayer"
import type { MapLayerConfig } from "../../types/types"

import { Arrow } from "./Arrow"
import { ArrowProgram } from "./ArrowProgram"


interface ArrowLayerConfig extends MapLayerConfig {
	lineWidth?: number,
	arrowPeriod?: number,
	arrowWidth?: number,
	arrowHeight?: number,
	arrowShape?: TexImageSource
}


// Default arrow
let defaultArrow = new OffscreenCanvas(20, 20)
let ctx = defaultArrow.getContext("2d")
if (ctx === null)
	throw new Error("Context creation failed")
ctx.fillStyle = "white"
ctx.beginPath()
ctx.moveTo(19,10)
ctx.lineTo(1,19)
ctx.lineTo(1,1)
ctx.closePath()
ctx.fill()


class ArrowLayer extends MapLayer {
	arrowProgram: ArrowProgram
	arrows: Set<Arrow> = new Set()
	hasUpdatedArrows = false

	constructor(config: ArrowLayerConfig) {
		super(config)

		const {
			context,
			lineWidth = 4,
			arrowPeriod = 80,
			arrowWidth = 20,
			arrowHeight = 20,
			arrowShape = defaultArrow
		} = config

		this.arrowProgram = new ArrowProgram(context)
		let ap = this.arrowProgram

		// Initial state
		ap.activate()
		ap.setLineWidth(lineWidth)
		ap.setArrowPeriod(arrowPeriod)
		ap.setArrowHead(arrowWidth, arrowHeight, arrowShape)
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