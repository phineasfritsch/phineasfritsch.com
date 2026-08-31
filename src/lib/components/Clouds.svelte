<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import * as THREE from 'three';
	import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

	interface Props {
		/** Set false to freeze drift/bob (prefers-reduced-motion) */
		animate?: boolean;
	}
	let { animate = true }: Props = $props();

	// Deterministic PRNG — identical cloud field on every visit
	function mulberry32(seed: number) {
		return () => {
			seed |= 0;
			seed = (seed + 0x6d2b79f5) | 0;
			let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
			t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
			return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
		};
	}
	const rand = mulberry32(20260715);

	// 3-tone gradient map — soft cel bands instead of the harsh 2-band toon default
	const gradient = new THREE.DataTexture(new Uint8Array([110, 195, 255]), 3, 1, THREE.RedFormat);
	gradient.minFilter = THREE.NearestFilter;
	gradient.magFilter = THREE.NearestFilter;
	gradient.needsUpdate = true;

	// Single shared material: cool white lit side, moonlit-blue emissive floor so the
	// night side never goes muddy against the dark ocean
	const cloudMat = new THREE.MeshToonMaterial({
		color: '#f3f7ff',
		gradientMap: gradient,
		emissive: '#2c3a66',
		emissiveIntensity: 0.85
	});

	// One cartoon cloud = row of squashed puffs, bottoms aligned, merged to 1 geometry
	// (1 draw call per cloud, shared material across all clouds)
	function makeCloudGeometry(): THREE.BufferGeometry {
		const n = 5 + Math.floor(rand() * 4); // 5–8 puffs
		const parts: THREE.BufferGeometry[] = [];
		for (let i = 0; i < n; i++) {
			const t = i / (n - 1); // 0..1 across the row
			const falloff = Math.sin(Math.PI * (0.16 + 0.68 * t)); // big middle, small ends
			const r = 0.15 + falloff * (0.2 + rand() * 0.1);
			const g = new THREE.SphereGeometry(r, 14, 10);
			g.scale(1, 0.56 + rand() * 0.12, 1);
			g.translate(
				(t - 0.5) * (1.1 + rand() * 0.25),
				r * 0.4 + rand() * 0.05,
				(rand() - 0.5) * 0.24
			);
			parts.push(g);
		}
		// belly puff — fills the underside so side-on silhouettes stay plump
		const belly = new THREE.SphereGeometry(0.19 + rand() * 0.09, 12, 9);
		belly.scale(1.4, 0.5, 1);
		belly.translate((rand() - 0.5) * 0.4, 0.12, 0.14 + rand() * 0.1);
		parts.push(belly);

		const merged = mergeGeometries(parts)!;
		for (const p of parts) p.dispose();
		return merged;
	}

	// Hand-staggered band slots: full 360° coverage, no two clouds close enough in
	// lat+lon to merge silhouettes as they drift
	const slots = [
		{ lat: 34, lon: 20 },
		{ lat: -26, lon: 55 },
		{ lat: 12, lon: 95 },
		{ lat: 42, lon: 140 },
		{ lat: -8, lon: 170 },
		{ lat: 24, lon: 205 },
		{ lat: -34, lon: 240 },
		{ lat: 6, lon: 275 },
		{ lat: 38, lon: 310 },
		{ lat: -18, lon: 340 },
		{ lat: -42, lon: 120 },
		{ lat: 18, lon: 32 },
		{ lat: -2, lon: 226 },
		{ lat: 46, lon: 252 }
	];

	interface Cloud {
		geometry: THREE.BufferGeometry;
		lon0: number; // initial pivot rotation (rad)
		base: THREE.Vector3; // position at lon 0, radius = alt
		normal: THREE.Vector3; // radial unit vector (bob axis)
		quat: THREE.Quaternion; // tangent orientation + random yaw
		scale: number;
		speed: number; // drift, rad/s — slower than globe's 0.025 so ground parallaxes past
		bobPhase: number;
		bobSpeed: number;
	}

	const clouds: Cloud[] = slots.map((s) => {
		const lat = s.lat + (rand() - 0.5) * 6;
		const alt = 4.0 + rand() * 0.42;
		const φ = (lat * Math.PI) / 180;
		const normal = new THREE.Vector3(Math.cos(φ), Math.sin(φ), 0);
		const quat = new THREE.Quaternion()
			.setFromUnitVectors(new THREE.Vector3(0, 1, 0), normal)
			.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), rand() * Math.PI * 2));
		return {
			geometry: makeCloudGeometry(),
			lon0: ((s.lon + (rand() - 0.5) * 14) * Math.PI) / 180,
			base: normal.clone().multiplyScalar(alt),
			normal,
			quat,
			scale: 0.55 + rand() * 0.5,
			speed: 0.006 + rand() * 0.014,
			bobPhase: rand() * Math.PI * 2,
			bobSpeed: 0.3 + rand() * 0.35
		};
	});

	let pivots: THREE.Group[] = [];
	let bodies: THREE.Group[] = [];
	let time = 0;

	useTask((delta) => {
		if (!animate) return;
		time += delta;
		for (let i = 0; i < clouds.length; i++) {
			const c = clouds[i];
			const pivot = pivots[i];
			const body = bodies[i];
			if (pivot) pivot.rotation.y += c.speed * delta;
			if (body) {
				const bob = Math.sin(time * c.bobSpeed + c.bobPhase) * 0.035;
				body.position.copy(c.base).addScaledVector(c.normal, bob);
			}
		}
	});
</script>

{#each clouds as c, i}
	<T.Group bind:ref={pivots[i]} rotation.y={c.lon0}>
		<T.Group
			bind:ref={bodies[i]}
			position={[c.base.x, c.base.y, c.base.z]}
			quaternion={[c.quat.x, c.quat.y, c.quat.z, c.quat.w]}
			scale={c.scale}
		>
			<T.Mesh geometry={c.geometry} material={cloudMat} />
		</T.Group>
	</T.Group>
{/each}
