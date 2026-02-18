import { ElementProgram } from "../element/ElementProgram"

import vs from "./shader/circle.vertex.glsl?raw"
import fs from "./shader/circle.fragment.glsl?raw"

class CircleProgram extends ElementProgram {
	constructor(context: WebGL2RenderingContext) {
		super(context)
		this.compile(vs, fs)
		let gl = context

		// Store attributes
		this.attributeArray = gl.createVertexArray()
		gl.bindVertexArray(this.attributeArray)

		this.initDefaultMesh()
		this.initElementAttributes([
			{name: "circlePos", length: 2},
			{name: "radius", length: 1},
			{name: "color", length: 4}
		])
	}
}

export { CircleProgram }