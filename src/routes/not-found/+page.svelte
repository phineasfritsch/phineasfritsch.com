<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { emailLink } from '$lib/data/contact';
	// This page exists to be copied to build/404.html by ops/postbuild.mjs, which
	// is what Cloudflare Pages serves — with a real 404 status — for a path that
	// matches nothing. Before it existed the adapter's 200.html fallback answered
	// every unknown path with HTTP 200 and the homepage body, so a mistyped link
	// looked like a working page and search engines indexed the index six times.
	// It is a normal prerendered route, so it reads without JavaScript like the rest.
</script>

<Seo
	title="Not found — Phineas Fritsch"
	description="That page does not exist. The site index is one link away."
	path="/not-found/"
	noindex
/>

<section class="section" style="margin-top:2.5rem">
	<h1 style="font-size:clamp(1.6rem,3.6vw,2.2rem);letter-spacing:-0.02em;font-weight:600">
		That page does not exist
	</h1>
	<div class="prose" style="margin-top:0.9rem">
		<p>
			Either the link was mistyped or something here moved and I did not redirect it. The second one
			is my fault; {@html emailLink('tell me')} and I will fix it.
		</p>
	</div>
</section>

<section class="section">
	<div class="section-head"><h2>Everything on this site</h2></div>
	<ol class="rows">
		{#each [{ href: '/', t: 'Index', d: 'Who I am, and what is running right now.' }, { href: '/work/', t: 'Work', d: 'Every project, with the decision behind it and what it does not do.' }, { href: '/answers/', t: 'Questions', d: 'The questions people ask, phrased the way they ask them.' }, { href: '/resume/', t: 'Resume', d: 'The whole thing, as a page.' }, { href: '/blog/', t: 'Writing', d: 'Occasional notes.' }] as l, i (l.href)}
			<li class="row">
				<span class="row-n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
				<div>
					<div class="row-title"><h3><a href={l.href}>{l.t}</a></h3></div>
					<p>{l.d}</p>
				</div>
			</li>
		{/each}
	</ol>
</section>
