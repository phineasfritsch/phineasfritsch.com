<svelte:head>
	<title>The Horizon — Phineas Fritsch</title>
</svelte:head>

<div class="page-wrapper">
	<div class="horizon-glow"></div>
	<div class="content">
		<span class="tag">What's ahead</span>
		<h1>The Horizon.</h1>
		<div class="divider"></div>
		<p class="lead">
			Every sailor knows the horizon keeps moving. That's not a problem — that's the point.
		</p>

		<section class="section">
			<h2>Career</h2>
			<p>
				[What you're looking to do professionally — field, type of work, companies you're interested
				in, the kind of problems you want to solve. Be specific enough to be interesting, open enough
				to invite conversation.]
			</p>
		</section>

		<section class="section">
			<h2>Building</h2>
			<p>
				[Projects you're working on or want to build. Side projects, ideas, things you're learning.
				Show that you create things.]
			</p>
		</section>

		<section class="section">
			<h2>Life</h2>
			<p>
				[Where you want to be — geographically, personally, experientially. What a good life looks
				like to you. Keep it genuine.]
			</p>
		</section>

		<div class="contact">
			<p>Want to talk?</p>
			<a href="mailto:accounts@phineasfritsch.com" class="email-link">
				accounts@phineasfritsch.com
			</a>
		</div>
	</div>
</div>

<style>
	.page-wrapper {
		min-height: 100vh;
		background: linear-gradient(180deg, #030407 0%, #060c1a 40%, #0a1220 100%);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 8rem 2rem 4rem;
		position: relative;
		overflow: hidden;
	}

	.horizon-glow {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		height: 300px;
		background: radial-gradient(ellipse at 50% 100%, rgba(200, 90, 16, 0.18) 0%, transparent 70%);
		pointer-events: none;
		animation: glow-pulse 5s ease-in-out infinite alternate;
	}

	@keyframes glow-pulse {
		from {
			opacity: 0.7;
		}
		to {
			opacity: 1;
		}
	}

	.content {
		max-width: 640px;
		width: 100%;
		position: relative;
		z-index: 1;
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
		margin-bottom: 2.5rem;
	}

	.section {
		margin-bottom: 2.25rem;
	}

	h2 {
		font-family: var(--font-body);
		font-size: 0.72rem;
		letter-spacing: 0.2em;
		text-transform: uppercase;
		color: rgba(232, 160, 48, 0.6);
		margin-bottom: 0.75rem;
	}

	p {
		font-size: 0.95rem;
		line-height: 1.85;
		color: rgba(220, 200, 170, 0.65);
	}

	.contact {
		margin-top: 3rem;
		padding-top: 2rem;
		border-top: 1px solid rgba(232, 160, 48, 0.15);
	}

	.contact p {
		font-size: 0.75rem;
		letter-spacing: 0.15em;
		text-transform: uppercase;
		color: var(--color-text-muted);
		margin-bottom: 0.6rem;
	}

	.email-link {
		font-family: var(--font-body);
		font-size: 0.9rem;
		color: var(--color-sunset-gold);
		opacity: 0.75;
		transition: opacity 0.25s;
	}

	.email-link:hover {
		opacity: 1;
	}
</style>
