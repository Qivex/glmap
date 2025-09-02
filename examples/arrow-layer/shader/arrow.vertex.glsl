#version 300 es

precision highp float;

uniform vec2 resolution;
uniform vec2 center;
uniform float zoom;

in vec2 vertexPos;
in vec2 startPos;
in vec2 endPos;
in vec2 headSize;
in float lineWidth;
in vec4 color;
in float headPeriod;

out vec2 uv;
out vec4 rgba;
out float arrowLength;
out float headHeight;
out float period;
out vec2 lineInterval;

void main() {
	// Destructure
	float headWidth = headSize.x;
	headHeight = headSize.y;
	// Varyings
	uv = vertexPos;
	rgba = color;
	period = headPeriod;
	// Vertex position
	vec2 startOffset = (startPos - center) * pow(2.0, zoom);
	vec2 endOffset = (endPos - center) * pow(2.0, zoom);

	vec2 arrowVec = endOffset - startOffset;
	vec2 widthVec = headWidth * normalize(vec2(-arrowVec.y, arrowVec.x));
	vec2 cornerOffset = startOffset + vertexPos.x * arrowVec + (vertexPos.y - 0.5) * widthVec;

	vec2 normalized = cornerOffset * vec2(2, -2) / resolution;
	gl_Position = vec4(normalized, 0, 1);

	arrowLength = length(arrowVec);

	// Line thickness
	float uvLineHalf = 0.5 * lineWidth / headWidth;
	lineInterval = vec2(0.5 - uvLineHalf,0.5 + uvLineHalf);
}