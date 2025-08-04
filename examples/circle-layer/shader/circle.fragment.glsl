#version 300 es

precision highp float;

in vec2 uv;
in vec4 rgba;

out vec4 color;

void main() {
	if (distance(uv, vec2(0.5,0.5)) <= 0.5) {
		color = rgba;
	} else {
		color = vec4(0,0,0,0);
	}
}