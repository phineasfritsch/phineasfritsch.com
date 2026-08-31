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

	const R = 3.5;
	const φ = (lat * Math.PI) / 180;
	const λ = (lon * Math.PI) / 180;
	const pos = new THREE.Vector3(
		R * Math.cos(φ) * Math.cos(λ),
		R * Math.sin(φ),
		R * Math.cos(φ) * Math.sin(λ)
	);
	const quat = new THREE.Quaternion().setFromUnitVectors(
		new THREE.Vector3(0, 1, 0),
		pos.clone().normalize()
	);

	const S = 0.16;

	let hovered = $state(false);

	const wallMat = new THREE.MeshToonMaterial({ color: '#F5F0E8' });
	const roofMat = new THREE.MeshToonMaterial({ color: '#7B3F00' });
	const columnMat = new THREE.MeshToonMaterial({ color: '#FFFFFF' });
	const doorMat = new THREE.MeshToonMaterial({ color: '#5a2d0c' });
	const hitMat = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
</script>

<T.Group
	position={[pos.x, pos.y, pos.z]}
	quaternion={[quat.x, quat.y, quat.z, quat.w]}
	scale={[S, S, S]}
>
	<!-- Hit target -->
	<T.Mesh
		onclick={() => goto('/theta-chi/')}
		onpointerenter={() => {
			hovered = true;
			hoveredHotspot.set('Theta Chi');
		}}
		onpointerleave={() => {
			hovered = false;
			hoveredHotspot.set(null);
		}}
	>
		<T.BoxGeometry args={[4, 5, 3]} />
		<T is={hitMat} />
		{#if hovered}
			<HTML center>
				<div class="label">Theta Chi ΘΧ</div>
			</HTML>
		{/if}
	</T.Mesh>

	<!-- Main house body -->
	<T.Mesh position={[0, 0.75, 0]}>
		<T.BoxGeometry args={[3, 1.5, 1.8]} />
		<T is={wallMat} />
	</T.Mesh>

	<!-- Triangular pediment / gable roof -->
	<T.Mesh position={[0, 1.75, 0]}>
		<T.CylinderGeometry args={[0, 1.7, 1.1, 4]} />
		<T is={roofMat} />
	</T.Mesh>

	<!-- Columns (Greek style) -->
	{#each [-0.9, -0.3, 0.3, 0.9] as x}
		<T.Mesh position={[x, 0.55, 0.95]}>
			<T.CylinderGeometry args={[0.1, 0.12, 1.1, 8]} />
			<T is={columnMat} />
		</T.Mesh>
	{/each}

	<!-- Door -->
	<T.Mesh position={[0, 0.4, 0.92]}>
		<T.BoxGeometry args={[0.45, 0.8, 0.05]} />
		<T is={doorMat} />
	</T.Mesh>

	<!-- ΘΧ sign above door -->
	<T.Mesh position={[0, 0.9, 0.93]}>
		<T.BoxGeometry args={[0.7, 0.25, 0.04]} />
		<T.MeshToonMaterial color="#9B1B30" />
	</T.Mesh>

	<!-- Steps -->
	<T.Mesh position={[0, -0.04, 0.95]}>
		<T.BoxGeometry args={[2.2, 0.08, 0.35]} />
		<T.MeshToonMaterial color="#C8C0B0" />
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
		border: 1px solid rgba(155, 27, 48, 0.5);
		white-space: nowrap;
		pointer-events: none;
	}
</style>
