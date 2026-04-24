<script lang="ts">
	import { T } from '@threlte/core';
	import * as THREE from 'three';

	interface Props {
		lat: number;
		lon: number;
		radius?: number;
		height?: number;
		sides?: number;
		color?: string;
	}

	let { lat, lon, radius = 0.9, height = 0.28, sides = 7, color = '#3a8c35' }: Props = $props();

	const R = 3;
	const φ = (lat * Math.PI) / 180;
	const λ = (lon * Math.PI) / 180;
	const pos = new THREE.Vector3(R * Math.cos(φ) * Math.cos(λ), R * Math.sin(φ), R * Math.cos(φ) * Math.sin(λ));
	const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), pos.clone().normalize());

	// Low-poly layered materials
	const beachMat = new THREE.MeshToonMaterial({ color: '#C8A850', flatShading: true });
	const cliffMat = new THREE.MeshToonMaterial({ color: '#7B5A28', flatShading: true });
	const grassMat = new THREE.MeshToonMaterial({ color, flatShading: true });
</script>

<!-- All layers share the same group so Y-axis aligns with sphere normal -->
<T.Group position={[pos.x, pos.y, pos.z]} quaternion={[quat.x, quat.y, quat.z, quat.w]}>
	<!-- Sandy beach shelf — widest, sits flush with sphere -->
	<T.Mesh>
		<T.CylinderGeometry args={[radius + 0.24, radius + 0.34, 0.13, sides]} />
		<T is={beachMat} />
	</T.Mesh>

	<!-- Brown cliff body — tapers inward toward top -->
	<T.Mesh position={[0, height * 0.55 + 0.065, 0]}>
		<T.CylinderGeometry args={[radius, radius + 0.2, height * 1.1, sides]} />
		<T is={cliffMat} />
	</T.Mesh>

	<!-- Green grass cap on top -->
	<T.Mesh position={[0, height * 1.1 + 0.13, 0]}>
		<T.CylinderGeometry args={[radius - 0.02, radius + 0.02, 0.1, sides]} />
		<T is={grassMat} />
	</T.Mesh>
</T.Group>
