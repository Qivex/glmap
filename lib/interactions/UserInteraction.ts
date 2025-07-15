class UserInteraction {
	constructor(config) {
		this.config = config
	}

	enableFor(map) {
		throw new Error("UserInteraction must implement enableFor(map)")
	}
}

export { UserInteraction }