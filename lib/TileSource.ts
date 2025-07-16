import type { Lookup } from "./types/types.ts"

type ParamLookupType = Lookup<any>


const templateRegex = /\{(\w)\}/g

function createReplaceFunc(lookup: ParamLookupType) {
	// Function will only replace params that are included in lookup
	return function(match: string, key: string) {
		let value = lookup[key]
		return value === undefined ? match : value
	}
}


class TileSource {
	template: string
	tileCache: Lookup<HTMLImageElement> = {}
	params: ParamLookupType = {}

	constructor(urlTemplate: string) {
		this.template = urlTemplate
	}

	setParams(params: object) {
		this.params = params
	}

	fetchTile(x: number, y: number, z: number): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			let id = `${x},${y},${z}`
			let cachedTile = this.tileCache[id]
			if (cachedTile) {
				resolve(cachedTile)
			} else {
				// Replace all known params in template
				let replaceFunc = createReplaceFunc(Object.assign({x, y, z}, this.params))
				let url = this.template.replaceAll(templateRegex, replaceFunc)
				// Check if all params were replaced
				if (URL.canParse(url)) {
					let img = new Image()
					img.crossOrigin = "anonymous"
					img.src = url
					img.decode()
						.then(() => {
							this.tileCache[id] = img
							resolve(img)
						})
						.catch(err => reject(err))
				} else {
					reject(new Error("Tile URL is not valid: " + url))
				}
			}
		})
	}
}

export { TileSource }