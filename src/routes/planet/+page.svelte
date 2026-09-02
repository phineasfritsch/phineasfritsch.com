<script lang="ts">
	import Seo from '$lib/components/Seo.svelte';
	import { browser } from '$app/environment';
	import Scene from '$lib/components/Scene.svelte';

	// The 3D scene used to be the homepage. It cost 903KB of JavaScript and 21.5
	// seconds to deliver 37 characters of rendered text, and only 53 characters of
	// prerendered HTML, so a crawler saw a title and a skip link — so every crawler and every link preview saw nothing.
	//
	// It is kept, on its own route, because it is a real thing that was built and
	// it is nobody's toll gate now. Nothing on the critical path loads it.
	let show = $state(false);
</script>

<Seo
	title="The planet — Phineas Fritsch"
	description="A low-poly planet built with Threlte and three.js. It used to be the homepage; it cost 903KB to say almost nothing, so it lives here instead."
	path="/planet/"
/>

<section class="section" style="margin-top:2.5rem">
	<h1 style="font-size:clamp(1.6rem,3.6vw,2.2rem);letter-spacing:-0.02em;font-weight:600">
		The planet
	</h1>
	<div class="prose" style="margin-top:0.9rem">
		<p>
			This was the homepage. It is a low-poly world built with three.js and Threlte, and I liked it
			enough to keep it.
		</p>
		<p>
			It was also <strong>903KB of JavaScript that took 21.5 seconds</strong> to render thirty-seven characters
			of text, and with JavaScript switched off the page carried 53 characters: a title and a skip link.
			Search engines, screen readers and link previews got nothing that said who I was. That is a bad
			trade for a front door. It is a fine trade for a page you chose to open.
		</p>
	</div>
	<p style="margin-top:1.2rem">
		<!-- The border was --rule-strong, which is 2.07:1 on --paper: the fill is
		     --paper-sunk, 1.06:1 against the page, so the outline was the button's
		     only boundary and it did not meet the 3:1 WCAG 2.1 asks of a control's
		     shape. --ink-soft is 8.6:1.

		     It also used to go `disabled` on click while its label changed. A
		     disabled control drops out of the accessibility tree, so a screen
		     reader user lost focus and heard nothing about what they had just
		     started. It stays focusable now, says it is busy, and the status line
		     below announces the change politely. -->
		<button
			type="button"
			onclick={() => (show = true)}
			aria-busy={show}
			style="font-family:var(--font-mono);font-size:0.8rem;padding:0.55rem 1rem;border:1px solid var(--ink-soft);background:var(--paper-sunk);color:var(--ink);cursor:pointer;border-radius:2px"
		>
			Load the scene (903KB)
		</button>
		<span role="status" aria-live="polite" class="stack" style="margin-left:0.6rem">
			{show ? 'loading the scene…' : ''}
		</span>
	</p>
</section>

{#if show && browser}
	<div
		style="margin-top:1.5rem;height:min(70vh,620px);border:1px solid var(--rule-strong);background:#020309"
	>
		<Scene />
	</div>
{/if}
