<script lang="ts">
	import * as THREE from 'three';
	import { T, useTask } from '@threlte/core';
	import { interactivity, OrbitControls } from '@threlte/extras';
	import Globe from './Globe.svelte';
	import Land from './Land.svelte';
	import Space from './Space.svelte';
	import Sailboat from './Sailboat.svelte';
	import RoyceHall from './RoyceHall.svelte';
	import FratHouse from './FratHouse.svelte';
	import WaterfallIsland from './WaterfallIsland.svelte';

	interactivity();

	let globeGroup = $state<THREE.Group>();

	useTask((delta) => {
		if (globeGroup) globeGroup.rotation.y += delta * 0.025;
	});

	function surfPos(lat: number, lon: number, r = 3.36) {
		const φ = (lat * Math.PI) / 180;
		const λ = (lon * Math.PI) / 180;
		return new THREE.Vector3(
			r * Math.cos(φ) * Math.cos(λ),
			r * Math.sin(φ),
			r * Math.cos(φ) * Math.sin(λ)
		);
	}
	function surfQuat(lat: number, lon: number) {
		const φ = (lat * Math.PI) / 180;
		const λ = (lon * Math.PI) / 180;
		const n = new THREE.Vector3(
			Math.cos(φ) * Math.cos(λ),
			Math.sin(φ),
			Math.cos(φ) * Math.sin(λ)
		).normalize();
		return new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), n);
	}

	const treeMat = new THREE.MeshToonMaterial({ color: '#2E7D32' });
	const treeMat2 = new THREE.MeshToonMaterial({ color: '#43A047' });
	const trunkMat = new THREE.MeshToonMaterial({ color: '#6D4C41' });

	// Trees spread across ALL land masses (all longitudes visible as globe rotates)
	const trees: Array<{ lat: number; lon: number; s: number }> = [
		// ── Front face lon 60–120 (camera-facing at start) ────────────────
		// NE continent (Royce Hall)
		{ lat: 25, lon: 60, s: 1.1 },
		{ lat: 20, lon: 55, s: 0.9 },
		{ lat: 28, lon: 66, s: 1.0 },
		{ lat: 18, lon: 70, s: 0.85 },
		{ lat: 24, lon: 72, s: 1.0 },
		{ lat: 30, lon: 62, s: 0.9 },
		// NW continent (FratHouse)
		{ lat: 20, lon: 118, s: 1.0 },
		{ lat: 24, lon: 112, s: 1.1 },
		{ lat: 16, lon: 124, s: 0.9 },
		{ lat: 28, lon: 116, s: 1.0 },
		{ lat: 22, lon: 108, s: 0.85 },
		{ lat: 18, lon: 122, s: 1.0 },
		// Southern continent
		{ lat: -12, lon: 86, s: 1.0 },
		{ lat: -16, lon: 94, s: 0.9 },
		{ lat: -10, lon: 96, s: 1.0 },
		{ lat: -18, lon: 88, s: 0.85 },
		{ lat: -14, lon: 80, s: 1.1 },
		// Central island cluster
		{ lat: 6, lon: 78, s: 0.8 },
		{ lat: 4, lon: 75, s: 0.9 },

		// ── Right side lon 130–190 ─────────────────────────────────────────
		{ lat: 15, lon: 148, s: 1.0 },
		{ lat: 20, lon: 155, s: 0.9 },
		{ lat: 10, lon: 152, s: 1.1 },
		{ lat: -8, lon: 160, s: 0.85 },
		{ lat: -14, lon: 145, s: 1.0 },
		{ lat: 28, lon: 140, s: 0.9 },
		{ lat: 5, lon: 168, s: 1.0 },

		// ── Back face lon 190–250 ──────────────────────────────────────────
		{ lat: 18, lon: 210, s: 1.0 },
		{ lat: 10, lon: 220, s: 0.9 },
		{ lat: -5, lon: 205, s: 1.1 },
		{ lat: 25, lon: 230, s: 0.9 },
		{ lat: -15, lon: 225, s: 1.0 },

		// ── Left side lon 250–320 ──────────────────────────────────────────
		{ lat: 12, lon: 268, s: 1.0 },
		{ lat: 22, lon: 275, s: 0.9 },
		{ lat: -10, lon: 260, s: 1.0 },
		{ lat: 5, lon: 290, s: 0.85 },
		{ lat: -20, lon: 278, s: 1.1 },
		{ lat: 30, lon: 285, s: 0.9 },

		// ── Northern cap bits ──────────────────────────────────────────────
		{ lat: 35, lon: 90, s: 0.75 },
		{ lat: 38, lon: 200, s: 0.7 }
	];
</script>

<T.PerspectiveCamera makeDefault position={[0, 3.5, 12]} fov={40} />

<!-- Warm key light upper-left -->
<T.DirectionalLight position={[-6, 9, 5]} color="#fff6e8" intensity={4.5} castShadow />
<!-- Cool fill from lower-right -->
<T.DirectionalLight position={[5, -2, 6]} color="#c8e8ff" intensity={0.9} />
<!-- Ambient — prevent pure black shadows -->
<T.AmbientLight color="#182048" intensity={2.5} />

<Space />

<T.Group bind:ref={globeGroup}>
	<Globe />

	<!-- ══════════════════════════════════════════════════════════════
	     LAND MASSES — spread globally so rotation reveals new content
	     lon=90 faces camera at start; full 360° covered below
	     ══════════════════════════════════════════════════════════════ -->

	<!-- ── FRONT FACE (lon 55–125) ──────────────────────────────── -->
	<!-- NE continent — Royce Hall -->
	<Land lat={22} lon={65} radius={1.25} sides={9} color="#3a8c35" height={0.32} />
	<Land lat={14} lon={73} radius={0.58} sides={7} color="#4caf50" height={0.24} />
	<!-- NW continent — FratHouse -->
	<Land lat={18} lon={115} radius={1.18} sides={9} color="#3a8c35" height={0.32} />
	<Land lat={26} lon={107} radius={0.52} sides={6} color="#4caf50" height={0.22} />
	<!-- Southern continent -->
	<Land lat={-13} lon={90} radius={1.05} sides={8} color="#3a8c35" height={0.3} />
	<Land lat={-22} lon={83} radius={0.42} sides={6} color="#4caf50" height={0.2} />
	<Land lat={-20} lon={98} radius={0.4} sides={5} color="#4caf50" height={0.18} />
	<!-- Central island -->
	<Land lat={5} lon={79} radius={0.48} sides={6} color="#3d8c35" height={0.22} />
	<!-- Northern atoll -->
	<Land lat={34} lon={88} radius={0.35} sides={5} color="#5aba50" height={0.18} />

	<!-- ── RIGHT SIDE (lon 130–190) ─────────────────────────────── -->
	<Land lat={16} lon={150} radius={0.9} sides={8} color="#3a8c35" height={0.28} />
	<Land lat={8} lon={162} radius={0.55} sides={7} color="#4caf50" height={0.22} />
	<Land lat={-10} lon={145} radius={0.62} sides={7} color="#3d8c35" height={0.24} />
	<Land lat={28} lon={138} radius={0.4} sides={5} color="#5aba50" height={0.18} />
	<Land lat={-2} lon={170} radius={0.38} sides={5} color="#4caf50" height={0.18} />

	<!-- ── BACK FACE (lon 195–240) ──────────────────────────────── -->
	<Land lat={18} lon={210} radius={0.8} sides={8} color="#3a8c35" height={0.26} />
	<Land lat={8} lon={222} radius={0.5} sides={6} color="#4caf50" height={0.22} />
	<Land lat={-8} lon={205} radius={0.55} sides={7} color="#3d8c35" height={0.22} />
	<Land lat={26} lon={232} radius={0.38} sides={5} color="#5aba50" height={0.18} />
	<Land lat={-18} lon={228} radius={0.42} sides={6} color="#4caf50" height={0.2} />

	<!-- ── LEFT SIDE (lon 255–320) ──────────────────────────────── -->
	<Land lat={14} lon={268} radius={0.85} sides={8} color="#3a8c35" height={0.26} />
	<Land lat={24} lon={278} radius={0.48} sides={6} color="#4caf50" height={0.22} />
	<Land lat={-12} lon={262} radius={0.58} sides={7} color="#3d8c35" height={0.24} />
	<Land lat={4} lon={292} radius={0.4} sides={5} color="#5aba50" height={0.18} />
	<Land lat={-22} lon={280} radius={0.44} sides={6} color="#4caf50" height={0.2} />
	<Land lat={32} lon={288} radius={0.34} sides={5} color="#5aba50" height={0.16} />

	<!-- ── BUILDINGS ─────────────────────────────────────────────── -->
	<RoyceHall lat={22} lon={65} />
	<FratHouse lat={18} lon={115} />

	<!-- ── WATERFALL ISLAND ──────────────────────────────────────── -->
	<WaterfallIsland lat={4} lon={100} />

	<!-- ── SAILBOAT ──────────────────────────────────────────────── -->
	<Sailboat lat={-2} lon={90} />

	<!-- ── TREES ─────────────────────────────────────────────────── -->
	{#each trees as { lat, lon, s }}
		{@const p = surfPos(lat, lon)}
		{@const q = surfQuat(lat, lon)}
		<T.Group position={[p.x, p.y, p.z]} quaternion={[q.x, q.y, q.z, q.w]}>
			<T.Mesh position={[0, 0.07, 0]}>
				<T.CylinderGeometry args={[0.032 * s, 0.052 * s, 0.18 * s, 5]} />
				<T is={trunkMat} />
			</T.Mesh>
			<T.Mesh position={[0, 0.3 * s, 0]}>
				<T.SphereGeometry args={[0.2 * s, 6, 5]} />
				<T is={treeMat} />
			</T.Mesh>
			<T.Mesh position={[0, 0.44 * s, 0]}>
				<T.SphereGeometry args={[0.12 * s, 5, 4]} />
				<T is={treeMat2} />
			</T.Mesh>
		</T.Group>
	{/each}
</T.Group>

<OrbitControls
	target={[0, 0, 0]}
	enablePan={false}
	enableZoom={false}
	minPolarAngle={Math.PI / 8}
	maxPolarAngle={(Math.PI * 3) / 4}
	rotateSpeed={0.5}
/>
