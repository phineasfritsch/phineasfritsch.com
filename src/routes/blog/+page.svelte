<script lang="ts">
	import type { PageData } from './$types';
	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Writing — Phineas Fritsch</title>
	<meta
		name="description"
		content="Notes on building software as a non-engineer, and on what it takes to trust work an AI produced."
	/>
</svelte:head>

<section class="section" style="margin-top:2.5rem">
	<h1 style="font-size:clamp(1.6rem,3.6vw,2.2rem);letter-spacing:-0.02em;font-weight:600">
		Writing
	</h1>
	<div class="prose" style="margin-top:0.9rem">
		<p>
			Notes on building things I am not formally qualified to build, and on checking the result.
		</p>
	</div>
</section>

<section class="section">
	<div class="section-head">
		<h2>Posts</h2>
		<span class="note">{data.posts.length} {data.posts.length === 1 ? 'post' : 'posts'}</span>
	</div>
	{#if data.posts.length === 0}
		<div class="prose"><p>Nothing here yet.</p></div>
	{:else}
		<ol class="rows">
			{#each data.posts as post, i (post.slug)}
				<li class="row">
					<span class="row-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
					<div>
						<div class="row-title">
							<h3><a href="/blog/{post.slug}/">{post.title}</a></h3>
							<span class="stack">{post.date}</span>
						</div>
						{#if post.excerpt}<p>{post.excerpt}</p>{/if}
					</div>
				</li>
			{/each}
		</ol>
	{/if}
</section>
