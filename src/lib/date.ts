/**
 * Render a post date for a reader.
 *
 * The frontmatter value is an ISO instant and both blog templates used to
 * interpolate it raw, so the site published `2026-08-31T00:00:00.000Z` under
 * the headline of an essay about noticing when generated output is wrong.
 *
 * `timeZone: 'UTC'` is load-bearing, not decoration. The dates are midnight
 * UTC, so formatting them in the build machine's zone renders the previous day
 * on any host west of Greenwich — and a confidently wrong date is worse than an
 * obviously unformatted one. Pages here are prerendered, so the zone that would
 * apply is whichever machine happened to run the build.
 */
export function postDate(iso: string): string {
	const d = new Date(iso);
	if (Number.isNaN(d.getTime())) return iso;
	return d.toLocaleDateString('en-GB', {
		day: 'numeric',
		month: 'long',
		year: 'numeric',
		timeZone: 'UTC'
	});
}
