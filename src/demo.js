import { GLMap } from "/lib/main.ts"

function resizeCanvas() {
	canvas.width = canvas.clientWidth
	canvas.height = canvas.clientHeight
}

window.addEventListener("resize", resizeCanvas)
resizeCanvas()

let m = new GLMap(canvas)
m.testTiles()
m.testCircle()
m.testMarker()
m.testPopup()

m.testZooming()
m.testHover()
m.testPinch()
m.testClick()