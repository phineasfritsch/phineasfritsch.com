import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO, walk, stripComments } from '../ops/lib.mjs';

/**
 * The voice gate — ruling G29 from the panel's frozen system, implemented as the
 * gate it specifies rather than as a guideline nobody enforces.
 *
 * Every banned string below was quoted by a panellist as something they reacted to
 * on the old site, or is a known tell of generated writing. The point is not that
 * any single word is forbidden English; it is that these are the exact words that
 * appear when nobody has anything specific to say, and a check is the only thing
 * that notices them creeping back one edit at a time.
 */

const CONTENT = walk(join(REPO, 'src'), ['.svelte', '.md', '.ts'])
	.filter((f) => !f.includes('/lib/components/')) // the 3D scene has no prose
	.map((f) => ({ file: f.replace(REPO + '/', ''), text: stripComments(readFileSync(f, 'utf8')) }));

// G29. Quoted from the panel where they quoted the old site.
const BANNED = [
	'passionate',
	'passion for',
	'leverage',
	'thoughtful',
	'intentional',
	'journey',
	'brotherhood',
	'loyalty',
	'horizon',
	'ambition',
	'build something',
	'reach out',
	'dive into',
	'at the end of the day',
	'showing up for',
	'resets everything',
	"that's the point",
	'go bruins',
	'small corner of the internet',
	'think out loud',
	'more to come',
	'humbled',
	'grateful for the opportunity',
	'results-driven',
	'detail-oriented',
	'spearheaded',
	'utilized',
	'seamless',
	'cutting-edge',
	'best-in-class',
	'game-changer',
	'synergy',
	'deep dive',
	'unlock',
	'empower',
	'elevate',
	'curated'
];

// G30. Self-description is the thing that reads as a person describing a person.
const SELF_DESCRIPTION = [
	'i am a builder',
	'aspiring',
	'self-starter',
	'go-getter',
	'problem solver',
	'creative technologist',
	'tech enthusiast'
];

// Hedges that are fine once and read as a verbal tic in quantity.
const CAPPED = { actually: 3, really: 2, honestly: 2, genuinely: 2, simply: 2, just: 8 };

describe('voice gate (G29, G30)', () => {
	for (const phrase of BANNED) {
		it(`never says "${phrase}"`, () => {
			const hits = CONTENT.filter((c) => c.text.toLowerCase().includes(phrase)).map((c) => c.file);
			expect(hits, `"${phrase}" is back`).toEqual([]);
		});
	}

	it('never describes himself with a self-description noun', () => {
		const hits = SELF_DESCRIPTION.flatMap((p) =>
			CONTENT.filter((c) => c.text.toLowerCase().includes(p)).map((c) => `${c.file}: "${p}"`)
		);
		expect(hits).toEqual([]);
	});

	it('does not lean on hedge words', () => {
		const all = CONTENT.map((c) => c.text)
			.join('\n')
			.toLowerCase();
		const over: string[] = [];
		for (const [word, cap] of Object.entries(CAPPED)) {
			const n = (all.match(new RegExp(`\\b${word}\\b`, 'g')) || []).length;
			if (n > cap) over.push(`"${word}" used ${n} times (cap ${cap})`);
		}
		expect(over).toEqual([]);
	});
});

describe('em dashes (G28)', () => {
	// The em-dash clause break is the single most recognisable signature of generated
	// prose, and the panellist who spots these in two seconds named it first. This does
	// not ban the character; it caps the density, because one in a page reads as a
	// person and six reads as a machine.
	// NARROWED, and the property is intact. The first version counted every " — "
	// anywhere, which flagged heading separators: "Resume — Phineas Fritsch",
	// "UCLA Library — Student Assistant II". Those are ordinary typography and are
	// not what the panellist reacted to; what they named was the em dash used as a
	// MID-SENTENCE CLAUSE BREAK, the "...broken work — confidently, with a detailed
	// account..." rhythm. Requiring lowercase on both sides isolates exactly that and
	// leaves headings alone. Verified before changing: the eight clause breaks this
	// still catches are all in running prose.
	it('does not use em dashes as a clause break more than sparingly', () => {
		const counts = CONTENT.map((c) => ({
			file: c.file,
			n: (c.text.match(/[a-z,)]\s—\s[a-z<]/g) || []).length
		}))
			.filter((c) => c.n > 6)
			.map((c) => `${c.file}: ${c.n} em-dash clause breaks`);
		expect(counts, 'em-dash density is a tell; rewrite some as commas or full stops').toEqual([]);
	});

	it('does not end a sentence with the "X, not Y." construction repeatedly', () => {
		const all = CONTENT.map((c) => c.text).join('\n');
		const n = (all.match(/,\s+not\s+[a-z][^.]{0,40}\./g) || []).length;
		expect(
			n,
			`"X, not Y." appears ${n} times; it is a rhythm, and rhythms read as a template`
		).toBeLessThanOrEqual(3);
	});
});
