// Shared helpers for the gate, the pin guard, and the sanity check.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

export const REPO = new URL('..', import.meta.url).pathname.replace(/\/$/, '');

/**
 * Walk a directory, returning absolute paths of files matching `exts`.
 * @param {string} dir
 * @param {string[]} exts
 * @param {string[]} [acc]
 * @returns {string[]}
 */
export function walk(dir, exts, acc = []) {
	let entries;
	try {
		entries = readdirSync(dir);
	} catch {
		return acc;
	}
	for (const e of entries) {
		if (e === 'node_modules' || e === '.git' || e === '.svelte-kit' || e === 'build') continue;
		const p = join(dir, e);
		if (statSync(p).isDirectory()) walk(p, exts, acc);
		else if (exts.includes(extname(p))) acc.push(p);
	}
	return acc;
}

/**
 * Remove comments before searching source for a pinned claim.
 *
 * Without this, a deleted sentence quoted in the comment that explains its
 * deletion satisfies the very test protecting it. Observed elsewhere seven
 * times in one day; it is the single cheapest way for a guard to lie.
 *
 * @param {string} src
 * @returns {string}
 */
export function stripComments(src) {
	return (
		src
			// <!-- html / svelte markup comments -->
			.replace(/<!--[\s\S]*?-->/g, ' ')
			// {/* svelte expression comments */}
			.replace(/\{\s*\/\*[\s\S]*?\*\/\s*\}/g, ' ')
			// /* block */
			.replace(/\/\*[\s\S]*?\*\//g, ' ')
			// // line — but not the // in a URL scheme
			.replace(/(^|[^:"'`\w])\/\/[^\n]*/g, '$1 ')
	);
}

/**
 * Collapse whitespace and normalise quotes/dashes so a reflow does not fail a pin.
 * @param {string} s
 * @returns {string}
 */
export function normalise(s) {
	return s
		.replace(/[‘’]/g, "'")
		.replace(/[“”]/g, '"')
		.replace(/[–—]/g, '-')
		.replace(/&nbsp;/g, ' ')
		.replace(/\s+/g, ' ')
		.trim()
		.toLowerCase();
}

/** All searchable app source, comments stripped, as one normalised haystack. */
export function sourceHaystack() {
	const files = walk(join(REPO, 'src'), ['.svelte', '.ts', '.js', '.md', '.svx', '.html']);
	return normalise(files.map((f) => stripComments(readFileSync(f, 'utf8'))).join('\n'));
}

/** All built HTML, as one normalised haystack. Empty array if the site is not built. */
export function builtHtmlFiles() {
	return walk(join(REPO, 'build'), ['.html']);
}

export function builtHaystack() {
	const files = builtHtmlFiles();
	return normalise(files.map((f) => readFileSync(f, 'utf8')).join('\n'));
}
