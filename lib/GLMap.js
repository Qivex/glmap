import { CanvasContext } from "./CanvasContext"

class GLMap extends CanvasContext {
	constructor(canvasElement) {
		super(canvasElement)

		this.layers = []
		this.interactions = []


		let render = (time) => {
			this.render(time)
			requestAnimationFrame(render)
		}
		render(0)
	}

	addMapLayer(layer) {
		this.layers.push(layer)
	}

	addUserInteraction(interaction) {
		interaction.enableFor(this)
		this.interactions.push(interaction)
	}

	render(time) {
		let gl = this.context

		let w = gl.canvas.clientWidth,
			h = gl.canvas.clientHeight

		gl.viewport(0, 0, w, h)
		gl.clearColor(0, 0, 0, 0)
		gl.clear(gl.COLOR_BUFFER_BIT)

		for (let layer of this.layers) {
			layer.render(time)
		}
	}
}

export { GLMap }