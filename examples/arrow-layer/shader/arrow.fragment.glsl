#version 300 es

precision highp float;

in vec2 uv;
in vec4 rgba;

in float arrowLength;
in float headHeight;
in float period;
in vec2 lineInterval;

out vec4 color;

void main() {
	if (mod(uv.x * arrowLength, period) > period - headHeight) {
		color = vec4(1,0,0,1);
	}
	if (uv.y >= lineInterval.x && uv.y <= lineInterval.y) {
		color = rgba;
	}
}