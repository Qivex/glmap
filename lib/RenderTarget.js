// Wraps framebuffer handling
class RenderTarget {
	constructor(gl, width, height) {
		this.context = gl
		this.width = width
		this.height = height

		// Init framebuffer
		this.framebuffer = gl.createFramebuffer()
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)

		// Connect with color & depth texture
		this.colorTexture = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D, this.colorTexture)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)	// Without this the output is full black...
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorTexture, 0)

		this.depthTexture = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D, this.depthTexture)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT24, width, height, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null)
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, this.depthTexture, 0)

		// Fill textures (otherwise alignment is broken)
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

		// Clear bindings
		gl.bindFramebuffer(gl.FRAMEBUFFER, null)
		gl.bindTexture(gl.TEXTURE_2D, null)
	}

	getBuffer() {
		return this.framebuffer
	}

	getColor() {
		return this.colorTexture
	}

	getDepth() {
		return this.depthTexture
	}

	activate() {
		let gl = this.context
		gl.bindFramebuffer(gl.FRAMEBUFFER, this.framebuffer)
		gl.viewport(0, 0, this.width, this.height)
	}
}

export { RenderTarget }