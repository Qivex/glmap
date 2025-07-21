import { TextureStorage } from "./TextureStorage"

import type { TilePositionType } from "../types/types"


function equalPos(p1: TilePositionType, p2: TilePositionType) {
	return p1 && p2 && p1.x === p2.x && p1.y === p2.y && p1.z === p2.z
}

class TileStorage extends TextureStorage {
	tilePositions: Array<TilePositionType> = []

	constructor(context: WebGL2RenderingContext, tileWidth: number, tileHeight: number) {
		super(context, tileWidth, tileHeight, 256)
	}

	createTile(image: TexImageSource, tile: TilePositionType) {
		let slot = this.addTexture(image)
		this.tilePositions[slot] = tile
		return slot
	}

	findTile(pos: TilePositionType) {
		return this.tilePositions.some(t => equalPos(t, pos))
	}

	removeTilesExceptRequired(requiredTiles: Array<TilePositionType>) {
		this.tilePositions.forEach((pos, slot) => {
			if (!requiredTiles.some(r => equalPos(r, pos))) {
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