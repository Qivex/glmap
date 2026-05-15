import { MapLayerProgram } from "../MapLayerProgram"
import type { MapElement } from "./MapElement"

type vectorSize = 1|2|3|4
type dataFormat = WebGLRenderingContextBase["BYTE"|"SHORT"|"UNSIGNED_BYTE"|"UNSIGNED_SHORT"|"FLOAT"]

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
		gl.vertexAttribPointer(location, 2, gl.UNSIGNED_BYTE, false, 0, 0)
		gl.bufferData(gl.ARRAY_BUFFER, new Uint8Array([0,0, 0,1, 1,0, 1,1]), gl.STATIC_DRAW)
	}

	// Define layout of attributes in elementBuffer
	initElementAttributes(attributes: Array<{name: string, length: vectorSize, format?: dataFormat}>) {
		let gl = this.context
		function getByteLength(format?: dataFormat) {
			switch(format) {
				case gl.BYTE:
				case gl.UNSIGNED_BYTE:
					return 1
				case gl.SHORT:
				case gl.UNSIGNED_SHORT:
					return 2
				case gl.FLOAT:
				default:
					return 4
			}
		}
		// Total length of attributes = stride
		let stride = 0
		for (let a of attributes) {
			stride += a.length * getByteLength(a.format)
		}
		// Create buffer
		let buffer = gl.createBuffer()
		gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
		// Attributes are tightly packed in buffer
		let offset = 0
		for (let a of attributes) {
			let location = gl.getAttribLocation(this.program, a.name)
			gl.enableVertexAttribArray(location)
			gl.vertexAttribPointer(location, a.length, a.format? a.format : gl.FLOAT, false, stride, offset)
			gl.vertexAttribDivisor(location, 1)	// Buffer data once per instance (instead of per vertex)
			offset += a.length * getByteLength(a.format)
		}
		console.assert(offset == stride)
		this.elementBuffer = buffer
	}

	setElements(elements: Set<MapElement>) {
		this.elementCount = elements.size

		for (let first of elements) {
			// Initialize array to avoid resize
			let stride = first.serialized.byteLength
			let data = new Uint8Array(elements.size * stride)

			// Concat all serialized elements
			let offset = 0
			for (let el of elements) {
				data.set(el.serialized, offset)
				offset += stride
			}

			// Upload data to buffer
			let gl = this.context
			gl.bindBuffer(gl.ARRAY_BUFFER, this.elementBuffer)
			gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW)

			break
		}
	}

	draw() {
		let gl = this.context
		gl.bindVertexArray(this.attributeArray)
		gl.drawArraysInstanced(gl.TRIANGLE_STRIP, 0, 4, this.elementCount)
	}
}

export { ElementProgram }