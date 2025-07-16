import { CanvasContext } from "./CanvasContext"

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
		// Send initial state (processed before first render)
		layer.setCenter(this.centerX, this.centerY)
		layer.setZoom(this.zoom)
		layer.setResolution(this.resolutionWidth, this.resolutionHeight)
	}

	addUserInteraction(interaction: UserInteraction) {
		interaction.enableFor(this)
		this.interactions.push(interaction)
	}

	setCenter(x: number, y: number) {
		this.centerX = x
		this.centerY = y
		for (let layer of this.layers) {
			layer.setCenter(x, y)
		}
	}

	getCenter() {
		return {x: this.centerX, y: this.centerY}
	}

	setZoom(zoom: number) {
		this.zoom = zoom
		for (let layer of this.layers) {
			layer.setZoom(zoom)
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

	render(time: number) {
		let gl = this.context

		let w = gl.drawingBufferWidth,
			h = gl.drawingBufferHeight

		if (w !== this.resolutionWidth || h !== this.resolutionHeight) {
			this.resolutionWidth = w
			this.resolutionHeight = h
			for (let layer of this.layers) {
				layer.setResolution(w, h)
			}
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