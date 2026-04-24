<svelte:head>
	<title>Theta Chi — Phineas Fritsch</title>
</svelte:head>

<div class="page-wrapper">
	<div class="content">
		<span class="tag">Theta Chi Fraternity</span>
		<h1>Brotherhood.</h1>
		<div class="divider"></div>
		<p class="lead">
			An assisting hand to a brother in need. Theta Chi shaped how I think about loyalty,
			leadership, and showing up for the people around you.
		</p>
		<p>
			[Write about your Theta Chi experience — your chapter, roles you held, what brotherhood meant
			to you, events, philanthropy, friendships.]
		</p>
		<p>
			[This is a good place to show your leadership and community involvement — qualities that
			matter in professional contexts too.]
		</p>
	</div>
</div>

<style>
	.page-wrapper {
		min-height: 100vh;
		background: linear-gradient(180deg, #080308 0%, #120510 55%, #1a0812 100%);
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
		color: #9b1b30;
		opacity: 0.85;
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
		background: rgba(155, 27, 48, 0.45);
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
