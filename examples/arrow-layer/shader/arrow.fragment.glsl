#version 300 es

precision highp float;

uniform float headPeriod;

in vec2 uv;
in vec4 rgba;
in float headHeight;
in vec2 lineInterval;
in float arrowLength;

out vec4 color;

void main() {
	if (mod(uv.x * arrowLength, headPeriod) > headPeriod - headHeight) {
		color = vec4(1,0,0,1);
	}
	if (uv.y >= lineInterval.x && uv.y <= lineInterval.y) {
		color = rgba;
	}
}