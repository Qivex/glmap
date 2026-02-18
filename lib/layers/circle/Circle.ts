import { MapElement } from "../element/MapElement"

type Point = [number, number]
type Color = [number, number, number, number]

type CircleInfo = {
	center: Point,
	radius: number,
	color?: Color
}

class Circle extends MapElement {
	center: Point
	radius: number
	color: Color

	constructor(config: CircleInfo) {
		super()
		const {
			center,
			radius,
			color = [0, 0, 0, 1]
		} = config
		Object.assign(this, {center, radius, color})
	}

	serialize(): Array<number> {
		return [...this.center, this.radius, ...this.color]
	}
}

export { Circle }