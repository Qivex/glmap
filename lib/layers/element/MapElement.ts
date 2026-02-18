abstract class MapElement {
	// Serialize according to attribute structure of elementBuffer
	abstract serialize(): Array<number>
}

export { MapElement }