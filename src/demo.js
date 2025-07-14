import { GLMap } from "/lib/main.js"

function resizeCanvas() {
	canvas.width = canvas.clientWidth
	canvas.height = canvas.clientHeight
}

window.addEventListener("resize", resizeCanvas)
resizeCanvas()

let m = new GLMap(canvas)
m.testTiles()
m.testMarker()
m.testPanning()
m.testZooming()