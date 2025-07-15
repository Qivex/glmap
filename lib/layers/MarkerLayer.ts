import { MapLayer } from "./MapLayer"
import { MarkerProgram } from "../programs/MarkerProgram"
import { IconStorage } from "../storage/IconStorage"


type MarkerLayerConfig = {
	context: WebGL2RenderingContext,
	maxIconWidth: number,
	maxIconHeight: number,
	maxIconCount: number
}


class MarkerLayer extends MapLayer {
	markerProgram: MarkerProgram
	iconStorage: IconStorage

	defaultIconIndex = 0

	markerIndexes: Array<number> = []
	markerLatLngs: Array<number> = []

	hasUpdatedMarkers = false

	constructor(config: MarkerLayerConfig) {
		super()

		const {
			context,
			maxIconWidth,
			maxIconHeight,
			maxIconCount
		} = config

		// Setup shader program
		let mp = new MarkerProgram(context)
		this.markerProgram = mp
		
		// Create texture storage for icons
		this.iconStorage = new IconStorage(context, maxIconCount, maxIconWidth, maxIconHeight)
		mp.setMarkerTexture(this.iconStorage.getTextureBinding())	// Should never change
	}

	onPan(x: number, y: number) {
		this.markerProgram.activate()
		this.markerProgram.setCenter(x, y)
	}

	onZoom(z: number) {
		this.markerProgram.activate()
		this.markerProgram.setZoom(z)
	}

	onResize(w: number, h: number) {
		this.markerProgram.activate()
		this.markerProgram.setResolution(w, h)
	}

	createIcon(image: CanvasImageSource, width: number, height: number, anchorX: number, anchorY: number) {
		let iconIndex = this.iconStorage.createIcon(image, width, height, anchorX, anchorY)
		return iconIndex	// Todo: Wrap this with class which has wrapper functions to get/set values
	}

	addMarker(lat: number, lng: number, iconIndex: number) {
		this.hasUpdatedMarkers = true

		if (typeof iconIndex != "number")
			iconIndex = this.defaultIconIndex

		this.markerIndexes.push(iconIndex)
		this.markerLatLngs.push(lat, lng)
		// Todo: Same as with Icon, use wrapper class for ref when removing is required
	}

	render(time: number) {
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