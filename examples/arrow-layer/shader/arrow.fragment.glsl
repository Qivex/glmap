#version 300 es

precision highp float;
precision highp sampler2D;

uniform float headPeriod;
uniform float headHeight;
uniform sampler2D arrowHead;

in vec2 uv;
in vec4 rgba;
in vec2 lineInterval;
in float arrowLength;

out vec4 color;

void main() {
	// Relative offset inside each segment (once every period)
	float segmentOffset = mod(uv.x * arrowLength, headPeriod);
	if (segmentOffset > headPeriod - headHeight) {
		// Linear map uv.x from [headPeriod - headHeight, headPeriod] to [0,1]
		float mappedUVx = (segmentOffset - headPeriod + headHeight) / headHeight;
		float shapeAlpha = texture(arrowHead, vec2(mappedUVx, uv.y)).a;
		color = vec4(rgba.rgb, shapeAlpha);
	}
	if (uv.y >= lineInterval.x && uv.y <= lineInterval.y) {
		color = rgba;
	}
}