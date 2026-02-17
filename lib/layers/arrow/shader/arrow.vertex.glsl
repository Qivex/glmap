#version 300 es

precision highp float;

layout(std140) uniform MapLayer {
	vec2 resolution;
	vec2 center;
	float zoom;
};

uniform float lineWidth;
uniform float headWidth;

in vec2 vertexPos;
in vec4 arrowCoords;
in vec4 color;

out vec2 uv;
out vec4 rgba;
out vec2 lineInterval;
out float arrowLength;

void main() {
	// Common varyings
	uv = vertexPos;
	rgba = color;
	// Line thickness
	float uvLineHalf = 0.5 * lineWidth / headWidth;
	lineInterval = vec2(0.5 - uvLineHalf,0.5 + uvLineHalf);
	// Destructured arrow offsets
	vec2 startOffset = (arrowCoords.xy - center) * pow(2.0, zoom);
	vec2 endOffset = (arrowCoords.zw - center) * pow(2.0, zoom);
	// Length vector
	vec2 arrowVec = endOffset - startOffset;
	arrowLength = length(arrowVec);
	// Perpendicular vector
	vec2 widthVec = headWidth * normalize(vec2(-arrowVec.y, arrowVec.x));
	// Coordinate transform from xy to arrow vectors
	vec2 cornerOffset = startOffset + vertexPos.x * arrowVec + (vertexPos.y - 0.5) * widthVec;
	vec2 normalized = cornerOffset * vec2(2, -2) / resolution;
	gl_Position = vec4(normalized, 0, 1);
}