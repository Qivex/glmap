#version 300 es

precision highp float;
precision highp sampler2D;

uniform sampler2D colorSampler;
uniform sampler2D depthSampler;

in vec2 uv;

out vec4 color;

void main() {
	vec4 depth = texture(depthSampler, uv);
	color = depth;	//texture(colorSampler, uv);	// Temp, see content of depth
	gl_FragDepth = texture(depthSampler, uv).r;
}