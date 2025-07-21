import type { GLMap } from "../GLMap"

class UserInteraction {
	glmap: GLMap

	constructor() {}

	enableFor(glmap: GLMap) {
		this.glmap = glmap
	}
}

export { UserInteraction }