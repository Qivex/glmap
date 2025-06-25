import { RenderTarget } from "./RenderTarget.js"

import { BufferShiftProgram } from "./BufferShiftProgram.js"

class MapPane {
	constructor(gl, width, height) {
		this.context = gl
		this.width = width
		this.height = height

		// Target cant render to itself -> 2 required
		this.primaryTarget   = new RenderTarget(gl, width, height)
		this.secondaryTarget = new RenderTarget(gl, width, height)

		// Shader to render shifted framebuffer
		let p = new BufferShiftProgram(gl)
		p.activate()
		p.setResolution(width, height)
		this.shiftProgram = p

		// Shader to render zoomed framebuffer
		// TODO
	}

	getTarget() {
		return this.primaryTarget
	}

	switchTargets() {
		let temp = this.primaryTarget
		this.primaryTarget = this.secondaryTarget
		this.secondaryTarget = temp
	}

	// Move the entire texture content
	shiftPixels(horizontalShift, verticalShift) {
		let gl = this.context

		let before = this.getTarget()

		// Shortcut when shift is too large
		if (Math.abs(horizontalShift) > this.width || Math.abs(verticalShift) > this.height) {
			gl.bindFramebuffer(gl.FRAMEBUFFER, before.getBuffer())
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
			return
		}

		this.switchTargets()
		let after = this.getTarget()

		// Clear output textures
		gl.bindFramebuffer(gl.FRAMEBUFFER, after.getBuffer())
		gl.clearColor(0, 1, 0, 1)
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
		gl.viewport(0, 0, this.width, this.height)


		let p = this.shiftProgram
		p.activate()
		p.setPixelShift(horizontalShift, verticalShift)
		p.setColorTexture(before.getColor())
		p.setDepthTexture(before.getDepth())
		p.draw()

		/*
		// Set source
		gl.bindFramebuffer(gl.FRAMEBUFFER, before.getBuffer())

		// Copy pixels
		gl.bindTexture(gl.TEXTURE_2D, after.getColor())
		gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.RGBA, horizontalShift, verticalShift, this.width, this.height, 0)

		gl.bindTexture(gl.TEXTURE_2D, after.getDepth())
		// Not possible :/
		gl.copyTexSubImage2D(gl.TEXTURE_2D, 0, 0, 0, horizontalShift, verticalShift, this.width, this.height)
		//gl.copyTexImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, horizontalShift, verticalShift, this.width, this.height, 0)
		*/
		
	}
}

export { MapPane }