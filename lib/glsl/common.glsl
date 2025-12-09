#version 300 es

precision highp float;

uniform vec2 resolution;
uniform vec2 center;
uniform float zoom;

vec2 coord2pixel(vec2 p) {
	return (p - center) * pow(2.0, zoom);
}

vec2 pixel2screenspace(vec2 p) {
	return p * vec2(2, -2) / resolution;
}