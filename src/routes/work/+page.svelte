<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { orderedProjects } from '$lib/data/projects';
	import { projectCount, servingCount, spell } from '$lib/data/counts';
</script>

<Seo
	title="Work — Phineas Fritsch"
	description="{spell(projectCount)[0].toUpperCase() +
		spell(projectCount).slice(
			1
		)} projects, each with the decision worth asking about, what it does not do, and what an AI wrote. {spell(
		servingCount
	)[0].toUpperCase() + spell(servingCount).slice(1)} are serving traffic."
	path="/work/"
/>

<section class="section" style="margin-top:2.5rem">
	<h1 style="font-size:clamp(1.6rem,3.6vw,2.2rem);letter-spacing:-0.02em;font-weight:600">Work</h1>
	<div class="prose" style="margin-top:0.9rem">
		<p>
			Each has a page naming the decision behind it, what it refuses to do, and what an AI wrote.
			Source is linked where it is public.
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
						<span class="stack"
							>{p.year} · {p.stack.join(' · ')}{p.assisted ? ' · AI-assisted' : ''}</span
						>
					</div>
					<p>{p.what}</p>
				</div>
			</li>
		{/each}
	</ol>
</section>
