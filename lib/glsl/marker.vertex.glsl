#version 300 es

precision highp float;
precision highp sampler2D;

uniform vec2 resolution;
uniform vec2 center;
uniform float zoom;
uniform sampler2D iconData;

in vec2 vertexPos;
in vec2 markerPos;
in float iconIndex;

out vec2 uv;
out float w;

float fetchData(int offset) {
	return texelFetch(iconData, ivec2(offset, iconIndex), 0).r;
}

void main() {
	// Texture coordinates
	uv = vertexPos;
	w = iconIndex;
	// Unpack icon data from texture
	vec2 iconSize = vec2(fetchData(0), fetchData(1));
	vec2 iconAnchor = vec2(fetchData(2), fetchData(3));
	// Vertex position
	vec2 centerOffset = (markerPos - center) * pow(2.0, zoom);
	vec2 cornerOffset = vertexPos * iconSize - iconAnchor;
	vec2 normalized = (centerOffset + cornerOffset) * vec2(2, -2) / resolution;
	gl_Position = vec4(normalized, 0, 1);
}