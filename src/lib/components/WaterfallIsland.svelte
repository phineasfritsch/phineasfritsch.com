<script lang="ts">
	import { T } from '@threlte/core';
	import * as THREE from 'three';

	interface Props {
		lat: number;
		lon: number;
	}
	let { lat, lon }: Props = $props();

	const R = 3;
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

	const beachMat = new THREE.MeshToonMaterial({ color: '#C8A850' });
	const cliffMat = new THREE.MeshToonMaterial({ color: '#7B5A28' });
	const rockMat = new THREE.MeshToonMaterial({ color: '#9E8A68' });
	const grassMat = new THREE.MeshToonMaterial({ color: '#2E7D32' });
	const waterMat = new THREE.MeshToonMaterial({
		color: '#44BBEE',
		transparent: true,
		opacity: 0.88
	});
	const splashMat = new THREE.MeshToonMaterial({
		color: '#99DDFF',
		transparent: true,
		opacity: 0.7
	});
	const treeMat = new THREE.MeshToonMaterial({ color: '#2E7D32' });
	const trunkMat = new THREE.MeshToonMaterial({ color: '#6D4C41' });
</script>

<T.Group position={[pos.x, pos.y, pos.z]} quaternion={[quat.x, quat.y, quat.z, quat.w]}>
	<!-- Sandy beach base -->
	<T.Mesh>
		<T.CylinderGeometry args={[0.65, 0.72, 0.12, 6]} />
		<T is={beachMat} />
	</T.Mesh>

	<!-- Tall rocky cliff body -->
	<T.Mesh position={[0, 0.42, 0]}>
		<T.CylinderGeometry args={[0.4, 0.58, 0.7, 6]} />
		<T is={cliffMat} />
	</T.Mesh>

	<!-- Rock outcrop on cliff face -->
	<T.Mesh position={[0.46, 0.22, 0.1]} rotation={[0.1, 0, 0.35]}>
		<T.BoxGeometry args={[0.16, 0.13, 0.12]} />
		<T is={rockMat} />
	</T.Mesh>
	<T.Mesh position={[0.38, 0.38, -0.12]} rotation={[0, 0.2, 0.2]}>
		<T.BoxGeometry args={[0.13, 0.11, 0.1]} />
		<T is={rockMat} />
	</T.Mesh>

	<!-- Green grass top -->
	<T.Mesh position={[0, 0.82, 0]}>
		<T.CylinderGeometry args={[0.38, 0.4, 0.1, 6]} />
		<T is={grassMat} />
	</T.Mesh>

	<!-- Waterfall ribbon — cascades down the right cliff face -->
	<T.Mesh position={[0.44, 0.35, 0.08]} rotation={[0, 0, 0.28]}>
		<T.BoxGeometry args={[0.1, 0.58, 0.14]} />
		<T is={waterMat} />
	</T.Mesh>
	<!-- Second waterfall tier -->
	<T.Mesh position={[0.52, 0.08, 0.1]} rotation={[0.15, 0, 0.1]}>
		<T.BoxGeometry args={[0.08, 0.2, 0.12]} />
		<T is={waterMat} />
	</T.Mesh>

	<!-- Splash pool at cliff base -->
	<T.Mesh position={[0.58, 0.06, 0.09]}>
		<T.CylinderGeometry args={[0.18, 0.15, 0.04, 8]} />
		<T is={splashMat} />
	</T.Mesh>

	<!-- Trees on top -->
	<T.Mesh position={[-0.12, 0.92, 0.04]}>
		<T.CylinderGeometry args={[0.03, 0.046, 0.18, 5]} />
		<T is={trunkMat} />
	</T.Mesh>
	<T.Mesh position={[-0.12, 1.12, 0.04]}>
		<T.SphereGeometry args={[0.21, 6, 5]} />
		<T is={treeMat} />
	</T.Mesh>
	<T.Mesh position={[0.1, 0.9, -0.1]}>
		<T.CylinderGeometry args={[0.025, 0.038, 0.14, 5]} />
		<T is={trunkMat} />
	</T.Mesh>
	<T.Mesh position={[0.1, 1.06, -0.1]}>
		<T.SphereGeometry args={[0.17, 6, 5]} />
		<T is={treeMat} />
	</T.Mesh>
</T.Group>
