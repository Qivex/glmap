#version 300 es

precision highp float;

uniform vec2 resolution;
uniform vec2 tilesize;
uniform vec2 center;
uniform float zoom;

in vec2 vertexPos;
in vec3 tileOffset;
in float tileID;

out vec2 uv;
out float sliceID;

void main() {
	sliceID = tileID;	// gl_InstanceID
	uv = vertexPos;

	vec2 tilePos = tileOffset.xy;
	float layer = tileOffset.z;
	
	// Relative position on the grid
	vec2 offset = tilesize * (vertexPos + tilePos);
	// How much the entire grid is shifted ("panned")
	vec2 shift = center * pow(2.0, layer);
	// Size adjustment of tiles
	float scale = pow(2.0, zoom - layer);

	vec2 pixelPos = (offset - shift) * scale;

	vec2 clipSpace = pixelPos * vec2(2, -2) / resolution;
	gl_Position = vec4(clipSpace, layer / -1000.0, 1);
}