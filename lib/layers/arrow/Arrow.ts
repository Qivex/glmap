import { MapElement } from "../element/MapElement"

type Point = [number, number]
type Color = [number, number, number, number]

type ArrowInfo = {
	startPoint: Point,
	endPoint: Point,
	color?: Color
}

class Arrow extends MapElement {
	startPoint: Point
	endPoint: Point
	color: Color

	constructor(config: ArrowInfo) {
		super()
		const {
			startPoint,
			endPoint,
			color = [0, 0, 0, 1]
		} = config
		Object.assign(this, {startPoint, endPoint, color})
	}

	serialize(): Array<number> {
		return [...this.startPoint, ...this.endPoint, ...this.color]
	}
}

export { Arrow }