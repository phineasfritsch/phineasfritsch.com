import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * Colour contrast, measured rather than eyeballed, over every token the
 * stylesheet actually uses as text.
 *
 * The first version of this file hard-coded three ink tokens, passed, and missed
 * --unknown at 4.20:1 — which an accessibility reviewer then found by walking
 * every leaf text node in a browser. A list of things to check is only as good as
 * whoever remembered to add to it, so the list is derived from the stylesheet:
 * anything used as `color: var(--x)` is text, and text has to meet 4.5:1. A new
 * token added tomorrow is covered without anyone remembering.
 */
const css = readFileSync(new URL('../src/routes/layout.css', import.meta.url), 'utf8');

const DARK_AT = css.indexOf('prefers-color-scheme: dark');

/** Tokens the stylesheet paints text with. */
const textTokens = [...new Set([...css.matchAll(/color:\s*var\((--[\w-]+)\)/g)].map((m) => m[1]))]
	// The masthead bar paints --paper ON --ink, which is the same pair inverted and
	// is covered by testing --ink against --paper.
	.filter((t) => t !== '--paper' && t !== '--paper-sunk');

/** Surfaces text can sit on. */
const surfaces = ['--paper', '--paper-sunk'];

function value(token: string, scope: 'light' | 'dark'): string {
	const region = scope === 'light' ? css.slice(0, DARK_AT) : css.slice(DARK_AT);
	const m = region.match(new RegExp(`${token}:\\s*(#[0-9a-fA-F]{6})`));
	if (!m) throw new Error(`${token} has no hex value in the ${scope} palette`);
	return m[1];
}

const channel = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function luminance(hex: string): number {
	const [r, g, b] = [1, 3, 5].map((i) => channel(parseInt(hex.slice(i, i + 2), 16) / 255));
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function ratio(a: string, b: string): number {
	const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
	return (hi + 0.05) / (lo + 0.05);
}

describe('every text colour meets WCAG 2.1 AA', () => {
	it('finds the text tokens to check', () => {
		// If this drops, the derivation broke and the suite below is testing nothing.
		expect(textTokens.length).toBeGreaterThanOrEqual(6);
	});

	for (const scope of ['light', 'dark'] as const) {
		for (const token of textTokens) {
			for (const surface of surfaces) {
				it(`${scope}: ${token} on ${surface}`, () => {
					const r = ratio(value(token, scope), value(surface, scope));
					expect(Number(r.toFixed(2)), `${token} on ${surface} in ${scope}`).toBeGreaterThanOrEqual(
						4.5
					);
				});
			}
		}
	}
});
