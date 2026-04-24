<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import * as THREE from 'three';

	const uniforms = {
		uTime: { value: 0 },
		uDeepColor: { value: new THREE.Color('#06122a') },
		uShallowColor: { value: new THREE.Color('#0e2a50') },
		uHorizonColor: { value: new THREE.Color('#5a2808') },
		uSunColor: { value: new THREE.Color('#ff9933') }
	};

	const oceanMaterial = new THREE.ShaderMaterial({
		uniforms,
		transparent: true,
		vertexShader: /* glsl */ `
			uniform float uTime;
			varying vec2 vUv;
			varying float vHeight;
			varying vec3 vWorldPos;

			vec3 gerstner(vec3 pos, vec2 dir, float amp, float wl, float spd, float steep) {
				float k = 6.28318 / wl;
				float c = sqrt(9.8 / k) * spd;
				float f = k * (dot(dir, pos.xz) - c * uTime);
				float a = steep / k;
				return vec3(dir.x * a * cos(f), a * sin(f), dir.y * a * cos(f));
			}

			void main() {
				vec3 pos = position;

				pos += gerstner(pos, normalize(vec2( 1.0,  0.3)), 0.04, 5.0, 1.0, 0.6);
				pos += gerstner(pos, normalize(vec2( 0.7,  0.8)), 0.03, 3.0, 1.2, 0.5);
				pos += gerstner(pos, normalize(vec2(-0.5,  1.0)), 0.02, 2.0, 0.9, 0.4);
				pos += gerstner(pos, normalize(vec2(-0.8,  0.2)), 0.01, 1.4, 1.4, 0.3);

				vHeight   = pos.y;
				vUv       = uv;
				vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;

				gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
			}
		`,
		fragmentShader: /* glsl */ `
			uniform float uTime;
			uniform vec3  uDeepColor;
			uniform vec3  uShallowColor;
			uniform vec3  uHorizonColor;
			uniform vec3  uSunColor;
			varying vec2  vUv;
			varying float vHeight;
			varying vec3  vWorldPos;

			void main() {
				vec3 color = mix(uDeepColor, uShallowColor, vUv.y * 0.6);

				// Warm horizon reflection
				float hFade = pow(clamp(vUv.y, 0.0, 1.0), 0.4);
				color = mix(color, uHorizonColor * 0.35, hFade * 0.35);

				// Foam on peaks
				float foam = smoothstep(0.07, 0.16, vHeight);
				color = mix(color, vec3(0.75, 0.72, 0.65), foam * 0.28);

				// Sun glint
				float gx = sin(vUv.x * 90.0 + uTime * 3.2);
				float gz = sin(vUv.y * 70.0 + uTime * 2.1);
				float glint = pow(max(gx * gz, 0.0), 6.0) * hFade * 0.7;
				color += uSunColor * glint;

				gl_FragColor = vec4(color, 0.94);
			}
		`
	});

	useTask((delta) => {
		uniforms.uTime.value += delta * 0.75;
	});
</script>

<T.Mesh rotation.x={-Math.PI / 2} receiveShadow>
	<T.PlaneGeometry args={[100, 100, 128, 128]} />
	<T is={oceanMaterial} />
</T.Mesh>
