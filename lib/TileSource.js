const templateRegex = /\{(\w)\}/g


function createReplaceFunc(lookup) {
	// Function will only replace params that are included in lookup
	return function(match, key) {
		let value = lookup[key]
		return value === undefined ? match : value
	}
}

class TileSource {
	constructor(urlTemplate) {
		this.template = urlTemplate
		this.tileCache = {}
		this.callback = function(t, x, y, z) {
			console.log(`Tile ${x},${y},${z} was successfully loaded`)
		}
	}

	// Called after a tile image was fetched and decoded
	setCallback(callback) {
		this.callback = callback
	}

	requestTiles(xMin, xMax, yMin, yMax, zoom) {
		for (let x = xMin; x <= xMax; x++) {
			for (let y = yMin; y <= yMax; y++) {
				this.fetchTile(x, y, zoom)
					.then(tile => this.callback(tile, x, y, zoom))
					.catch(err => {})
			}
		}
	}

	setParams(params) {
		this.params = params
	}

	fetchTile(x, y, z) {
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