type Point = [number, number]
type Color = [number, number, number, number]

type ArrowInfo = {
	startPoint: Point,
	endPoint: Point,
	color?: Color
}

class Arrow {
	startPoint: Point
	endPoint: Point
	color: Color

	constructor(config: ArrowInfo) {
		const {
			startPoint,
			endPoint,
			color = [0, 0, 0, 1]
		} = config
		Object.assign(this, {startPoint, endPoint, color})
	}
}

export { Arrow }