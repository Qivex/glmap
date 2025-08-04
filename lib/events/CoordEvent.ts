import type { CoordEventInit } from "../types/types"

class CoordEvent extends Event {
	x: number
	y: number

	constructor(type: string, init: CoordEventInit) {
		super(type, {cancelable: true})
		this.x = init.x
		this.y = init.y
	}
}

export { CoordEvent }