<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Blog — Phineas Fritsch</title>
</svelte:head>

<div class="page-wrapper">
	<div class="content">
		<span class="tag">Writing</span>
		<h1>Blog</h1>
		<div class="divider"></div>

		{#if data.posts.length === 0}
			<p class="empty">Nothing here yet.</p>
		{:else}
			<ul class="post-list">
				{#each data.posts as post}
					<li>
						<a href="/blog/{post.slug}/" class="post-link">
							<span class="post-date">{post.date}</span>
							<span class="post-title">{post.title}</span>
							{#if post.excerpt}
								<span class="post-excerpt">{post.excerpt}</span>
							{/if}
						</a>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>

<style>
	.page-wrapper {
		min-height: 100vh;
		background: linear-gradient(180deg, #03040c 0%, #060b18 55%, #08101e 100%);
		display: flex;
		align-items: flex-start;
		justify-content: center;
		padding: 9rem 2rem 4rem;
	}

	.content {
		max-width: 620px;
		width: 100%;
	}

	.tag {
		font-family: var(--font-body);
		font-size: 0.72rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--color-sunset-gold);
		opacity: 0.7;
	}

	h1 {
		font-family: var(--font-display);
		font-size: clamp(2rem, 5vw, 3.5rem);
		font-weight: 400;
		color: var(--color-text-primary);
		margin-top: 0.5rem;
	}

	.divider {
		width: 48px;
		height: 1px;
		background: rgba(232, 160, 48, 0.35);
		margin: 1.75rem 0;
	}

	.empty {
		color: var(--color-text-muted);
		font-size: 0.9rem;
	}

	.post-list {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.post-link {
		display: grid;
		grid-template-columns: 90px 1fr;
		grid-template-rows: auto auto;
		gap: 0.2rem 1.5rem;
		padding: 1.4rem 0;
		border-bottom: 1px solid rgba(240, 220, 180, 0.07);
		transition: border-color 0.25s;
	}

	.post-link:hover {
		border-bottom-color: rgba(232, 160, 48, 0.25);
	}

	.post-link:hover .post-title {
		color: var(--color-text-primary);
	}

	.post-date {
		font-size: 0.7rem;
		letter-spacing: 0.08em;
		color: var(--color-text-muted);
		padding-top: 0.15rem;
		grid-row: 1;
	}

	.post-title {
		font-family: var(--font-display);
		font-size: 1.1rem;
		color: rgba(240, 220, 180, 0.85);
		grid-row: 1;
		transition: color 0.25s;
	}

	.post-excerpt {
		font-size: 0.85rem;
		line-height: 1.65;
		color: rgba(200, 180, 150, 0.5);
		grid-column: 2;
		grid-row: 2;
	}
</style>
