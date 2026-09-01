<script lang="ts">
	import { emailLink } from '$lib/data/contact';
	import { runningCount, spell } from '$lib/data/counts';
	import Seo from '$lib/components/Seo.svelte';
	// Direction chosen by the panel bracket, unanimous, no vetoes: replace topics with
	// QUESTIONS, phrased the way the person asking would phrase them, each answered in
	// his own voice and capped short.
	//
	// The load-bearing part is PROPORTION. "How much of this did you write?" is question
	// five of twelve, at the same size as every other question, answered straight, and
	// then the page moves on. It is neither elevated into a confession nor buried in a
	// footer, and that structure is what makes evasion visible. Do not move it, do not
	// give it its own page, and do not make it larger or smaller than its neighbours.
	const qs = [
		{
			q: 'What are you studying?',
			a: `Financial actuarial mathematics at UCLA, graduating June 2027. I am enrolled in the actuarial models sequence, 178A and 179, for the quarter starting 24 September, and I sit Exam FM this fall. Most of what is on the rest of this page happened outside class.`
		},
		{
			q: 'Have you passed any actuarial exams?',
			a: `No. None. FM is in fall 2026, and until I pass it that is a plan and not a qualification. The coursework behind it is real: 174E, Mathematics of Finance, which is FM material, and the models sequence I am enrolled in for this fall.`
		},
		{
			q: 'What do you want to do?',
			a: `Product, actuarial work, or revenue cycle management, which is the finance side of healthcare. What the three have in common is the part I like, which is working out what a number should be and then being the one who answers for it when somebody checks.`
		},
		{
			q: 'What have you built?',
			a: `${spell(runningCount)[0].toUpperCase() + spell(runningCount).slice(1)} things that are running. Course ranking and seat alerts for UCLA students, a call-number-to-shelf finder for the library I work in, a phone version of my unit's staff schedule, a blackjack practice app, a group film picker for my own media server, and a replacement site for my fraternity chapter. That last one runs but the chapter domain still points at the old WordPress.`
		},
		// Position 5 of 14, in the middle third. Pinned in ops/pins.json and checked by a
		// browser test. Elevated it reads as a confession, buried it reads as evasion.
		// Do not move it.
		{
			q: 'How much of this did you write?',
			a: `Most of the code was written by an AI, and I would say the same in a room. What is mine is the deciding: what to build, what it has to refuse to do, and the design calls I can defend. Why Postgres runs sixty connections and not thirty. Why call numbers sort as decimals. Why a blackjack app is not allowed to mention money, including on its own paywall.`
		},
		{
			q: 'You have no healthcare experience. Why revenue cycle?',
			a: `Because the part of it I have seen up close is the part I am already good at. Most of the work is getting messy institutional data into a state you can defend, and knowing that a number being wrong is usually a process being wrong. The closest I have been is five months of front-office work at a dental practice in 2023, on Dentrix, which is practice management and billing software: patient data entry and financial record accuracy, not claims and not coding. I have not worked a claim, I have not touched a hospital EHR, and I would be starting close to zero on the domain. The transferable half is real and the healthcare half is barely there.`
		},
		{
			q: 'Does anyone use any of this besides you?',
			a: `Some of it. My unit's daily schedule used to arrive as an Excel file every morning, so I put it on a phone screen, and people at my desk open mine now instead of the file. Nobody assigned it and nobody had to be talked into it.`
		},
		{
			q: 'Why did you build them?',
			a: `To be lazy. Nobody assigned any of this. The schedule came as a daily spreadsheet and I wanted to stop opening it. The library retired LibMaps and I got tired of hunting for a shelf. The habit predates the code by a few years: I have run a media server since freshman year, badly in a dorm at first, and none of that part was AI-assisted.`
		},
		{
			q: 'What is the hardest decision you have made in one of these?',
			a: `Sizing Dibs. It runs on one small server and the obvious number for Postgres is thirty connections. Thirty breaks, and it breaks only while you are deploying: Rails multi-database means one thread can hold four at once, and a deploy runs the old and new containers together, so you cross the limit at the moment you ship and the site goes down rather than the jobs. It is set to sixty, and the reasoning is in the config.`
		},
		{
			q: 'Why should an actuarial employer care that you write software?',
			a: `Because most of the work is getting messy data into a state you can defend. Dibs is built on UCLA grade records released under the California Public Records Act — requests organized and paid for by uclagrades.com and forty-odd students, not by me, which Dibs says on its own About page. What I did was take the four responses, 176,290 rows in inconsistent shapes, and get them into a state you could defend. There was an instructor fan-out in them that would have overstated the grade count by about eighty thousand. Finding that was most of the job; the app was the easy part.`
		},
		{
			q: 'Why should a product team care that you are an actuarial major?',
			a: `Because I can say how confident I am in a number and where it stops holding, and a lot of a roadmap is that. The other half is that what I do all day already resembles the job. I decide what gets built, split it across several agents at once, review what comes back, and reject the parts that are wrong.`
		},
		{
			q: 'What have you built that did not work?',
			a: `A React portfolio in 2025 that is forty-one lines long, has stock clipart in it, and sits in a repository whose name I misspelled. An empty repository called prdfg. A first version of this site that was a 3D planet weighing 903KB, and once it finally painted it said thirty-seven characters. They are all still up.`
		},
		{
			q: 'How do you know when the AI is wrong?',
			a: `I assume it is, and I build the thing that can contradict it before I build volume. Agents report success on broken work confidently and in detail, which is the normal case and not the exception. So this site runs a gate before it deploys, pins the sentences that matter so a later rewrite cannot quietly delete them, and reads production back afterwards to check what is live. The status figures on the front page are measurements.`
		},
		{
			q: 'How do I get in touch?',
			a: `${emailLink()}. If you want to check something on this page before you write, the source for the site is <a href="https://github.com/phineasfritsch/phineasfritsch.com/tree/claude/operator-manual-agent-systems-tmrdiz">on the working branch</a> — the gate, the pinned sentences and the tests are there rather than on main, which is still the framework scaffold.`
		}
	];
</script>

<Seo
	title="Questions — Phineas Fritsch"
	description="The questions people ask me, in their words, answered straight: what I study, what I have built, who uses it, and how much of the code an AI wrote."
	path="/answers/"
/>

<section class="section" style="margin-top:2.5rem">
	<h1 style="font-size:clamp(1.6rem,3.6vw,2.2rem);letter-spacing:-0.02em;font-weight:600">
		Questions
	</h1>
	<div class="prose" style="margin-top:0.9rem">
		<p>These are the questions people ask, phrased the way they ask them.</p>
	</div>
</section>

<section class="section">
	<ol class="rows">
		{#each qs as item, i (item.q)}
			<li class="row">
				<span class="row-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
				<div>
					<div class="row-title">
						<h2 style="font-size:1.05rem;font-weight:600;letter-spacing:-0.01em">{item.q}</h2>
					</div>
					<!-- @html only so the Cloudflare opt-out markers in the contact answer
					     survive into the prerendered HTML. Every string here is authored in
					     this file; none of it comes from a user, a fetch or a parameter. -->
					<p>{@html item.a}</p>
				</div>
			</li>
		{/each}
	</ol>
</section>
