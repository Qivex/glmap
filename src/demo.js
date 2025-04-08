import { GLMap } from "/lib/main.js"

function resizeCanvas() {
	canvas.width = canvas.clientWidth
	canvas.height = canvas.clientHeight
}

window.addEventListener("resize", resizeCanvas)
resizeCanvas()

window.mymap = new GLMap(canvas)