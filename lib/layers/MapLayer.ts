import type { GLMap } from "../GLMap"
import type { MapLayerConfig } from "../types/types"

abstract class MapLayer {
	glmap: GLMap
	context: WebGL2RenderingContext

	centerX = 0
	centerY = 0
	zoom = 0
	width = 0
	height = 0

	constructor(config: MapLayerConfig) {
		const {
			glmap,
			context
		} = config

		this.glmap = glmap
		this.context = context
	}

	setCenter(centerX: number, centerY: number) {
		if (centerX !== this.centerX || centerY !== this.centerY) {
			this.centerX = centerX
			this.centerY = centerY
			this.onPan(centerX, centerY)
		}
	}

	setZoom(zoom: number) {
		if (zoom !== this.zoom) {
			this.zoom = zoom
			this.onZoom(zoom)
		}
	}

	setResolution(width: number, height: number) {
		if (width !== this.width || height !== this.height) {
			this.width = width
			this.height = height
			this.onResize(width, height)
		}
	}

	abstract onPan(newCenterX: number, newCenterY: number): void

	abstract onZoom(newZoom: number): void

	abstract onResize(newWidth: number, newHeight: number): void

	abstract onHover(pointerX: number, pointerY: number): void

	abstract onClick(pointerX: number, pointerY: number): void

	abstract render(time: number): void
}

export { MapLayer }