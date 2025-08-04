import type { GLMap } from "../GLMap"
import type { MapLayerConfig } from "../types/types"

class MapLayer extends EventTarget {
	glmap: GLMap
	context: WebGL2RenderingContext

	constructor(config: MapLayerConfig) {
		super()

		const {
			glmap,
			context
		} = config

		this.glmap = glmap
		this.context = context
	}

	get centerX() {
		return this.glmap.centerX
	}

	get centerY() {
		return this.glmap.centerY
	}

	get zoom() {
		return this.glmap.zoom
	}

	get width() {
		return this.glmap.resolutionWidth
	}

	get height() {
		return this.glmap.resolutionHeight
	}

	render(time: number) {}
}

export { MapLayer }