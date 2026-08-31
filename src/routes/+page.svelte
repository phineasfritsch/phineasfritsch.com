<script lang="ts">
	import { orderedProjects } from '$lib/data/projects';
	import status from '$lib/data/status.json';

	// Measured at build time by ops/probe-live.mjs, not now. The page says so
	// explicitly below: a green dot that implied live monitoring would be a lie
	// told in CSS, and this whole site is an argument that the numbers are real.
	const checked = new Date(status.checkedAt);
	const checkedLabel = checked.toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
	const st = (slug: string) =>
		(status.results as Record<string, { status: string; ms: number | null }>)[slug];
</script>

<svelte:head>
	<title>Phineas Fritsch — actuarial mathematics at UCLA, and things that are running</title>
	<meta
		name="description"
		content="Financial actuarial mathematics senior at UCLA. I build tools for problems I have: course grade data, library shelf routing, staff schedules — and three of them are serving traffic right now."
	/>
</svelte:head>

<section class="section" style="margin-top:2.5rem">
	<h1
		style="font-size:clamp(1.75rem,4.2vw,2.6rem);line-height:1.15;letter-spacing:-0.022em;font-weight:600;max-width:22ch"
	>
		I build tools for problems I actually have.
	</h1>
	<div class="prose" style="margin-top:1.1rem">
		<p>
			Financial actuarial mathematics at UCLA, graduating June 2027. Sitting Exam FM this fall. <strong
				>No exams passed yet</strong
			>. Most of what is below came out of a job, a fraternity house, or a course I was annoyed by.
		</p>
		<p>
			Every project on this page names what it does not do, and says what an AI wrote. Both of those
			are there so that the rest is worth believing.
		</p>
	</div>
</section>

<section class="section">
	<div class="section-head">
		<h2>Running now</h2>
		<span class="note">checked {checkedLabel}<br />when this page was built</span>
	</div>
	<ol class="rows">
		{#each orderedProjects as p, i (p.slug)}
			<li class="row">
				<span class="row-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
				<div>
					<div class="row-title">
						<h3><a href="/work/{p.slug}/">{p.name}</a></h3>
						{#if p.live && st(p.slug)}
							<span class="status {st(p.slug).status}">
								{st(p.slug).status === 'up' ? `up · ${st(p.slug).ms}ms` : st(p.slug).status}
							</span>
						{:else}
							<span class="status unknown">source only</span>
						{/if}
						<!-- The disclosure is a FIELD here, sitting among the other ingredients,
						     never a badge and never an apology. A reader takes it in with the
						     stack rather than as a separate admission. -->
						<span class="stack">{p.stack.join(' · ')}{p.assisted ? ' · AI-assisted' : ''}</span>
					</div>
					<p>{p.what}</p>
					<dl class="meta">
						<dt>Limit</dt>
						<dd>{p.limit}</dd>
						{#if p.url}
							<dt>Live</dt>
							<dd><a href={p.url}>{p.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a></dd>
						{/if}
						{#if p.repo}
							<dt>Source</dt>
							<dd><a href={p.repo}>{p.repo.replace('https://github.com/', 'github.com/')}</a></dd>
						{/if}
					</dl>
				</div>
			</li>
		{/each}
	</ol>
</section>

<section class="section">
	<div class="section-head">
		<h2>How this was built</h2>
	</div>
	<div class="prose">
		<p>
			<strong>An AI wrote most of the code in every project on this page.</strong> I am not an engineer
			by training. I am an actuarial mathematics student who wanted these things to exist, and what I
			do looks much more like running a product team than writing software: I decide what gets built,
			split the work across several agents at once, review what comes back, reject the parts that are
			wrong, and own whether the thing works when a real person opens it.
		</p>
		<p>
			That last part is the whole job. Agents report success on broken work, confidently, with a
			detailed account of what they checked. So the useful skill is not prompting, it is building
			the thing that can contradict them and then actually reading the result. This site runs a gate
			before it deploys, pins the sentences that matter so a later rewrite cannot quietly delete
			them, and reads production back after shipping to confirm what is live. The status figures
			above were measured rather than asserted.
		</p>
		<p>
			The decisions worth asking me about are on each project's page: why Dibs runs Postgres at
			sixty connections and not thirty, why call numbers sort as decimals, why a weather condition
			gets three values instead of two, why a blackjack app is forbidden from mentioning money.
			Those are mine. The typing largely was not, and pretending otherwise would be the one thing
			here you could catch me on.
		</p>
	</div>
</section>

<section class="section">
	<div class="section-head">
		<h2>Elsewhere</h2>
	</div>
	<ul class="rows">
		<li class="row">
			<span class="row-n" aria-hidden="true">01</span>
			<div>
				<div class="row-title"><h3>UCLA Sailing Team</h3></div>
				<p>
					Treasurer 2024–25, then Team Captain 2025–26. Ran the exec board, and moved a team to
					regattas every other week on a budget that did not stretch.
				</p>
			</div>
		</li>
		<li class="row">
			<span class="row-n" aria-hidden="true">02</span>
			<div>
				<div class="row-title"><h3>Theta Chi, Beta Alpha Chapter</h3></div>
				<p>
					House Manager 2025–26, then Network Manager since 2026. Ran a $10,000 annual operating
					budget and directed a summer of renovations (plumbing, structural repairs, a new game
					room) then used them in recruitment for the second-largest pledge class in chapter
					history.
				</p>
			</div>
		</li>
		<li class="row">
			<span class="row-n" aria-hidden="true">03</span>
			<div>
				<div class="row-title"><h3>Actuarial Case Competition (BAS)</h3></div>
				<p>
					Winter 2025. Priced three commercial property insurance structures for a simulated Fortune
					500 client, then ran 10,000-iteration Monte Carlo simulations against Lognormal, Gamma and
					Pareto fits to compare Risk-Adjusted TCOR across retentions and aggregate limits.
				</p>
			</div>
		</li>
	</ul>
</section>
