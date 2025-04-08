#version 300 es

precision highp float;

uniform vec2 resolution;
uniform vec2 tilesize;
uniform vec2 center;
uniform float zoom;

in vec2 vertexPos;
in vec2 tilePos;
in float tileID;

out vec2 uv;
out float sliceID;

void main() {
	sliceID = tileID;
	uv = vertexPos;
	vec2 clipSpace = (tilesize * (vertexPos + tilePos) - center) / resolution * zoom;
	gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}