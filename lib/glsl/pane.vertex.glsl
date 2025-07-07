#version 300 es

precision highp float;

uniform vec2 resolution;
uniform vec2 paneSize;
uniform vec2 paneOffset;

in vec2 vertexPos;

out vec2 uv;

void main() {
	// Texture coordinates
	uv = vertexPos;
	// Vertex position
	vec2 cornerPos = vertexPos * paneSize + paneOffset;
	vec2 normalized = cornerPos * vec2(2,-2) / resolution - vec2(1, -1);
	gl_Position = vec4(normalized, 0, 1);
}