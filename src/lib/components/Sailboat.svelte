<script lang="ts">
	import { T, useTask } from '@threlte/core';
	import { HTML } from '@threlte/extras';
	import { goto } from '$app/navigation';
	import { hoveredHotspot } from '$lib/stores/hover';
	import * as THREE from 'three';

	interface Props {
		lat: number;
		lon: number;
	}
	let { lat, lon }: Props = $props();

	const R = 3.08;
	const φ = (lat * Math.PI) / 180;
	const λ = (lon * Math.PI) / 180;
	const surfacePos = new THREE.Vector3(R * Math.cos(φ) * Math.cos(λ), R * Math.sin(φ), R * Math.cos(φ) * Math.sin(λ));
	const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), surfacePos.clone().normalize());

	const S = 0.15;

	// Sail canvas texture
	function makeSailTex(): THREE.CanvasTexture {
		const c = document.createElement('canvas');
		c.width = 256; c.height = 512;
		const ctx = c.getContext('2d')!;
		ctx.fillStyle = '#F8F4EA';
		ctx.fillRect(0, 0, 256, 512);
		ctx.fillStyle = '#2774AE';
		ctx.font = 'bold 60px serif';
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillText('UCLA', 128, 300);
		return new THREE.CanvasTexture(c);
	}

	const sailTex = makeSailTex();

	let hovered = $state(false);
	let group = $state<THREE.Group>();
	let time = 0;

	useTask((delta) => {
		time += delta;
		if (group) {
			const n = surfacePos.clone().normalize();
			group.position.copy(surfacePos).addScaledVector(n, Math.sin(time * 0.8) * 0.006);
		}
	});

	const hullMat = new THREE.MeshToonMaterial({ color: '#2c1a0a' });
	const deckMat = new THREE.MeshToonMaterial({ color: '#8B6914' });
	const mastMat = new THREE.MeshToonMaterial({ color: '#C8A050' });
	const sailMat = new THREE.MeshToonMaterial({ map: sailTex, side: THREE.DoubleSide });
	const hitMat  = new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 });
</script>

<T.Group
	bind:ref={group}
	position={[surfacePos.x, surfacePos.y, surfacePos.z]}
	quaternion={[quat.x, quat.y, quat.z, quat.w]}
	scale={[S, S, S]}
>
	<!-- Hit zone -->
	<T.Mesh
		onclick={() => goto('/sailing/')}
		onpointerenter={() => { hovered = true; hoveredHotspot.set('Sailing'); }}
		onpointerleave={() => { hovered = false; hoveredHotspot.set(null); }}
	>
		<T.BoxGeometry args={[3.5, 5, 2]} />
		<T is={hitMat} />
		{#if hovered}
			<HTML center>
				<div class="label">Sailing</div>
			</HTML>
		{/if}
	</T.Mesh>

	<!-- Hull -->
	<T.Mesh scale={[2.2, 0.28, 0.72]}>
		<T.SphereGeometry args={[1, 24, 12]} />
		<T is={hullMat} />
	</T.Mesh>

	<!-- Deck -->
	<T.Mesh position={[0, 0.18, 0]}>
		<T.BoxGeometry args={[2.0, 0.08, 0.58]} />
		<T is={deckMat} />
	</T.Mesh>

	<!-- Mast -->
	<T.Mesh position={[0.1, 0.18, 0]}>
		<T.CylinderGeometry args={[0.03, 0.04, 3.2, 8]} />
		<T is={mastMat} />
	</T.Mesh>

	<!-- Main sail -->
	<T.Mesh position={[0.15, 1.75, 0.05]}>
		<T.PlaneGeometry args={[1.3, 2.7]} />
		<T is={sailMat} />
	</T.Mesh>

	<!-- Jib -->
	<T.Mesh position={[-0.6, 1.1, 0.05]} rotation={[0, 0, -0.15]}>
		<T.PlaneGeometry args={[0.9, 1.9]} />
		<T.MeshToonMaterial color="#F0ECE0" side={THREE.DoubleSide} />
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
		border: 1px solid rgba(100, 180, 255, 0.5);
		white-space: nowrap;
		pointer-events: none;
	}
</style>
