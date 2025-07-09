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