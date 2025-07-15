abstract class MapLayer {
	constructor() {
		// Calculations for padding & offset
	}

	abstract onPan(newCenterX: number, newCenterY: number): void

	abstract onZoom(newZoom: number): void

	abstract onResize(newWidth: number, newHeight: number): void

	abstract render(time: number): void
}

export { MapLayer }