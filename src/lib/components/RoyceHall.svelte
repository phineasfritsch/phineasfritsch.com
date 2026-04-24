<script lang="ts">
	import { T } from '@threlte/core';
	import { HTML } from '@threlte/extras';
	import { goto } from '$app/navigation';
	import { hoveredHotspot } from '$lib/stores/hover';
	import * as THREE from 'three';

	interface Props {
		lat: number;
		lon: number;
	}
	let { lat, lon }: Props = $props();

	const R = 3.5; // on top of raised land mass
	const φ = (lat * Math.PI) / 180;
	const λ = (lon * Math.PI) / 180;
	const pos = new THREE.Vector3(R * Math.cos(φ) * Math.cos(λ), R * Math.sin(φ), R * Math.cos(φ) * Math.sin(λ));
	const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());

	const S = 0.16;

	let hovered = $state(false);

	const stoneMat = new THREE.MeshToonMaterial({ color: '#D4C5A9' });
	const roofMat  = new THREE.MeshToonMaterial({ color: '#8B2020' });
	const darkMat  = new THREE.MeshToonMaterial({ color: '#5a4020' });
	const hitMat   = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
</script>

<T.Group
	position={[pos.x, pos.y, pos.z]}
	quaternion={[quat.x, quat.y, quat.z, quat.w]}
	scale={[S, S, S]}
>
	<!-- Invisible hit target -->
	<T.Mesh
		onclick={() => goto('/ucla/')}
		onpointerenter={() => { hovered = true; hoveredHotspot.set('UCLA — Royce Hall'); }}
		onpointerleave={() => { hovered = false; hoveredHotspot.set(null); }}
	>
		<T.BoxGeometry args={[4.5, 5, 3]} />
		<T is={hitMat} />
		{#if hovered}
			<HTML center>
				<div class="label">UCLA</div>
			</HTML>
		{/if}
	</T.Mesh>

	<!-- Main hall body -->
	<T.Mesh position={[0, 0.7, 0]}>
		<T.BoxGeometry args={[4, 1.4, 1.8]} />
		<T is={stoneMat} />
	</T.Mesh>

	<!-- Central tower -->
	<T.Mesh position={[0, 2.2, 0]}>
		<T.BoxGeometry args={[1.0, 2.0, 1.0]} />
		<T is={stoneMat} />
	</T.Mesh>

	<!-- Tower top pyramid -->
	<T.Mesh position={[0, 3.45, 0]}>
		<T.CylinderGeometry args={[0, 0.65, 0.9, 4]} />
		<T is={roofMat} />
	</T.Mesh>

	<!-- Left wing -->
	<T.Mesh position={[-1.6, 0.5, 0]}>
		<T.BoxGeometry args={[1.0, 1.0, 1.5]} />
		<T is={stoneMat} />
	</T.Mesh>
	<!-- Left wing roof -->
	<T.Mesh position={[-1.6, 1.15, 0]}>
		<T.CylinderGeometry args={[0, 0.7, 0.7, 4]} />
		<T is={roofMat} />
	</T.Mesh>

	<!-- Right wing -->
	<T.Mesh position={[1.6, 0.5, 0]}>
		<T.BoxGeometry args={[1.0, 1.0, 1.5]} />
		<T is={stoneMat} />
	</T.Mesh>
	<!-- Right wing roof -->
	<T.Mesh position={[1.6, 1.15, 0]}>
		<T.CylinderGeometry args={[0, 0.7, 0.7, 4]} />
		<T is={roofMat} />
	</T.Mesh>

	<!-- Front arch columns (decorative) -->
	{#each [-1.2, -0.4, 0.4, 1.2] as x}
		<T.Mesh position={[x, 0.5, 0.95]}>
			<T.CylinderGeometry args={[0.07, 0.09, 1.0, 8]} />
			<T is={stoneMat} />
		</T.Mesh>
	{/each}

	<!-- Steps base -->
	<T.Mesh position={[0, -0.05, 0.9]}>
		<T.BoxGeometry args={[3.2, 0.1, 0.4]} />
		<T is={darkMat} />
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
		border: 1px solid rgba(39, 116, 174, 0.5);
		white-space: nowrap;
		pointer-events: none;
	}
</style>
