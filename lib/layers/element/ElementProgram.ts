import { MapLayerProgram } from "../MapLayerProgram"
import type { MapElement } from "./MapElement"

abstract class ElementProgram extends MapLayerProgram {
	attributeArray: WebGLVertexArrayObject | null	// Into parent?

	elementCount = 0
	elementBuffer: WebGLBuffer | null	// Includes all attributes for the elements

	constructor(context: WebGL2RenderingContext) {
		super(context)
	}

	// Fill vertex buffer with default rectangle
	initDefaultMesh() {	// Also into parent?
		let gl = this.context
		// Add to VAO
		let location = gl.getAttribLocation(this.program, "vertexPos")
		gl.enableVertexAttribArray(location)
		// Fill buffer data
		let buffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
		gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0,0, 0,1, 1,0, 1,1]), gl.STATIC_DRAW)
	}

	// Define layout of attributes in elementBuffer
	initElementAttributes(attributes: Array<{name: string, length: number}>) {
		// Total length of attributes = stride
		let stride = 0
		for (let a of attributes) {
			stride += a.length
		}
		// Create buffer
		let gl = this.context
		let buffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
		// Consecutive attributes in buffer
		let offset = 0
		for (let a of attributes) {
			let location = gl.getAttribLocation(this.program, a.name)
			gl.enableVertexAttribArray(location)
			gl.vertexAttribPointer(location, a.length, gl.FLOAT, false, 4*stride, 4*offset)
			gl.vertexAttribDivisor(location, 1)	// Buffer data once per instance (instead of per vertex)
			offset += a.length
		}
		console.assert(offset == stride)
		this.elementBuffer = buffer
	}

	setElements(elements: Set<MapElement>) {
		this.elementCount = elements.size
		// Serialize attribute data of each element
		let data = []
		for (let el of elements) {
			data.push(...el.serialize())
		}
		// Upload to buffer
		let gl = this.context
		gl.bindBuffer(gl.ARRAY_BUFFER, this.elementBuffer)
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW)
	}

	draw() {
		let gl = this.context
		gl.bindVertexArray(this.attributeArray)
		gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.elementCount)
	}
}

export { ElementProgram }