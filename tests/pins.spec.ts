import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
// @ts-expect-error — plain esm helper, shared with the ops scripts
import { REPO, sourceHaystack, builtHaystack, builtHtmlFiles, normalise } from '../ops/lib.mjs';

const config = JSON.parse(readFileSync(join(REPO, 'ops/pins.json'), 'utf8'));
const active = config.pins.filter((p: any) => p.active);
const pending = config.pins.filter((p: any) => !p.active);

// Search the whole application, not one file. A port legitimately relocates copy
// into a shared component; a check that only reads the original page calls every
// such move a loss and becomes noise inside a day.
const source = sourceHaystack();
const built = builtHtmlFiles().length ? builtHaystack() : '';

describe('pinned claims', () => {
	for (const pin of active) {
		it(`${pin.id} survives in source`, () => {
			const missingAll = (pin.all ?? []).filter((f: string) => !source.includes(normalise(f)));
			expect(missingAll, `missing required fragment(s) for ${pin.id}: ${pin.why}`).toEqual([]);
			if (pin.any?.length) {
				const found = pin.any.some((f: string) => source.includes(normalise(f)));
				expect(found, `no variant of ${pin.id} found anywhere in src/: ${pin.why}`).toBe(true);
			}
		});
	}

	// A pin that only holds in source is a pin that a build step can silently drop.
	for (const pin of active) {
		it.skipIf(!built)(`${pin.id} survives into the built artefact`, () => {
			const missingAll = (pin.all ?? []).filter((f: string) => !built.includes(normalise(f)));
			expect(missingAll, `${pin.id} is in src/ but not in build/`).toEqual([]);
			if (pin.any?.length) {
				expect(pin.any.some((f: string) => built.includes(normalise(f)))).toBe(true);
			}
		});
	}
});

describe('pin hygiene', () => {
	it('every pin states why the property is load-bearing', () => {
		const noWhy = config.pins.filter((p: any) => !p.why || p.why.length < 40).map((p: any) => p.id);
		expect(noWhy, 'a pin without a stated reason gets deleted by whoever it inconveniences').toEqual([]);
	});

	it('no pin asserts a fragment so short it would pass on any page', () => {
		const tooLoose = config.pins
			.flatMap((p: any) => [...(p.all ?? []), ...(p.any ?? [])].map((f: string) => ({ id: p.id, f })))
			.filter(({ f }) => f.trim().length < 3);
		expect(tooLoose, 'never weaken an assertion to something an empty artefact would satisfy').toEqual([]);
	});

	it('reports pending pins so they cannot quietly stay pending forever', () => {
		// Not a failure. Pending pins are the redesign's contract with itself; this
		// test exists so their count is printed on every single run.
		console.log(`      ${active.length} pins enforced, ${pending.length} pending: ${pending.map((p: any) => p.id).join(', ') || 'none'}`);
		expect(pending.length).toBeLessThanOrEqual(12);
	});
});
