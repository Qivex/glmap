#version 300 es

precision highp float;
precision highp sampler2DArray;

uniform sampler2DArray tiles;

in vec2 uv;
in float sliceID;

out vec4 color;

void main() {
	color = texture(tiles, vec3(uv, sliceID));
}