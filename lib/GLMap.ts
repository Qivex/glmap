import { CanvasContext } from "./CanvasContext"

import { CoordEvent } from "./events/CoordEvent"
import { ResizeEvent } from "./events/ResizeEvent"
import { ZoomEvent } from "./events/ZoomEvent"

import type { UserInteraction } from "./interactions/UserInteraction"
import type { MapLayer } from "./MapLayer"


class GLMap extends CanvasContext {
	layers: Array<MapLayer> = []
	interactions: Array<UserInteraction> = []

	centerX = 0
	centerY = 0
	zoom = 0
	resolutionWidth: number
	resolutionHeight: number

	uniformBuffer: WebGLBuffer | null

	renderRequired = true

	constructor(canvasElement: HTMLCanvasElement) {
		super(canvasElement)

		let gl = this.context
		gl.clearColor(0, 0, 0, 0)
		this.resolutionWidth = gl.drawingBufferWidth
		this.resolutionHeight =  gl.drawingBufferHeight

		// Shared uniform buffer object provides resolution, center & zoom to every MapLayer
		this.uniformBuffer = gl.createBuffer()
		gl.bindBuffer(gl.UNIFORM_BUFFER, this.uniformBuffer)
		gl.bufferData(gl.UNIFORM_BUFFER, 20, gl.STATIC_DRAW)	// vec2 + vec2 + float = 20 bytes
		gl.bindBufferBase(gl.UNIFORM_BUFFER, 0, this.uniformBuffer)

		let render = (time: number) => {
			this.render(time)
			requestAnimationFrame(render)
		}
		render(0)
	}

	addMapLayer(layer: MapLayer) {
		this.layers.push(layer)
		this.requireRender()
	}

	addUserInteraction(interaction: UserInteraction) {
		interaction.enableFor(this)
		this.interactions.push(interaction)
	}

	dispatchEventToLayers(event: Event) {
		// Assume all events require re-render except HoverEvent
		if (event.type !== "hover") this.requireRender()
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
			this.requireRender()
		}
	}

	getCenter() {
		return {x: this.centerX, y: this.centerY}
	}

	setZoom(zoom: number) {
		if (zoom !== this.zoom) {
			this.zoom = zoom
			this.requireRender()
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

	requireRender() {
		this.renderRequired = true
	}

	render(time: number) {
		let gl = this.context

		let w = gl.drawingBufferWidth,
			h = gl.drawingBufferHeight

		if (w !== this.resolutionWidth || h !== this.resolutionHeight) {
			this.resolutionWidth = w
			this.resolutionHeight = h
			this.requireRender()
		}

		// Skip rendering when idle
		if (this.renderRequired === true) {
			this.renderRequired = false
			
			console.log("render")

			// Update shared uniform buffer
			gl.bindBuffer(gl.UNIFORM_BUFFER, this.uniformBuffer)
			gl.bufferSubData(gl.UNIFORM_BUFFER, 0, new Float32Array([w, h, this.centerX, this.centerY, this.zoom]))

			// Clear viewport
			gl.viewport(0, 0, w, h)
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

			for (let layer of this.layers) {
				layer.render(time)
			}
		}
	}
}

export { GLMap }