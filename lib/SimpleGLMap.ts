import { GLMap } from "./GLMap"

import { TileLayer } from "./layers/TileLayer"
import { MarkerLayer } from "./layers/MarkerLayer"
import { PopupLayer } from "./layers/PopupLayer"

import { Popup } from "./Popup"
import { Marker } from "./wrapper/Marker"

import { ZoomInteraction } from "./interactions/ZoomInteraction"
import { HoverInteraction } from "./interactions/HoverInteraction"
import { PinchInteraction } from "./interactions/PinchInteraction"
import { ClickInteraction } from "./interactions/ClickInteraction"

import style from "./style/glmap.css?raw"

import { CircleLayer } from "../examples/circle-layer/CircleLayer"
import { Circle } from "../examples/circle-layer/Circle"

class SimpleGLMap extends GLMap {
	tileLayer: TileLayer
	markerLayer: MarkerLayer
	popupLayer: PopupLayer
	circleLayer: CircleLayer


	constructor(canvasElement: HTMLCanvasElement) {
		super(canvasElement)
		// TEMP: Extracted into test*() functions to enable/disable easily in demo.js

		// Add style (while not modifying header)
		let sheet = new CSSStyleSheet()
		document.adoptedStyleSheets.push(sheet)
		sheet.replace(style)
		canvasElement.classList.add("glmap")

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
			maxIconHeight: 32,
			iconHitTest: "alpha"
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
			ctx.fillStyle = "rgba(0,0,0,0.004)"	// Barely visible, but enough to pass alpha hit test
			ctx.lineWidth = 2
			ctx.ellipse(16, 16, 15, 15, 0, 0, 2*Math.PI, false)
			ctx.fill()
			ctx.stroke()
			/* Note: Neither width of image nor width parameter need to match maxIconWidth/Height:
			- Image is scaled before storage
			- Icon gets rescaled during render */
			return ml.createIcon(canvas, 32, 32, 16, 16)
		})

		// Dropped frames above 128x256
		for (let x = 0; x <= 64; x++) {
			for (let y = 0; y <= 64; y++) {
				let marker = new Marker(x+32, y+96, icons[Math.floor((Math.random() * 6))])
				ml.addMarker(marker)
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

		for (let marker of this.markerLayer.activeMarkers) {
			marker.addEventListener("click", () => {
				this.popupLayer.removePopup(testPopup)
				testPopup.element.childNodes[1].textContent = `${marker.x},${marker.y}`
				testPopup.setLocation(marker.x, marker.y)
				this.popupLayer.addPopup(testPopup)
			})
		}
		this.tileLayer.addEventListener("click", () => this.popupLayer.removePopup(testPopup))
	}

	testCircle() {
		this.circleLayer = new CircleLayer({
			glmap: this,
			context: this.context
		})
		this.addMapLayer(this.circleLayer)

		this.circleLayer.addCircle(new Circle({center: [64,128], radius: 5, color: [1,1,0,0.2]}))
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

	testClick() {
		this.addUserInteraction(new ClickInteraction())
	}
}

export { SimpleGLMap }