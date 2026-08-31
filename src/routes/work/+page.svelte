<script lang="ts">
	import { orderedProjects } from '$lib/data/projects';
</script>

<svelte:head>
	<title>Work — Phineas Fritsch</title>
	<meta
		name="description"
		content="Six projects, each with the decision worth asking about, what it does not do, and what an AI wrote. Three are serving traffic."
	/>
</svelte:head>

<section class="section" style="margin-top:2.5rem">
	<h1 style="font-size:clamp(1.6rem,3.6vw,2.2rem);letter-spacing:-0.02em;font-weight:600">Work</h1>
	<div class="prose" style="margin-top:0.9rem">
		<p>
			Each of these has a page naming the one decision worth an interview question, the thing it
			refuses to do, and what an AI wrote. Source is linked where it is public.
		</p>
	</div>
</section>

<section class="section">
	<div class="section-head">
		<h2>Projects</h2>
		<span class="note">{orderedProjects.length} total</span>
	</div>
	<ol class="rows">
		{#each orderedProjects as p, i (p.slug)}
			<li class="row">
				<span class="row-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
				<div>
					<div class="row-title">
						<h3><a href="/work/{p.slug}/">{p.name}</a></h3>
						<span class="stack">{p.year} · {p.stack.join(' · ')}</span>
					</div>
					<p>{p.what}</p>
				</div>
			</li>
		{/each}
	</ol>
</section>
