import { TextureStorage } from "../../TextureStorage"
import { Tile } from "./Tile"

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

	getTiles() {
		return new Set(
			this.tilePositions
			.map((p, slot) => new Tile(p.x, p.y, p.z, slot))
			.filter(t => t !== undefined)
		)
	}
}

export { TileStorage }