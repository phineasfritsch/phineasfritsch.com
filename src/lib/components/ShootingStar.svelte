<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { HTML } from '@threlte/extras';
	import { goto } from '$app/navigation';
	import { hoveredHotspot } from '$lib/stores/hover';
	import * as THREE from 'three';

	let hovered = $state(false);
	let starGroup = $state<THREE.Group>();
	let trailMesh = $state<THREE.Mesh>();
	let time = 0;

	// 5-pointed star geometry
	function makeStarShape(): THREE.Shape {
		const shape = new THREE.Shape();
		const outer = 1;
		const inner = 0.42;
		const pts = 5;
		for (let i = 0; i < pts * 2; i++) {
			const r = i % 2 === 0 ? outer : inner;
			const a = (i * Math.PI) / pts - Math.PI / 2;
			if (i === 0) shape.moveTo(r * Math.cos(a), r * Math.sin(a));
			else shape.lineTo(r * Math.cos(a), r * Math.sin(a));
		}
		shape.closePath();
		return shape;
	}

	const starGeo = new THREE.ExtrudeGeometry(makeStarShape(), {
		depth: 0.35,
		bevelEnabled: true,
		bevelThickness: 0.06,
		bevelSize: 0.06,
		bevelSegments: 2
	});

	const starMat = new THREE.MeshToonMaterial({
		color: '#FFD700',
		emissive: '#FF8C00',
		emissiveIntensity: 0.3
	});
	const glowMat = new THREE.MeshBasicMaterial({
		color: '#FFE566',
		transparent: true,
		opacity: 0.18,
		side: THREE.BackSide
	});
	const trailMat = new THREE.MeshBasicMaterial({
		color: '#FFE566',
		transparent: true,
		opacity: 0.12
	});
	const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });

	// Orbit parameters
	const ORBIT_R = 4.2;
	const ORBIT_Y = 4.0;

	useTask((delta) => {
		time += delta;
		if (starGroup) {
			const angle = time * 0.45;
			starGroup.position.set(ORBIT_R * Math.cos(angle), ORBIT_Y, ORBIT_R * Math.sin(angle));
			// Always face the camera
			starGroup.lookAt(0, 3.5, 12);
			// Twinkle: slight scale pulse
			const s = 1 + Math.sin(time * 3.2) * 0.06;
			starGroup.scale.setScalar(s);
		}
		if (trailMesh) {
			// Trail fades
			const a = 0.08 + Math.abs(Math.sin(time * 1.5)) * 0.08;
			(trailMesh.material as THREE.MeshBasicMaterial).opacity = a;
		}
	});
</script>

<T.Group bind:ref={starGroup} position={[ORBIT_R, ORBIT_Y, 0]}>
	<!-- Invisible hit zone -->
	<T.Mesh
		onclick={() => goto('/future/')}
		onpointerenter={() => {
			hovered = true;
			hoveredHotspot.set('Shoot for the Stars →');
		}}
		onpointerleave={() => {
			hovered = false;
			hoveredHotspot.set(null);
		}}
	>
		<T.SphereGeometry args={[1.6, 16, 16]} />
		<T is={hitMat} />
		{#if hovered}
			<HTML center>
				<div class="label">The Future</div>
			</HTML>
		{/if}
	</T.Mesh>

	<!-- Star body -->
	<T.Mesh position={[-0.5, -0.5, -0.175]}>
		<T is={starGeo} />
		<T is={starMat} />
	</T.Mesh>

	<!-- Outer glow -->
	<T.Mesh>
		<T.SphereGeometry args={[1.3, 16, 16]} />
		<T is={glowMat} />
	</T.Mesh>

	<!-- Trail -->
	<T.Mesh bind:ref={trailMesh} position={[1.6, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
		<T.ConeGeometry args={[0.25, 3.5, 8]} />
		<T is={trailMat} />
	</T.Mesh>
</T.Group>

<style>
	.label {
		font-family: 'Inter', sans-serif;
		font-size: 9px;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: rgba(255, 242, 210, 0.95);
		background: rgba(3, 5, 18, 0.7);
		padding: 3px 8px;
		border-radius: 20px;
		border: 1px solid rgba(255, 215, 0, 0.5);
		white-space: nowrap;
		pointer-events: none;
	}
</style>
