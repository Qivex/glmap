function getID(x, y, zoom) {
	return `${x},${y},${zoom}`
}

class TileStorage {
	constructor(context, tileWidth, tileHeight) {
		this.context = context

		this.tileWidth = tileWidth
		this.tileHeight = tileHeight

		this.textureStorage = {}
	}

	createTile(image, x, y, zoom) {
		let gl = this.context
		// Create texture
		let texture = gl.createTexture()
		gl.bindTexture(gl.TEXTURE_2D, texture)
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.tileWidth, this.tileHeight, 0, gl.RGBA, gl.UNSIGNED_BYTE, image)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

		// Cache texture
		let id = getID(x, y, zoom)
		this.textureStorage[id] = texture

		return texture
	}

	getTile(x, y, zoom) {
		let id = getID(x, y, zoom)
		return this.textureStorage[id] || null
	}
}

export { TileStorage }