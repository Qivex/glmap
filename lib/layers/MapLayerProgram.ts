import { ShaderProgram } from "../ShaderProgram"

class MapLayerProgram extends ShaderProgram {
	compile(vertexShaderCode: string, fragmentShaderCode: string) {
		super.compile(vertexShaderCode, fragmentShaderCode)
		// Bind local uniform block to global uniform buffer
		let gl = this.context
		gl.uniformBlockBinding(this.program, gl.getUniformBlockIndex(this.program, "MapLayer"), 0)
	}
}

export { MapLayerProgram }