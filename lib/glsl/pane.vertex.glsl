#version 300 es

precision highp float;

uniform vec2 resolution;
uniform vec2 paneSize;
uniform vec2 paneOffset;
uniform float paneZoom;

in vec2 vertexPos;

out vec2 uv;

void main() {
	uv = vertexPos;

	const vec2 topleft = vec2(1,-1);
	vec2 pixelPos = (vertexPos - vec2(0, 1)) * paneSize * paneZoom + paneOffset * topleft;
	vec2 clipSpace = pixelPos * vec2(2, 2) / resolution - topleft;
	gl_Position = vec4(clipSpace, 0, 1);
}