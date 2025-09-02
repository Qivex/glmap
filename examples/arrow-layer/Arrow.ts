type Point = [number, number]
type Color = [number, number, number, number]

type ArrowInfo = {
	startPoint: Point,
	endPoint: Point,
	headSize?: Point,
	lineWidth?: number,
	headPeriod?: number,
	color?: Color
}

class Arrow {
	startPoint: Point
	endPoint: Point
	headSize: Point
	lineWidth: number
	headPeriod: number
	color: Color

	constructor(config: ArrowInfo) {
		const {
			startPoint,
			endPoint,
			headSize = [20,20],
			lineWidth = 4,
			headPeriod = 100,
			color = [0, 0, 0, 1]
		} = config
		Object.assign(this, {startPoint, endPoint, headSize, lineWidth, headPeriod, color})
	}
}

export { Arrow }