import { GLMap } from "/lib/main.js"

function resizeCanvas() {
	canvas.width = canvas.clientWidth
	canvas.height = canvas.clientHeight
}

window.addEventListener("resize", resizeCanvas)
resizeCanvas()

let m = new GLMap(canvas)
m.testTiles()
// TEMP: Disabled markers, because for some reason both programs interact -> Find missing activate() before enabling again
//m.testMarker()