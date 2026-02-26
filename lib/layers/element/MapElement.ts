abstract class MapElement extends EventTarget {
	// Serialize according to attribute structure of elementBuffer
	abstract serialize(): Array<number>
}

export { MapElement }