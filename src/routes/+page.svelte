<script lang="ts">
	import { browser } from '$app/environment';
	import { hoveredHotspot } from '$lib/stores/hover';
	import Scene from '$lib/components/Scene.svelte';
</script>

<svelte:head>
	<title>Phineas Fritsch</title>
</svelte:head>

<main class="root">
	{#if browser}
		<div class="canvas-fill">
			<Scene />
		</div>
	{:else}
		<div class="canvas-fill placeholder"></div>
	{/if}

	<div class="ui">
		<div class="name-block">
			<h1>Phineas Fritsch</h1>
			<p class="hint" class:visible={!$hoveredHotspot}>click to explore</p>
		</div>
		<nav class="bottom-nav">
			<a href="/blog/">Blog</a>
		</nav>
	</div>

	{#if $hoveredHotspot}
		<div class="hotspot-tag">{$hoveredHotspot}</div>
	{/if}
</main>

<style>
	.root {
		position: relative;
		width: 100vw;
		height: 100dvh;
		overflow: hidden;
		background: #020309;
	}

	.canvas-fill {
		position: absolute;
		inset: 0;
	}

	.placeholder {
		background: radial-gradient(ellipse at 50% 55%, #1a3060 0%, #020309 70%);
	}

	/* ── overlay ────────────────────────────────────────────────────────────── */
	.ui {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: flex-end;
		padding-bottom: 3rem;
		pointer-events: none;
	}

	.name-block {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 1.25rem;
	}

	h1 {
		font-family: var(--font-display);
		font-size: clamp(1.6rem, 3.5vw, 3rem);
		font-weight: 400;
		color: rgba(240, 228, 208, 0.92);
		letter-spacing: 0.07em;
		text-shadow:
			0 2px 40px rgba(200, 120, 40, 0.3),
			0 0 80px rgba(50, 80, 160, 0.2);
		margin: 0;
	}

	.hint {
		font-size: 0.68rem;
		letter-spacing: 0.28em;
		text-transform: uppercase;
		color: rgba(220, 200, 160, 0.35);
		animation: pulse 4s ease-in-out infinite;
		transition: opacity 0.3s;
		margin: 0;
	}

	.hint.visible {
		opacity: 1;
	}

	.bottom-nav {
		pointer-events: all;
	}

	.bottom-nav a {
		font-size: 0.72rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: rgba(220, 200, 160, 0.4);
		transition: color 0.25s;
	}

	.bottom-nav a:hover {
		color: rgba(232, 160, 48, 0.85);
	}

	/* ── hotspot tag ───────────────────────────────────────────────────────── */
	.hotspot-tag {
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, calc(-50% - 180px));
		font-family: var(--font-body);
		font-size: 0.7rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: rgba(255, 240, 200, 0.9);
		background: rgba(5, 10, 25, 0.65);
		padding: 0.4rem 1rem;
		border-radius: 2rem;
		border: 1px solid rgba(232, 160, 48, 0.35);
		backdrop-filter: blur(8px);
		pointer-events: none;
	}

	@keyframes pulse {
		0%,
		100% {
			opacity: 0.3;
		}
		50% {
			opacity: 0.7;
		}
	}
</style>
