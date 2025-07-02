#version 300 es

precision highp float;

uniform vec2 resolution;
uniform vec2 center;
uniform float zoom;

in vec2 vertexPos;
in vec2 markerPos;
in vec2 iconSize;
in vec2 iconAnchor;
in float iconIndex;

out vec2 uv;
out float w;

void main() {
	// Texture coordinates
	uv = vertexPos;
	w = iconIndex;
	// Vertex position
	vec2 centerOffset = (markerPos - center) * pow(2.0, zoom);
	vec2 cornerOffset = vertexPos * iconSize - iconAnchor;
	vec2 normalized = (centerOffset + cornerOffset) * vec2(2, -2) / resolution;
	gl_Position = vec4(normalized, 0, 1);
}