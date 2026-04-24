<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	// Svelte 5: assign to a local var so we can use it as a component tag
	const PostContent = $derived(data.content as unknown as new () => unknown);
</script>

<svelte:head>
	<title>{data.title} — Phineas Fritsch</title>
</svelte:head>

<div class="page-wrapper">
	<article class="content">
		<header class="post-header">
			<span class="post-date">{data.date}</span>
			<h1>{data.title}</h1>
		</header>

		<div class="prose">
			<PostContent />
		</div>

		<footer class="post-footer">
			<a href="/blog/" class="back">← All posts</a>
		</footer>
	</article>
</div>

<style>
	.page-wrapper {
		min-height: 100vh;
		background: linear-gradient(180deg, #03040c 0%, #060b18 55%, #08101e 100%);
		display: flex;
		justify-content: center;
		padding: 9rem 2rem 6rem;
	}

	.content {
		max-width: 640px;
		width: 100%;
	}

	.post-header {
		margin-bottom: 3rem;
	}

	.post-date {
		font-size: 0.72rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: var(--color-text-muted);
	}

	h1 {
		font-family: var(--font-display);
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 400;
		color: var(--color-text-primary);
		margin-top: 0.5rem;
		line-height: 1.15;
	}

	.prose {
		font-size: 1rem;
		line-height: 1.85;
		color: rgba(220, 200, 170, 0.75);
	}

	.prose :global(h1),
	.prose :global(h2),
	.prose :global(h3) {
		font-family: var(--font-display);
		color: var(--color-text-primary);
		margin: 2rem 0 0.75rem;
	}

	.prose :global(p) {
		margin-bottom: 1.25rem;
	}

	.prose :global(a) {
		color: var(--color-sunset-gold);
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	.prose :global(code) {
		font-size: 0.85em;
		background: rgba(240, 220, 180, 0.08);
		padding: 0.15em 0.4em;
		border-radius: 4px;
	}

	.post-footer {
		margin-top: 4rem;
		padding-top: 2rem;
		border-top: 1px solid rgba(240, 220, 180, 0.08);
	}

	.back {
		font-size: 0.8rem;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		transition: color 0.25s;
	}

	.back:hover {
		color: var(--color-sunset-gold);
	}
</style>
