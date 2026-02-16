import { TextureStorage } from "../../TextureStorage"

import type { TilePosition } from "../../types/TilePosition"


class TileStorage extends TextureStorage {
	tilePositions: Array<TilePosition> = []

	constructor(context: WebGL2RenderingContext, tileWidth: number, tileHeight: number) {
		super(context, tileWidth, tileHeight, 256)	// TODO: Calculate based on canvas- & tile size
	}

	createTile(image: TexImageSource, tile: TilePosition) {
		let slot = this.addTexture(image)
		this.tilePositions[slot] = tile
		return slot
	}

	hasTile(pos: TilePosition) {
		return this.tilePositions.some(t => t.equals(pos))
	}

	removeTilesExceptRequired(requiredTiles: Array<TilePosition>) {
		this.tilePositions.forEach((pos, slot) => {
			if (!requiredTiles.some(r => r.equals(pos))) {
				delete this.tilePositions[slot]
				this.removeTexture(slot)
			}
		})
	}

	constructBufferDataForTiles(): {slices: Array<number>, positions: Array<number>} {
		let slices: Array<number> = [],
			positions: Array<number> = []
		
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