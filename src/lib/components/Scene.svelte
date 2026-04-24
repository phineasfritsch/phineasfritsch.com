<script lang="ts">
	import { Canvas } from '@threlte/core';
	import SceneRoot from './SceneRoot.svelte';
</script>

<div class="canvas-wrap">
	<Canvas>
		<SceneRoot />
	</Canvas>
</div>

<style>
	.canvas-wrap {
		width: 100%;
		height: 100%;
	}
</style>
