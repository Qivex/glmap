import { ElementLayer } from "../element/ElementLayer"
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


class ArrowLayer extends ElementLayer {
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

		let ap = new ArrowProgram(context)
		this.program = ap

		// Initial state
		ap.activate()
		ap.setLineWidth(lineWidth)
		ap.setArrowPeriod(arrowPeriod)
		ap.setArrowHead(arrowWidth, arrowHeight, arrowShape)
	}

	addArrow(arrow: Arrow) {
		this.addElement(arrow)
	}

	removeArrow(arrow: Arrow) {
		this.removeElement(arrow)
	}

	clearArrows() {
		this.clearElements()
	}
}

export { ArrowLayer }