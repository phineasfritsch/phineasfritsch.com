<script lang="ts">
	import { T } from '@threlte/core';
	import * as THREE from 'three';

	const skyMaterial = new THREE.ShaderMaterial({
		side: THREE.BackSide,
		depthWrite: false,
		uniforms: {},
		vertexShader: /* glsl */ `
			varying vec3 vWorldPos;
			void main() {
				vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
		`,
		fragmentShader: /* glsl */ `
			varying vec3 vWorldPos;

			void main() {
				vec3 dir = normalize(vWorldPos);
				float h = clamp(dir.y * 0.5 + 0.5, 0.0, 1.0);

				// Sunset sky palette
				vec3 zenith   = vec3(0.02, 0.02, 0.12);
				vec3 upper    = vec3(0.12, 0.04, 0.22);
				vec3 mid      = vec3(0.50, 0.16, 0.08);
				vec3 horizon  = vec3(0.92, 0.52, 0.12);
				vec3 glow     = vec3(1.00, 0.88, 0.38);

				vec3 color = glow;
				color = mix(color,  horizon, smoothstep(0.00, 0.08, h));
				color = mix(color,  mid,     smoothstep(0.06, 0.26, h));
				color = mix(color,  upper,   smoothstep(0.22, 0.55, h));
				color = mix(color,  zenith,  smoothstep(0.45, 1.00, h));

				// Horizon haze
				float haze = exp(-h * 7.0) * 0.35;
				color = mix(color, horizon * 1.1, haze);

				// Subtle star-like noise at zenith
				float stars = fract(sin(dot(dir.xz, vec2(127.1, 311.7))) * 43758.5453);
				float starMask = smoothstep(0.998, 1.0, stars) * smoothstep(0.6, 1.0, h);
				color += vec3(starMask * 0.6);

				gl_FragColor = vec4(color, 1.0);
			}
		`
	});
</script>

<T.Mesh renderOrder={-1}>
	<T.SphereGeometry args={[90, 32, 32]} />
	<T is={skyMaterial} />
</T.Mesh>
