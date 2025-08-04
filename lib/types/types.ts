import type { GLMap } from "../GLMap"


type Lookup<Type> = {[key: string]: Type}


// Config tree
interface MapLayerConfig {
	glmap: GLMap
	context: WebGL2RenderingContext
}

interface MarkerLayerConfig extends MapLayerConfig {
	maxIconWidth: number,
	maxIconHeight: number,
	maxIconCount: number
}

interface TileLayerConfig extends MapLayerConfig {
	tileWidth?: number,
	tileHeight?: number,
	tileURL: string,
	tileLimits?: TileBoundsType
}


// TileLayer
type TileBoundsType = {
	minX: number,
	maxX: number,
	minY: number,
	maxY: number,
	minZoom: number,
	maxZoom: number
}

type TilePositionType = {
	x: number,
	y: number,
	z: number
}

type QueueItemType = {
	image: HTMLImageElement,
	tile: TilePositionType
}


// Events
interface CoordEventInit extends EventInit {
	x: number,
	y: number
}

interface ResizeEventInit extends EventInit {
	width: number,
	height: number
}

interface ZoomEventInit extends EventInit {
	zoom: number
}



export type {
	Lookup,

	MapLayerConfig,
	MarkerLayerConfig,
	TileLayerConfig,

	TileBoundsType,
	TilePositionType,
	QueueItemType,

	CoordEventInit,
	ResizeEventInit,
	ZoomEventInit
}