<script lang="ts">
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
			a: `Financial actuarial mathematics at UCLA, with an accounting minor. I graduate in June 2027. Right now I am in the actuarial models sequence, and I take Exam FM this fall.`
		},
		{
			q: 'Have you passed any actuarial exams?',
			a: `No. Not one, yet. FM is booked for this fall and the coursework behind it — Mathematics of Finance, and the models sequence I am in now — is the real preparation. I would rather you hear that from me than find it out in the interview.`
		},
		{
			q: 'What do you want to do?',
			a: `Product, or actuarial work, and I am genuinely still deciding. The thing both have in common is the part I like: work out what the answer should be, then be responsible for whether it holds up. I would rather join a team where shipping something and being wrong about it in public is normal.`
		},
		{
			q: 'What have you built?',
			a: `Four things that are running right now. A course-ranking and seat-alert service for UCLA students, a call-number-to-shelf finder for the library I work in, a phone version of my unit's staff schedule, and a blackjack practice app. There are a few more that only exist as source.`
		},
		{
			q: 'How much of this did you write?',
			a: `Most of the code was written by an AI, and I would say the same thing in a room. What is mine is the deciding: what to build, what it must refuse to do, and every design call I can defend — why Postgres runs sixty connections and not thirty, why call numbers sort as decimals, why a blackjack app is forbidden from mentioning money. The commit history is public and it will back this up rather than contradict it.`
		},
		{
			q: 'Does anyone actually use any of it?',
			a: `Some of it, yes. At the library, getting the Collab Hub briefing meant signing into an admin portal, which meant messaging a supervisor on Slack for a two-factor code, every time. People in my unit now use my version instead. That one I care about more than the rest, because I did not have to convince anyone — it was just less annoying.`
		},
		{
			q: 'Why did you build them?',
			a: `To be lazy, honestly. Nobody assigned any of this. The schedule came as a daily Excel file and I wanted to stop opening it. The library retired LibMaps and I got tired of hunting for a shelf. Every one of them started as a thing I did not want to keep doing.`
		},
		{
			q: 'What is the hardest decision you have made in one of these?',
			a: `Sizing Dibs. It runs on one small server, so Postgres is set to sixty connections rather than the obvious thirty — Rails multi-database means a single thread holds four at once, and a deploy overlaps the old and new containers, so thirty gets breached exactly when you are deploying and the symptom is the website failing rather than the jobs. That is written into the config so the next person does not lose a night to it.`
		},
		{
			q: 'Why should an actuarial employer care that you write software?',
			a: `Because most of the work is getting messy data into a state you can defend. For Dibs I filed four public-records requests, got back 176,290 rows across four inconsistent formats, and found an instructor fan-out that would have inflated the total by about eighty thousand grades if nobody had checked. That is the same job, in a different building.`
		},
		{
			q: 'Why should a product team care that you are an actuarial major?',
			a: `Because I am comfortable saying how confident I am, and where the estimate breaks. Also because what I do all day already looks like the job: I decide what gets built, split the work across several agents, review what comes back, and reject the parts that are wrong.`
		},
		{
			q: 'What have you built that did not work?',
			a: `A React portfolio in 2025 that is 41 lines long and has stock clipart in it, in a repository whose name I misspelled. An empty repository called prdfg. A first version of this site that was a 3D planet weighing 903KB and saying thirty-seven characters. They are all still up. Deleting the misses would make the hits harder to believe.`
		},
		{
			q: 'How do you know when the AI is wrong?',
			a: `Because I assume it is, and I build the thing that can contradict it before I build volume. Agents report success on broken work confidently and in detail, and that is the normal case rather than the exception. So this site runs a gate before it deploys, pins the sentences that matter so a later rewrite cannot quietly delete them, and reads production back afterwards to check what is live. The status numbers on the front page were measured rather than asserted.`
		},
		{
			q: 'How do I get in touch?',
			a: `contact@phineasfritsch.com. I answer.`
		}
	];
</script>

<svelte:head>
	<title>Questions — Phineas Fritsch</title>
	<meta
		name="description"
		content="The questions people ask me, in their words, answered straight: what I study, what I have built, who uses it, and how much of the code an AI wrote."
	/>
</svelte:head>

<section class="section" style="margin-top:2.5rem">
	<h1 style="font-size:clamp(1.6rem,3.6vw,2.2rem);letter-spacing:-0.02em;font-weight:600">
		Questions
	</h1>
	<div class="prose" style="margin-top:0.9rem">
		<p>
			These are the questions people ask, phrased the way they ask them. The awkward one is in here
			in its normal place, not at the bottom.
		</p>
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
					<p>{item.a}</p>
				</div>
			</li>
		{/each}
	</ol>
</section>
