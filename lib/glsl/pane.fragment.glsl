#version 300 es

precision highp float;
precision highp sampler2D;

uniform sampler2D pane;

in vec2 uv;

out vec4 color;

void main() {
	color = texture(pane, uv);
}