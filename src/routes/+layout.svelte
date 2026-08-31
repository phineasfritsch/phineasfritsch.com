<script lang="ts">
	import './layout.css';
	import { page } from '$app/state';

	let { children } = $props();

	const nav = [
		{ href: '/', label: 'index' },
		{ href: '/work/', label: 'work' },
		{ href: '/answers/', label: 'questions' },
		{ href: '/resume/', label: 'resume' },
		{ href: '/blog/', label: 'writing' }
	];

	const here = $derived(page.url.pathname);
	const isCurrent = (href: string) => (href === '/' ? here === '/' : here.startsWith(href));
</script>

<!-- G-a11y: the skip link is the first focusable element on every page and is
     pinned in ops/pins.json. Without it a keyboard visitor walks the masthead
     on every navigation. -->
<a class="skip-link" href="#main">Skip to content</a>

<div class="sheet">
	<header class="masthead">
		<a class="wordmark" href="/">PHINEAS FRITSCH</a>
		<nav aria-label="Primary">
			{#each nav as item (item.href)}
				<a href={item.href} aria-current={isCurrent(item.href) ? 'page' : undefined}>{item.label}</a
				>
			{/each}
		</nav>
	</header>

	<main id="main">
		{@render children()}
	</main>

	<footer class="foot">
		<span>Phineas Fritsch · Los Angeles</span>
		<span><a href="mailto:contact@phineasfritsch.com">contact@phineasfritsch.com</a></span>
		<span><a href="https://github.com/phineasfritsch">github.com/phineasfritsch</a></span>
	</footer>
</div>
