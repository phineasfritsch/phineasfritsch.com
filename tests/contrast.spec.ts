import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

/**
 * Colour contrast, measured rather than eyeballed.
 *
 * An accessibility reviewer found --ink-faint at 4.20:1 on --paper and 3.85:1 on
 * --paper-sunk, under the 4.5:1 WCAG 2.1 AA requires for text below 18.66px —
 * and that token colours every timestamp, stack line and note on the site. It
 * had looked fine to everyone who had looked at it, which is the whole reason
 * this is arithmetic in a test rather than a judgement in a review.
 */
const css = readFileSync(new URL('../src/routes/layout.css', import.meta.url), 'utf8');

function token(name: string, scope: 'light' | 'dark'): string {
	// The dark values live in the prefers-color-scheme block, which is the second
	// half of the file; the light ones are on bare :root above it.
	const darkAt = css.indexOf('prefers-color-scheme: dark');
	const region = scope === 'light' ? css.slice(0, darkAt) : css.slice(darkAt);
	const m = region.match(new RegExp(`--${name}:\\s*(#[0-9a-fA-F]{6})`));
	if (!m) throw new Error(`token --${name} not found in the ${scope} palette`);
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

describe('text contrast meets WCAG 2.1 AA', () => {
	for (const scope of ['light', 'dark'] as const) {
		for (const ink of ['ink', 'ink-soft', 'ink-faint']) {
			for (const paper of ['paper', 'paper-sunk']) {
				it(`${scope}: --${ink} on --${paper}`, () => {
					const r = ratio(token(ink, scope), token(paper, scope));
					expect(
						Number(r.toFixed(2)),
						`--${ink} on --${paper} in the ${scope} palette`
					).toBeGreaterThanOrEqual(4.5);
				});
			}
		}
	}
});
