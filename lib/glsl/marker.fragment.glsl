#version 300 es

precision highp float;
precision highp sampler2DArray;

uniform sampler2DArray icons;

in vec2 uv;
in float w;

out vec4 color;

void main() {
	color = texture(icons, vec3(uv, w));
}