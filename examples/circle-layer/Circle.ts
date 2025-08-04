type Point = [number, number]
type Color = [number, number, number, number]

type CircleInfo = {
	center: Point,
	radius: number,
	color?: Color
}

class Circle {
	center: Point
	radius: number
	color: Color

	constructor(config: CircleInfo) {
		const {
			center,
			radius,
			color = [0, 0, 0, 1]
		} = config
		Object.assign(this, {center, radius, color})
	}
}

export { Circle }