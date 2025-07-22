import { GLMap } from "./GLMap"

import { TileLayer } from "./layers/TileLayer"
import { MarkerLayer } from "./layers/MarkerLayer"
import { PopupLayer } from "./layers/PopupLayer"

import { Popup } from "./Popup"

import { PanInteraction } from "./interactions/PanInteraction"
import { ZoomInteraction } from "./interactions/ZoomInteraction"
import { HoverInteraction } from "./interactions/HoverInteraction"
import { PinchInteraction } from "./interactions/PinchInteraction"

class SimpleGLMap extends GLMap {
	tileLayer: TileLayer
	markerLayer: MarkerLayer
	popupLayer: PopupLayer


	constructor(canvasElement: HTMLCanvasElement) {
		super(canvasElement)
		// TEMP: Extracted into test*() functions to enable/disable easily in demo.js

		this.setCenter(64, 128)
		this.setZoom(6)
	}

	testTiles() {
		this.tileLayer = new TileLayer({
			glmap: this,
			context: this.context,
			tileWidth: 256,
			tileHeight: 256,
			tileURL: "https://s.rsg.sc/sc/images/games/GTAV/map/render/{z}/{x}/{y}.jpg",
			tileLimits: {
				minX: 0,
				maxX: 128,
				minY: 0,
				maxY: 192,
				minZoom: 0,
				maxZoom: 7
			}
		})
		this.addMapLayer(this.tileLayer)
	}

	testMarker() {
		this.markerLayer = new MarkerLayer({
			glmap: this,
			context: this.context,
			maxIconCount: 16,
			maxIconWidth: 32,
			maxIconHeight: 32
		})
		this.addMapLayer(this.markerLayer)

		let ml = this.markerLayer

		// Create icons
		let canvas = new OffscreenCanvas(32, 32)
		let ctx = canvas.getContext("2d")
		if (ctx === null)
			throw new Error("Context creation failed")

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
				ml.addMarker(x+32, y+96, Math.floor((Math.random() * 6)))
			}
		}
	}

	testPopup() {
		this.popupLayer = new PopupLayer({
			glmap: this,
			context: this.context
		})
		this.addMapLayer(this.popupLayer)

		let testPopup = new Popup(document.getElementById("popup"), 50, 25)
		testPopup.showAt(64, 128)
		this.popupLayer.addPopup(testPopup)
	}

	testPanning() {
		this.addUserInteraction(new PanInteraction())
	}

	testZooming() {
		this.addUserInteraction(new ZoomInteraction())
	}

	testHover() {
		this.addUserInteraction(new HoverInteraction())
	}

	testPinch() {
		this.addUserInteraction(new PinchInteraction())
	}

	render(time: number) {
		//this.setZoom(1.5 * Math.sin(time / 1000) + 5.5)
		super.render(time)
	}
}

export { SimpleGLMap }