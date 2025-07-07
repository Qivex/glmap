#version 300 es

precision highp float;

uniform vec2 gridSize;
uniform vec2 gridCenter;
uniform float gridZoomLevel;

in vec2 vertexPos;
in vec3 tilePos;

out vec2 uv;

void main() {
	// Texture coordinates
	uv = vertexPos;
	// Vertex position
	float scale = pow(2.0, gridZoomLevel - tilePos.z);
	vec2 gridOffset = (vertexPos + tilePos.xy) * scale - gridCenter;
	vec2 normalized = gridOffset * vec2(2,-2) / gridSize;
	gl_Position = vec4(normalized, 0.9999 - tilePos.z / 16.0, 1);
}