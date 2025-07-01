import { GLMap } from "./GLMap"
import { MarkerLayer } from "./layers/MarkerLayer"

class SimpleGLMap extends GLMap {
	constructor(canvasElement) {
		super(canvasElement)

		//this.tileLayer = new TileLayer()
		this.markerLayer = new MarkerLayer({
			context: this.context,
			maxIconCount: 16,
			maxIconWidth: 32,
			maxIconHeight: 32
		})

		//this.addMapLayer(this.tileLayer)
		this.addMapLayer(this.markerLayer)
	}

	test() {
		let ml = this.markerLayer

		// Create icons
		let canvas = new OffscreenCanvas(32, 32)
		let ctx = canvas.getContext("2d")

		// Should be [0,1,2]
		let icons = ["red", "lime", "blue", "yellow", "purple", "black"].map(color => {
			// Draw some test icon
			ctx.strokeStyle = color
			ctx.lineWidth = 2
			ctx.ellipse(16, 16, 15, 15, 0, 0, 2*Math.PI, false)
			ctx.stroke()
			/* Note: Neither width of image nor width parameter need to match maxIconWidth/Height:
			- Image is scaled before storage
			- Icon gets rescaled during render */
			return ml.createIcon(canvas, 32, 32, 16, 16)
		})

		// Dropped frames above 128x256
		for (let x = 0; x <= 64; x++) {
			for (let y = 0; y <= 64; y++) {
				ml.addMarker(x, y, Math.floor((Math.random() * 6)))
			}
		}
	}

	addMarker() {
		this.markerLayer.addMarker()
	}
}

export { SimpleGLMap }