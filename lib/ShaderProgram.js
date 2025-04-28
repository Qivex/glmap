// Handles compilation of shader code
class ShaderProgram {
	constructor(context) {
		if (!(context instanceof WebGL2RenderingContext))
			throw new Error("Invalid context!")
		this.context = context
	}

	compile(vertexShaderCode, fragmentShaderCode) {
		let gl = this.context
		// Check params
		if (vertexShaderCode === null)
			throw new Error("No vertex shader provided!")
		if (fragmentShaderCode === null)
			throw new Error("No fragment shader provided!")
		// Compile code
		let vertexShader   = this.compileShader(vertexShaderCode,   gl.VERTEX_SHADER)
		let fragmentShader = this.compileShader(fragmentShaderCode, gl.FRAGMENT_SHADER)
		// Combine into program
		this.program = this.linkProgram(vertexShader, fragmentShader)
	}

	compileShader(code, type) {
		let gl = this.context
		// Setup compilation
		let shader = gl.createShader(type)
		gl.shaderSource(shader, code)
		gl.compileShader(shader)
		// Check for errors
		if (gl.getShaderParameter(shader, gl.COMPILE_STATUS) === false) {
			let log = gl.getShaderInfoLog(shader)
			gl.deleteShader(shader)
			throw new Error("Shader compilation failed: " + log)
		}
		return shader
	}

	linkProgram(vertexShader, fragmentShader) {
		let gl = this.context
		// Setup linking
		let program = gl.createProgram()
		gl.attachShader(program, vertexShader)
		gl.attachShader(program, fragmentShader)
		gl.linkProgram(program)
		// Check for errors
		if (gl.getProgramParameter(program, gl.LINK_STATUS) === false) {
			let log = gl.getProgramInfoLog(program)
			gl.deleteProgram(program)
			throw new Error("Linking program failed: " + log)
		}
		return program
	}

	activate() {
		this.context.useProgram(this.program)
	}
}

export { ShaderProgram }