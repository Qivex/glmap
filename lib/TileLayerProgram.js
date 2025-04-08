import { ShaderProgram } from "./ShaderProgram.js";

import vs from "./glsl/layer.vertex.glsl?raw"
import fs from "./glsl/layer.fragment.glsl?raw"

// Draws all tiles of a single zoom level
class TileLayerProgram extends ShaderProgram {
	constructor(context) {
		super(context)
		this.compile(vs, fs)
	}
}

export { TileLayerProgram }