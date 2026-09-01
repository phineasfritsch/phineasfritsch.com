import { mdsvex } from 'mdsvex';
import adapter from '@sveltejs/adapter-static';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	compilerOptions: {
		// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
		runes: ({ filename }) => (filename.split(/[/\\]/).includes('node_modules') ? undefined : true)
	},
	// No fallback. `fallback: '200.html'` made Cloudflare Pages answer every
	// unmatched path with HTTP 200 and the homepage body — /work/zzz/, /blog/zzz/
	// and a mistyped share link all looked like real pages. Every route here is
	// prerendered, so no SPA shell is needed; ops/postbuild.mjs writes the
	// prerendered /not-found/ page to build/404.html, which Pages serves with a
	// real 404 status. Dropping the fallback also means an unprerenderable route
	// fails the build instead of silently becoming a client-only page.
	kit: { adapter: adapter() },
	preprocess: [mdsvex({ extensions: ['.svx', '.md'] })],
	extensions: ['.svelte', '.svx', '.md']
};

export default config;
