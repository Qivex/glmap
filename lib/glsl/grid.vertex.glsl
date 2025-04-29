#version 300 es

precision highp float;

uniform vec2 gridSize;
uniform vec2 gridCenter;
uniform float gridZoomLevel;

in vec2 vertexPos;
in vec3 tilePos;

out vec2 uv;

void main() {
	uv = vertexPos;

	vec2 tileOffset = tilePos.xy;
	float tileZoomLevel = tilePos.z;

	float scale = pow(2.0, gridZoomLevel - tileZoomLevel);

	vec2 gridCoordinate = (vertexPos + tileOffset) * scale - gridCenter;

	vec2 clipSpace = gridCoordinate * vec2(2,-2) / gridSize;
	
	gl_Position = vec4(clipSpace, tileZoomLevel / -1000.0, 1);
}