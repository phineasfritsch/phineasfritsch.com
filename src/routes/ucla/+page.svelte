<svelte:head>
	<title>UCLA — Phineas Fritsch</title>
</svelte:head>

<div class="page-wrapper">
	<div class="content">
		<span class="tag">University of California, Los Angeles</span>
		<h1>Go Bruins.</h1>
		<div class="divider"></div>
		<p class="lead">
			Four years in Westwood. Sun, ambition, and a campus that never let you get too comfortable
			staying still.
		</p>
		<div class="details">
			<div class="detail-item">
				<span class="detail-label">Major</span>
				<span class="detail-value">[Your Major]</span>
			</div>
			<div class="detail-item">
				<span class="detail-label">Class of</span>
				<span class="detail-value">[Year]</span>
			</div>
			<div class="detail-item">
				<span class="detail-label">Involvement</span>
				<span class="detail-value">[Clubs, orgs, teams]</span>
			</div>
		</div>
		<p>
			[Write about your UCLA experience here — what you studied, what you learned outside the
			classroom, moments that defined those years.]
		</p>
	</div>
</div>

<style>
	.page-wrapper {
		min-height: 100vh;
		background: linear-gradient(180deg, #03050e 0%, #060b1c 55%, #09121f 100%);
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
		color: #2774ae;
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
		background: rgba(39, 116, 174, 0.5);
		margin: 1.75rem 0;
	}

	.lead {
		font-family: var(--font-display);
		font-style: italic;
		font-size: 1.15rem;
		color: rgba(240, 220, 180, 0.8);
		line-height: 1.75;
		margin-bottom: 2rem;
	}

	.details {
		display: grid;
		gap: 0.9rem;
		margin-bottom: 2rem;
		border-left: 1px solid rgba(39, 116, 174, 0.25);
		padding-left: 1.25rem;
	}

	.detail-item {
		display: flex;
		gap: 1rem;
		align-items: baseline;
	}

	.detail-label {
		font-size: 0.7rem;
		letter-spacing: 0.18em;
		text-transform: uppercase;
		color: rgba(39, 116, 174, 0.7);
		min-width: 80px;
	}

	.detail-value {
		font-size: 0.95rem;
		color: rgba(240, 220, 180, 0.75);
	}

	p {
		font-size: 0.95rem;
		line-height: 1.85;
		color: rgba(220, 200, 170, 0.65);
		margin-bottom: 1.25rem;
	}
</style>
