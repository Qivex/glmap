class TilePosition {
	x: number
	y: number
	z: number

	constructor(x: number, y: number, z: number) {
		this.x = x
		this.y = y
		this.z = z
	}

	equals(tile: TilePosition) {
		return (
			this.x === tile.x &&
			this.y === tile.y &&
			this.z === tile.z
		)
	}

	toString() {
		return `${this.x},${this.y},${this.z}`
	}
}

export { TilePosition }