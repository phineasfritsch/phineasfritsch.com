<script lang="ts">
	import { T } from '@threlte/core';
	import * as THREE from 'three';

	// Cartoon sky — rich dark blue gradient, soft star field
	const skyMat = new THREE.ShaderMaterial({
		side: THREE.BackSide,
		depthWrite: false,
		vertexShader: /* glsl */ `
			varying vec3 vDir;
			void main() {
				vDir = position;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
		`,
		fragmentShader: /* glsl */ `
			varying vec3 vDir;
			float hash(vec3 p) {
				p = fract(p * vec3(443.8975, 397.2973, 491.1871));
				p += dot(p.zxy, p.yxz + 19.19);
				return fract(p.x * p.y * p.z);
			}
			void main() {
				vec3 d = normalize(vDir);
				float h = d.y * 0.5 + 0.5;

				// Deep cartoon sky gradient
				vec3 top    = vec3(0.03, 0.04, 0.14);
				vec3 mid    = vec3(0.06, 0.08, 0.22);
				vec3 bottom = vec3(0.10, 0.14, 0.36);
				vec3 sky = mix(bottom, mid, smoothstep(0.0, 0.4, h));
				sky = mix(sky, top, smoothstep(0.3, 1.0, h));

				// Stars
				float star = hash(floor(d * 380.0));
				float twinkle = hash(floor(d * 380.0) + vec3(5.1, 3.7, 9.2));
				float bright = smoothstep(0.9975, 1.0, star);
				sky += vec3(bright * mix(0.55, 1.0, twinkle));

				gl_FragColor = vec4(sky, 1.0);
			}
		`
	});
</script>

<T.Mesh renderOrder={-1}>
	<T.SphereGeometry args={[200, 32, 32]} />
	<T is={skyMat} />
</T.Mesh>
