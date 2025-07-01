import { MapLayer } from "./MapLayer"
import { MarkerProgram } from "../programs/MarkerProgram"
import { IconStorage } from "../IconStorage"


class MarkerLayer extends MapLayer {
	constructor(config) {
		super(config)

		// Read from config
		this.maxIconWidth = config.maxIconWidth
		this.maxIconHeight = config.maxIconHeight
		this.maxIconCount = config.maxIconCount

		// Setup shader program
		let mp = new MarkerProgram(config.context)
		this.markerProgram = mp
		
		// Create texture storage for icons
		this.iconStorage = new IconStorage(config.context, this.maxIconCount, this.maxIconWidth, this.maxIconHeight)
		mp.setMarkerTexture(this.iconStorage.getTexture())	// Should never change

		this.defaultIconIndex = 0

		// Store marker data
		this.markerIndexes = []
		this.markerLatLngs = []
	}

	createIcon(image, width, height, anchorX, anchorY) {
		let iconIndex = this.iconStorage.createIcon(image, width, height, anchorX, anchorY)
		return iconIndex	// Todo: Wrap this with class which has wrapper functions to get/set values
	}

	addMarker(lat, lng, iconIndex) {
		this.hasUpdatedMarkers = true

		if (typeof iconIndex != "number")
			iconIndex = this.defaultIconIndex

		this.markerIndexes.push(iconIndex)
		this.markerLatLngs.push(lat, lng)
		// Todo: Same as with Icon, use wrapper class for ref when removing is required
	}

	render(time) {
		let mp = this.markerProgram
		mp.activate()

		// Temp: This will later be handled by events sent from GLMap (onPan, onZoom, onResize etc.)
		let gl = mp.context
		let w = gl.canvas.clientWidth,
			h = gl.canvas.clientHeight
		mp.setResolution(w, h)

		// Temp: Simple animation
		mp.setZoom(Math.sin(time / 1000) + 4)
		mp.setCenter(32, 32)

		// Only update program buffers at most once per draw call
		if (this.hasUpdatedMarkers) {
			mp.setMarkerIcons(this.markerIndexes)
			mp.setMarkerCoordinates(this.markerLatLngs)
			
			let iconData = this.iconStorage.constructBufferDataForIcons(this.markerIndexes)
			mp.setMarkerSizes(iconData.dimensions)
			mp.setMarkerAnchors(iconData.anchors)

			this.hasUpdatedMarkers = false
		}
		
		mp.draw()
	}
}

export { MarkerLayer }