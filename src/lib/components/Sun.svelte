<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { HTML } from '@threlte/extras';
	import { goto } from '$app/navigation';
	import { hoveredHotspot } from '$lib/stores/hover';
	import * as THREE from 'three';

	// Matches the sun position in Globe.svelte and SceneRoot light
	// Upper-right, close enough to camera plane to be visible above the globe
	const SUN_POS: [number, number, number] = [5, 7, 9];

	let hovered = $state(false);
	let sunMesh = $state<THREE.Mesh>();
	let time = 0;

	useTask((delta) => {
		time += delta;
		if (sunMesh) sunMesh.scale.setScalar(1 + Math.sin(time * 1.1) * 0.022);
	});

	const coreMat = new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffe060') });
	const glow1 = new THREE.MeshBasicMaterial({
		color: new THREE.Color('#ff8800'),
		transparent: true,
		opacity: 0.13,
		side: THREE.BackSide
	});
	const glow2 = new THREE.MeshBasicMaterial({
		color: new THREE.Color('#ff4400'),
		transparent: true,
		opacity: 0.055,
		side: THREE.BackSide
	});
</script>

<T.Mesh
	bind:ref={sunMesh}
	position={SUN_POS}
	onclick={() => goto('/future/')}
	onpointerenter={() => {
		hovered = true;
		hoveredHotspot.set('The Horizon →');
	}}
	onpointerleave={() => {
		hovered = false;
		hoveredHotspot.set(null);
	}}
>
	<T.SphereGeometry args={[0.7, 32, 32]} />
	<T is={coreMat} />
	{#if hovered}
		<HTML center>
			<div class="sun-label">The Horizon</div>
		</HTML>
	{/if}
</T.Mesh>

<T.Mesh position={SUN_POS}>
	<T.SphereGeometry args={[1.35, 32, 32]} />
	<T is={glow1} />
</T.Mesh>

<T.Mesh position={SUN_POS}>
	<T.SphereGeometry args={[2.0, 32, 32]} />
	<T is={glow2} />
</T.Mesh>

<style>
	.sun-label {
		font-family: 'Inter', sans-serif;
		font-size: 10px;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: rgba(255, 242, 200, 0.95);
		background: rgba(3, 5, 18, 0.6);
		padding: 4px 10px;
		border-radius: 20px;
		border: 1px solid rgba(232, 160, 48, 0.4);
		white-space: nowrap;
		pointer-events: none;
	}
</style>
