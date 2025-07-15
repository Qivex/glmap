import { GLMap } from "../GLMap"

abstract class UserInteraction {
	config: object

	constructor(config: object) {
		this.config = config
	}

	abstract enableFor(map: GLMap): void
}

export { UserInteraction }