import { TextureStorage } from "./TextureStorage"

function equalPos(p1, p2) {
	return p1 && p2 && p1.x === p2.x && p1.y === p2.y && p1.z === p2.z
}

class TileStorage extends TextureStorage {
	constructor(context, tileWidth, tileHeight) {
		super(context, tileWidth, tileHeight, 128)

		// Store tile positions
		this.tilePositions = []
	}

	createTile(image, tile) {
		let slot = this.addTexture(image)
		this.tilePositions[slot] = tile
		return slot
	}

	findTile(pos) {
		return this.tilePositions.some(t => equalPos(t, pos))
	}

	removeTilesExceptRequired(requiredTiles) {
		this.tilePositions.forEach((pos, slot) => {
			if (!requiredTiles.some(r => equalPos(r, pos))) {
				delete this.tilePositions[slot]
				this.removeTexture(slot)
			}
		})
	}

	constructBufferDataForTiles() {
		let slices = [],
			positions = []
		
		this.tilePositions.forEach((p, slot) => {
			slices.push(slot)
			positions.push(p.x, p.y, p.z)
		})

		return {
			slices,
			positions
		}
	}
}

export { TileStorage }