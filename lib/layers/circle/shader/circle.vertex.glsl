#version 300 es

precision highp float;

layout(std140) uniform MapLayer {
	vec2 resolution;
	vec2 center;
	float zoom;
};

in vec2 vertexPos;
in vec2 circlePos;
in float radius;
in vec4 color;

out vec2 uv;
out vec4 rgba;

void main() {
	uv = vertexPos;
	rgba = color;
	// Vertex position
	vec2 centerOffset = (circlePos - center) * pow(2.0, zoom);
	vec2 cornerOffset = (2.0 * radius * vertexPos - vec2(radius, radius)) * pow(2.0, zoom);	// Remove pow-factor for fixed size (like markers)
	vec2 normalized = (centerOffset + cornerOffset) * vec2(2, -2) / resolution;
	gl_Position = vec4(normalized, 0, 1);
}