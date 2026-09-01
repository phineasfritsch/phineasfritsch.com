<script lang="ts">
	import { postDate } from '$lib/date';
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
	// mdsvex hands back a Svelte component as the module default; the load function
	// types it as unknown because it cannot know that statically.
	const PostContent = $derived(data.content as unknown as import('svelte').Component);
</script>

<svelte:head>
	<title>{data.title} — Phineas Fritsch</title>
	<meta name="description" content={data.excerpt ?? data.title} />
</svelte:head>

<article class="section" style="margin-top:2.5rem">
	<p class="stack" style="margin-bottom:0.5rem"><a href="/blog/">← writing</a></p>
	<!-- The post body is markdown and supplies no h1 of its own; this is the page's
	     single h1, which ops/sanity.mjs (build.page-metadata) enforces. -->
	<h1 style="font-size:clamp(1.6rem,3.6vw,2.2rem);letter-spacing:-0.02em;font-weight:600">
		{data.title}
	</h1>
	<p class="stack" style="margin-top:0.4rem">
		<time datetime={data.date}>{postDate(data.date)}</time>
	</p>
	<div class="prose post-body" style="margin-top:1.5rem">
		<PostContent />
	</div>
</article>

<style>
	.post-body :global(h2) {
		font-family: var(--font-mono);
		font-size: 0.82rem;
		font-weight: 600;
		letter-spacing: 0.11em;
		text-transform: uppercase;
		margin: 2rem 0 0.7rem;
		padding-bottom: 0.35rem;
		border-bottom: 1px solid var(--rule-strong);
		color: var(--ink);
	}
	.post-body :global(p) {
		margin-bottom: 0.95rem;
	}
	.post-body :global(ul),
	.post-body :global(ol) {
		margin: 0 0 1rem 1.2rem;
		color: var(--ink-soft);
	}
	.post-body :global(li) {
		margin-bottom: 0.35rem;
	}
	.post-body :global(code) {
		font-family: var(--font-mono);
		font-size: 0.85em;
		background: var(--paper-sunk);
		padding: 0.1em 0.35em;
		border-radius: 2px;
	}
	.post-body :global(blockquote) {
		border-left: 2px solid var(--rule-strong);
		padding-left: 0.9rem;
		margin: 0 0 1rem;
		color: var(--ink-faint);
	}
</style>
