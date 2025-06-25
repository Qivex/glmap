#version 300 es

precision highp float;

uniform vec2 pixelShift;
uniform vec2 resolution;

in vec2 vertexPos;

out vec2 uv;

void main() {
	uv = vertexPos;

	vec2 clipSpace = vertexPos * vec2(2,2) - vec2(1,1);
	vec2 normalizedShift = pixelShift / resolution * vec2(2,-2);
	gl_Position = vec4(clipSpace + normalizedShift, 0, 1);
}