<script lang="ts">
	/**
	 * One head block per page, in one place.
	 *
	 * Every page used to ship TWO <meta name="description"> tags: a generic one in
	 * src/app.html and the page's own. The generic one came first, so a crawler took
	 * the boilerplate — and the three guards meant to protect that tag all read the
	 * first match, which meant they were watching the tag that never changed. An
	 * infra reviewer proved it by stripping the page-specific description from a
	 * built page and watching all three stay green.
	 *
	 * A component the pages call is the structural fix: there is exactly one place
	 * that can emit a description, so there cannot be two. It also carries the Open
	 * Graph tags the site had none of, which is what a LinkedIn or Slack unfurl
	 * reads — and this is a site whose whole distribution channel is someone pasting
	 * the link.
	 */
	let {
		title,
		description,
		path,
		noindex = false
	}: { title: string; description: string; path: string; noindex?: boolean } = $props();

	const SITE = 'https://phineasfritsch.com';
	// $derived, not a plain const. A plain const captures `path` once, and this
	// component is reused across client-side navigations — moving from /work/dibs/
	// to /work/shelfmark/ would have left the canonical and og:url pointing at the
	// previous page. The typecheck drift caught it: 11 warnings became 12.
	const url = $derived(SITE + path);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />
	{#if noindex}<meta name="robots" content="noindex" />{/if}
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Phineas Fritsch" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
</svelte:head>
