<script lang="ts">
	import status from '$lib/data/status.json';
	let { data } = $props();
	const p = $derived(data.project);
	const st = $derived(
		(status.results as Record<string, { status: string; ms: number | null }>)[p.slug]
	);
	const checkedLabel =
		new Date(status.checkedAt).toISOString().slice(0, 16).replace('T', ' ') + ' UTC';
</script>

<svelte:head>
	<title>{p.name} — Phineas Fritsch</title>
	<meta name="description" content={p.what} />
</svelte:head>

<section class="section" style="margin-top:2.5rem">
	<p class="stack" style="margin-bottom:0.5rem"><a href="/work/">← work</a></p>
	<h1 style="font-size:clamp(1.7rem,4vw,2.4rem);letter-spacing:-0.02em;font-weight:600">
		{p.name}
	</h1>
	<div class="row-title" style="margin-top:0.6rem">
		{#if p.live && st}
			<span class="status {st.status}">
				{st.status === 'up' ? `up · ${st.ms}ms` : st.status}
			</span>
		{:else}
			<span class="status unknown">source only</span>
		{/if}
		<span class="stack">{p.year} · {p.stack.join(' · ')}</span>
	</div>
	<div class="prose" style="margin-top:1rem">
		<p>{p.what}</p>
	</div>
</section>

<section class="section">
	<div class="section-head"><h2>The decision</h2></div>
	<div class="prose"><p>{p.decision}</p></div>
</section>

<section class="section">
	<div class="section-head"><h2>What it does not do</h2></div>
	<div class="prose"><p>{p.limit}</p></div>
</section>

<!-- G-honesty: this block is pinned in ops/pins.json (honesty.ai-disclosure).
     It is the first thing a later polish pass will want to delete, because it
     reads as self-deprecating ornament. It is the opposite: it is what makes
     every other claim on the page worth reading. Do not move it to a footer. -->
<section class="section">
	<div class="section-head"><h2>What an AI wrote</h2></div>
	<div class="assisted">
		<b>AI-assisted</b>
		{p.assisted}
	</div>
</section>

<section class="section">
	<div class="section-head">
		<h2>Check it yourself</h2>
		{#if p.live}<span class="note">status measured {checkedLabel}</span>{/if}
	</div>
	<dl class="meta">
		{#if p.url}
			<dt>Live</dt>
			<dd><a href={p.url}>{p.url.replace(/^https?:\/\//, '')}</a></dd>
		{/if}
		{#if p.repo}
			<dt>Source</dt>
			<dd><a href={p.repo}>{p.repo.replace('https://github.com/', 'github.com/')}</a></dd>
		{/if}
		<dt>Stack</dt>
		<dd>{p.stack.join(', ')}</dd>
	</dl>
</section>
