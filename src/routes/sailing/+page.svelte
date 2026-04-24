<svelte:head>
	<title>Sailing — Phineas Fritsch</title>
</svelte:head>

<div class="page-wrapper">
	<div class="content">
		<span class="tag">On the Water</span>
		<h1>Sailing</h1>
		<div class="divider"></div>
		<p class="lead">
			There's something about the ocean that resets everything. Wind, water, and a boat that does
			exactly what you ask of it — if you've learned to ask right.
		</p>
		<p>
			[Fill in your sailing background here — where you learned, where you've sailed, any racing
			experience, boats you've sailed on, what sailing means to you.]
		</p>
		<p>
			[Races, cruises, favorite spots, or stories from the water. This is your page — make it feel
			real.]
		</p>
	</div>
</div>

<style>
	.page-wrapper {
		min-height: 100vh;
		background: linear-gradient(180deg, #05051a 0%, #060d1f 55%, #0a1525 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 8rem 2rem 4rem;
	}

	.content {
		max-width: 640px;
		width: 100%;
	}

	.tag {
		font-family: var(--font-body);
		font-size: 0.72rem;
		letter-spacing: 0.22em;
		text-transform: uppercase;
		color: var(--color-sunset-gold);
		opacity: 0.75;
	}

	h1 {
		font-family: var(--font-display);
		font-size: clamp(2.5rem, 6vw, 4.5rem);
		font-weight: 400;
		color: var(--color-text-primary);
		margin-top: 0.5rem;
		line-height: 1.1;
	}

	.divider {
		width: 48px;
		height: 1px;
		background: rgba(232, 160, 48, 0.4);
		margin: 1.75rem 0;
	}

	.lead {
		font-family: var(--font-display);
		font-style: italic;
		font-size: 1.15rem;
		color: rgba(240, 220, 180, 0.8);
		line-height: 1.75;
		margin-bottom: 1.5rem;
	}

	p {
		font-size: 0.95rem;
		line-height: 1.85;
		color: rgba(220, 200, 170, 0.65);
		margin-bottom: 1.25rem;
	}
</style>
