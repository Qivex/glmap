import { CanvasContext } from "./CanvasContext"

import { CoordEvent } from "./events/CoordEvent"
import { ResizeEvent } from "./events/ResizeEvent"
import { ZoomEvent } from "./events/ZoomEvent"

import type { UserInteraction } from "./interactions/UserInteraction"
import type { MapLayer } from "./layers/MapLayer"


class GLMap extends CanvasContext {
	layers: Array<MapLayer> = []
	interactions: Array<UserInteraction> = []

	centerX = 0
	centerY = 0
	zoom = 0
	resolutionWidth: number
	resolutionHeight: number

	constructor(canvasElement: HTMLCanvasElement) {
		super(canvasElement)

		this.resolutionWidth = this.context.drawingBufferWidth
		this.resolutionHeight =  this.context.drawingBufferHeight

		let render = (time: number) => {
			this.render(time)
			requestAnimationFrame(render)
		}
		render(0)
	}

	addMapLayer(layer: MapLayer) {
		this.layers.push(layer)
	}

	addUserInteraction(interaction: UserInteraction) {
		interaction.enableFor(this)
		this.interactions.push(interaction)
	}

	dispatchEventToLayers(event: Event) {
		// Reverse order because top layer is (rendered) last
		for (let layer of this.layers.toReversed()) {
			let shouldPropagate = layer.dispatchEvent(event)
			// Layers can use event.preventDefault() to block layers below them from receiving the event
			if (!shouldPropagate)
				break
		}
	}

	onClick(x: number, y: number) {
		this.dispatchEventToLayers(new CoordEvent("click", {x, y}))
	}

	onHover(x: number, y: number) {
		this.dispatchEventToLayers(new CoordEvent("hover", {x, y}))
	}

	setCenter(x: number, y: number) {
		if (x !== this.centerX || y !== this.centerY) {
			this.centerX = x
			this.centerY = y
			this.dispatchEventToLayers(new CoordEvent("pan", {x, y}))
		}
	}

	getCenter() {
		return {x: this.centerX, y: this.centerY}
	}

	setZoom(zoom: number) {
		if (zoom !== this.zoom) {
			this.zoom = zoom
			this.dispatchEventToLayers(new ZoomEvent("zoom", {zoom}))
		}
	}

	getZoom() {
		return this.zoom
	}

	canvas2map(canvasX: number, canvasY: number) {
		let canvasCenterX = this.resolutionWidth  / 2,	// Todo: Wrong with resolution other than native
			canvasCenterY = this.resolutionHeight / 2
		let offsetX = canvasX - canvasCenterX,	// Fix: canvasX * (this.resolutionWidth / this.getCanvasElement().clientWidth) - canvasCenterX
			offsetY = canvasY - canvasCenterY
		let scale = 1 / Math.pow(2, this.zoom)
		return {
			x: this.centerX + scale * offsetX,
			y: this.centerY + scale * offsetY
		}
	}

	map2canvas(mapX: number, mapY: number) {
		let canvasCenterX = this.resolutionWidth  / 2,
			canvasCenterY = this.resolutionHeight / 2
		let offsetX = mapX - this.centerX,
			offsetY = mapY - this.centerY
		let scale = Math.pow(2, this.zoom)
		return {
			x: canvasCenterX + scale * offsetX,
			y: canvasCenterY + scale * offsetY
		}
	}

	render(time: number) {
		let gl = this.context

		let w = gl.drawingBufferWidth,
			h = gl.drawingBufferHeight

		if (w !== this.resolutionWidth || h !== this.resolutionHeight) {
			this.resolutionWidth = w
			this.resolutionHeight = h
			this.dispatchEventToLayers(new ResizeEvent("resize", {width: w, height: h}))
		}

		gl.viewport(0, 0, w, h)
		gl.clearColor(0, 0, 0, 0)
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

		for (let layer of this.layers) {
			layer.render(time)
		}
	}
}

export { GLMap }