// Handles compilation of shader code
class ShaderProgram {
	context: WebGL2RenderingContext
	program: WebGLProgram

	constructor(context: WebGL2RenderingContext) {
		this.context = context
	}

	compile(vertexShaderCode: string, fragmentShaderCode: string) {
		let gl = this.context
		// Compile code
		let vertexShader   = this.compileShader(vertexShaderCode,   gl.VERTEX_SHADER)
		let fragmentShader = this.compileShader(fragmentShaderCode, gl.FRAGMENT_SHADER)
		// Combine into program
		this.program = this.linkProgram(vertexShader, fragmentShader)
	}

	compileShader(code: string, type: number): WebGLShader {
		let gl = this.context
		// Setup compilation
		let shader = gl.createShader(type)
		if (shader === null)
			throw new Error("Shader creation failed")
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

	linkProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram {
		let gl = this.context
		// Setup linking
		let program = gl.createProgram()
		if (program === null)
			throw new Error("Program creation failed")
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
		let gl = this.context
		if (gl.getParameter(gl.CURRENT_PROGRAM) != this.program)
			this.context.useProgram(this.program)
	}
}

export { ShaderProgram }