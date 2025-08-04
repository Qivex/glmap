import type { ResizeEventInit } from "../types/types"

class ResizeEvent extends Event {
	width: number
	height: number

	constructor(type: string, init: ResizeEventInit) {
		super(type, {cancelable: true})
		this.width  = init.width
		this.height = init.height
	}
}

export { ResizeEvent }