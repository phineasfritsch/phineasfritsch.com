<script lang="ts">
	import { T } from '@threlte/core';
	import * as THREE from 'three';

	// Stylized cartoon ocean — vibrant turquoise, 4-step toon, atmosphere rim
	const globeMat = new THREE.ShaderMaterial({
		vertexShader: /* glsl */ `
			varying vec3 vNormal;
			varying vec3 vWorldPos;
			void main() {
				vNormal   = normalize(normalMatrix * normalize(position));
				vWorldPos = (modelMatrix * vec4(position, 1.0)).xyz;
				gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
			}
		`,
		fragmentShader: /* glsl */ `
			uniform vec3 uLightDir;
			uniform vec3 uCamPos;
			varying vec3 vNormal;
			varying vec3 vWorldPos;

			float toon(float v) {
				if (v > 0.80) return 1.00;
				if (v > 0.55) return 0.72;
				if (v > 0.28) return 0.44;
				if (v > 0.05) return 0.22;
				return 0.08;
			}

			void main() {
				vec3 N = normalize(vNormal);
				vec3 L = normalize(uLightDir);
				vec3 V = normalize(uCamPos - vWorldPos);
				vec3 H = normalize(L + V);

				float diff = max(dot(N, L), 0.0);
				float t    = toon(diff);

				// Vibrant cartoon ocean — deep teal shadow → bright sky blue lit
				vec3 deep   = vec3(0.04, 0.28, 0.62);
				vec3 mid    = vec3(0.10, 0.50, 0.82);
				vec3 bright = vec3(0.26, 0.72, 0.98);
				vec3 ocean  = mix(deep, mid, smoothstep(0.2, 0.6, t));
				ocean       = mix(ocean, bright, smoothstep(0.6, 1.0, t));

				// Crisp specular glint
				float spec = step(0.96, pow(max(dot(N, H), 0.0), 40.0)) * step(0.4, diff);
				ocean += vec3(0.9, 0.97, 1.0) * spec;

				// Atmosphere rim glow — soft cyan halo
				float rim = pow(1.0 - max(dot(N, V), 0.0), 4.0);
				ocean = mix(ocean, vec3(0.5, 0.85, 1.0), rim * 0.55);

				gl_FragColor = vec4(ocean, 1.0);
			}
		`,
		uniforms: {
			uLightDir: { value: new THREE.Vector3(-5, 8, 6).normalize() },
			uCamPos:   { value: new THREE.Vector3(0, 3.5, 12) }
		}
	});
</script>

<T.Mesh>
	<T.SphereGeometry args={[3, 64, 48]} />
	<T is={globeMat} />
</T.Mesh>
