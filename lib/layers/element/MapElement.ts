abstract class MapElement extends EventTarget {
	// Serialized according to attribute structure of elementBuffer (for use in bufferData)
	abstract serialized: Uint8Array

	// TODO: static attributes
	// For use in initElementAttributes(MapElement.attributes)
}

export { MapElement }