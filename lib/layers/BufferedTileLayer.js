import { MapLayer } from "./MapLayer"

import { TileProgram } from "../programs/BufferedTileProgram"
import { PaneProgram } from "../programs/PaneProgram"

import { RenderTarget } from "../RenderTarget"

import { TileSource } from "../TileSource"
import { TileStorage } from "../TileStorage"


function ceil(val, factor) {
	return Math.ceil(val / factor) * factor
}


class TileLayer extends MapLayer {
	constructor(config) {
		super(config)

		let gl = config.context
		this.context = gl

		this.tileWidth = config.tileWidth
		this.tileHeight = config.tileHeight

		let tp = new TileProgram(gl)
		this.tileProgram = tp

		this.paneProgram = new PaneProgram(gl)

		// Tiles are rendered once to framebuffer (instead of every frame)
		this.mainTarget = new RenderTarget(gl, 1920, 1080)
		this.tempTarget = new RenderTarget(gl, 1920, 1080)	// Todo: These will have to change when the display size changes!
	}

	onResize(oldWidth, oldHeight, newWidth, newHeight) {
		let oldGridWidth = ceil(oldWidth, this.tileWidth)
		let newGridWidth = ceil(newWidth, this.tileWidth)
		if (oldGridWidth !== newGridWidth || oldGridHeight !== newGridHeight) {
			this.tileProgram.setGridSize(newGridWidth, newGridHeight)
			// Create new RenderTarget(s)
			// Draw old buffer resized
		}
	}

	onZoom(oldZoom, newZoom) {
		let oldZoomLevel = Math.floor(oldZoom)
		let newzoomLevel = Math.floor(newZoom)

		this.paneProgram.setZoom(newZoom - zoomLevel + 1)	// always from [1,2[

		if (newZoomLevel !== oldZoomLevel) {
			this.tileProgram.setZoom(newzoomLevel)
			// Draw buffer rescaled
			// Fetch new tiles
		}
	}

	onPan(x, y) {
		// TODO: Move only framebuffer, shift when limit reached
	}

	shift(x, y) {
		// Translate the content of the framebuffer (including depth!)
		let gl = this.context
		let w = 1920
		let h = 1080

		this.mainTarget.activate("read")
		this.tempTarget.activate("draw")

		// First values when shift <0, second >0
		gl.blitFramebuffer(
			Math.max(-x, 0),
			Math.max(-y, 0),
			Math.min(w, w - x),
			Math.min(h, h - y),
			Math.max(0, x),
			Math.max(0, y),
			Math.min(w + x, w),
			Math.min(h + y, h),
			gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT,
			gl.NEAREST
		)

		// Second blit isnt strictly necessary if switching target, but buffer should be the same as before.
		// (other implementation shouldnt need to know a second framebuffer exists)

		this.mainTarget.activate("draw")
		this.tempTarget.activate("read")

		gl.blitFramebuffer(0, 0, w, h, 0, 0, w, h, gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT, gl.NEAREST)

		this.mainTarget.deactivate()
		this.tempTarget.deactivate()
		
	}

	render(time) {
		// Render framebuffer
		let pp = this.paneProgram

		pp.setOffset(0, 0)
		pp.setPaneSize(1920,1080)
		pp.setPaneTexture(this.mainTarget.getColor())

		pp.draw()
	}
}

export { TileLayer }