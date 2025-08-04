import type { ZoomEventInit } from "../types/types"

class ZoomEvent extends Event {
	zoom: number

	constructor(type: string, init: ZoomEventInit) {
		super(type, {cancelable: true})
		this.zoom  = init.zoom
	}
}

export { ZoomEvent }