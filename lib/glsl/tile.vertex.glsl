#version 300 es

precision highp float;

const float MAX_LAYER_COUNT = 1024.0;

uniform vec2 resolution;
uniform vec2 tileSize;
uniform vec2 center;
uniform float zoom;

in vec2 vertexPos;
in vec3 tilePos;

out vec2 uv;

void main() {
	// Texture coordinates
	uv = vertexPos;
	// Vertex position
	float tileScale = pow(2.0, zoom - tilePos.z);   // Scaling for tiles of other zoom
	vec2 gridPos = (tilePos.xy + vertexPos) * tileScale; // Location on the grid
	vec2 gridOffset = center * pow(2.0, zoom);      // Offset of the entire grid
	vec2 pixelPos = gridPos * tileSize - gridOffset;
	vec2 normalized = pixelPos * vec2(2, -2) / resolution;
	gl_Position = vec4(normalized, 0.99999 - tilePos.z / MAX_LAYER_COUNT, 1);
}