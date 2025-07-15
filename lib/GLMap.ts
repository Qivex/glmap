import { CanvasContext } from "./CanvasContext"

class GLMap extends CanvasContext {
	constructor(canvasElement) {
		super(canvasElement)

		this.layers = []
		this.interactions = []

		this.centerX = 0
		this.centerY = 0
		this.zoom = 0
		this.resolutionWidth = this.context.drawingBufferWidth
		this.resolutionHeight =  this.context.drawingBufferHeight

		let render = (time) => {
			this.render(time)
			requestAnimationFrame(render)
		}
		render(0)
	}

	addMapLayer(layer) {
		this.layers.push(layer)
		// Send initial state (processed before first render)
		layer.onPan(this.centerX, this.centerY)
		layer.onZoom(this.zoom)
		layer.onResize(this.resolutionWidth, this.resolutionHeight)
	}

	addUserInteraction(interaction) {
		interaction.enableFor(this)
		this.interactions.push(interaction)
	}

	setCenter(x, y) {
		this.centerX = x
		this.centerY = y
		for (let layer of this.layers) {
			layer.onPan(x, y)
		}
	}

	getCenter() {
		return {x: this.centerX, y: this.centerY}
	}

	setZoom(zoom) {
		this.zoom = zoom
		for (let layer of this.layers) {
			layer.onZoom(zoom)
		}
	}

	getZoom() {
		return this.zoom
	}

	canvas2map(canvasX, canvasY) {
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

	render(time) {
		let gl = this.context

		let w = gl.drawingBufferWidth,
			h = gl.drawingBufferHeight

		if (w !== this.resolutionWidth || h !== this.resolutionHeight) {
			this.resolutionWidth = w
			this.resolutionHeight = h
			for (let layer of this.layers) {
				layer.onResize(w, h)
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