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

	onPan(x, y) {
		this.markerProgram.activate()
		this.markerProgram.setCenter(x, y)
	}

	onZoom(z) {
		this.markerProgram.activate()
		this.markerProgram.setZoom(z)
	}

	onResize(w, h) {
		this.markerProgram.activate()
		this.markerProgram.setResolution(w, h)
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

		// Only update program buffers at most once per draw call
		if (this.hasUpdatedMarkers) {
			this.hasUpdatedMarkers = false

			mp.setMarkerIcons(this.markerIndexes)
			mp.setMarkerCoordinates(this.markerLatLngs)
			
			let iconData = this.iconStorage.constructBufferDataForIcons(this.markerIndexes)
			mp.setMarkerSizes(iconData.dimensions)
			mp.setMarkerAnchors(iconData.anchors)
		}
		
		mp.draw()
	}
}

export { MarkerLayer }