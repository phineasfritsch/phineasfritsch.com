<script lang="ts">
	import './layout.css';
	import { onNavigate } from '$app/navigation';
	import { page } from '$app/state';

	let { children } = $props();

	const isHome = $derived(page.url.pathname === '/' || page.url.pathname === '');

	onNavigate((navigation) => {
		if (!document.startViewTransition) return;
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

{#if !isHome}
	<header class="inner-header">
		<a href="/" class="back-link">← Phineas Fritsch</a>
	</header>
{/if}

{@render children()}
