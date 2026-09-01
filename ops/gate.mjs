#!/usr/bin/env node
/**
 * The gate. One command, numbered gates, every gate prints a count.
 *
 * Green and red are not enough. The count is the point: a loop, or a person
 * skimming, needs to notice 47 becoming 45. A suite that only ever says "pass"
 * cannot tell you that a refactor quietly deleted six assertions.
 *
 *   node ops/gate.mjs            # all gates
 *   node ops/gate.mjs --fast     # skip the browser gate
 *   node ops/gate.mjs --json
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO, builtHtmlFiles } from './lib.mjs';

const fast = process.argv.includes('--fast');
// Pre-deploy: skip the production check. It asks "is the apex serving THIS build",
// which cannot be true before the build is deployed. Including it made the deploy
// gate unsatisfiable — deploy required a green gate, the gate required a completed
// deploy, and neither could ever happen first.
const preDeploy = process.argv.includes('--pre-deploy');
const asJson = process.argv.includes('--json');
const BASELINE = join(REPO, 'ops/baseline.json');
const FLOORS = join(REPO, 'ops/floors.json');

const run = (cmd, args) => {
	// Always pipe. One test failure once dumped 745KB into a context window;
	// the gate keeps the tail and throws the rest away.
	const r = spawnSync(cmd, args, { cwd: REPO, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
	const out = `${r.stdout || ''}${r.stderr || ''}`;
	return { code: r.status ?? 1, out, tail: out.split('\n').slice(-40).join('\n') };
};

const gates = [];
const gate = (n, name, fn) => gates.push({ n, name, fn });

gate(1, 'format', () => {
	// prettier's success line carries no number at all, so scraping it produced a
	// permanent null and the README's "every gate prints a count" was falsified by
	// a file two directories away. --list-different names every file that would
	// change, which is a count of the thing that matters: 0 is the passing value.
	const r = run('npx', ['prettier', '--check', '.']);
	const listed = run('npx', ['prettier', '--list-different', '.']);
	const n = listed.out.split('\n').filter((l) => l.trim() && !l.startsWith('[')).length;
	return { ...r, count: n, unit: 'files needing format', invert: true };
});

gate(2, 'typecheck', () => {
	const r = run('npm', ['run', '--silent', 'check']);
	// svelte-check ends with `COMPLETED 1433 FILES 0 ERRORS 11 WARNINGS`; the old
	// pattern looked for prose that this version never prints, so the invert guard
	// below was dead code and 11 warnings could have become 200 unnoticed.
	const m =
		r.out.match(/(\d+)\s+ERRORS?\s+(\d+)\s+WARNINGS?/i) ||
		r.out.match(/(\d+) errors? and (\d+) warnings?/);
	return {
		...r,
		count: m ? Number(m[1]) + Number(m[2]) : null,
		unit: 'errors + warnings',
		invert: true
	};
});

gate(3, 'build', () => {
	const r = run('npm', ['run', '--silent', 'build']);
	// The adapter prints `Wrote site to "build"` and no count, so this was null on
	// every run. Count the artefact instead of parsing a message about it.
	const n = r.code === 0 ? builtHtmlFiles().length : null;
	return { ...r, count: n, unit: 'pages' };
});

gate(4, 'tests', () => {
	const r = run('npx', ['vitest', 'run']);
	const m = r.out.match(/Tests\s+(?:(\d+) failed \| )?(\d+) passed/);
	return { ...r, count: m ? Number(m[2]) : null, unit: 'tests passed' };
});

gate(5, 'sanity', () => {
	const r = run(
		'node',
		preDeploy ? [join(REPO, 'ops/sanity.mjs'), '--skip-prod'] : [join(REPO, 'ops/sanity.mjs')]
	);
	// Count the checks that EXIST, not the ones that passed. Pass/fail is already
	// the exit code; what a floor has to protect is a check quietly disappearing,
	// and a floor on the passed count cannot see a failing check being deleted.
	const m = r.out.match(/(\d+)\/(\d+) sanity checks passed/);
	return { ...r, count: m ? Number(m[2]) : null, unit: `checks (${m ? m[1] : '?'} passing)` };
});

if (!fast) {
	gate(6, 'real user (browser)', () => {
		const r = run('npx', ['playwright', 'test', '--reporter=line']);
		const m = r.out.match(/(\d+) passed/);
		return { ...r, count: m ? Number(m[1]) : null, unit: 'browser checks' };
	});
}

const baseline = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')) : {};

// Floors are the half of this that has teeth. Drift only ever PRINTED a falling
// count, and nothing read it: deleting 37 assertions left the gate green and then
// rewrote the baseline down to the new number, so the second run reported no
// drift at all and the deletion was invisible forever. A floor fails the run.
//
// It ratchets up on its own after a fully green run, so the floor is always the
// best number this repo has actually achieved. It never lowers itself. Lowering
// one is an edit to ops/floors.json inside the commit that earns it — which is
// the point: a test deleted on purpose is a line in a diff a human can see, and a
// test deleted by accident is a red gate.
const floors = existsSync(FLOORS) ? JSON.parse(readFileSync(FLOORS, 'utf8')) : {};
const results = [];

for (const g of gates) {
	const r = g.fn();
	// `invert` gates count problems, where lower is better; a floor there would be
	// backwards, and their exit code already fails on the first one.
	// Only a FULL run may be measured against a floor. --fast and --pre-deploy
	// deliberately skip checks, so their counts are legitimately smaller; enforcing
	// there would have made every deploy fail on a floor it was never meant to meet.
	const floor =
		!fast && !preDeploy && !r.invert && typeof floors[g.name] === 'number' ? floors[g.name] : null;
	const belowFloor = floor !== null && r.count !== null && r.count < floor;
	const ok = r.code === 0 && !belowFloor;
	const prev = baseline[g.name]?.count ?? null;
	const drift = prev !== null && r.count !== null && r.count !== prev ? r.count - prev : 0;
	results.push({
		gate: g.n,
		name: g.name,
		ok,
		count: r.count,
		unit: r.unit,
		prev,
		drift,
		floor,
		belowFloor,
		tail: ok
			? null
			: belowFloor && r.code === 0
				? `  ${r.count} ${r.unit}, below the floor of ${floor}.\n` +
					'  Something that used to be checked is not being checked any more.\n' +
					`  If the drop is deliberate, lower "${g.name}" in ops/floors.json in the\n` +
					'  same commit, so the decision is visible in the diff.'
				: r.tail
	});
}

if (asJson) {
	console.log(JSON.stringify({ ok: results.every((r) => r.ok), results }, null, 2));
} else {
	console.log('\n  GATE                        RESULT   COUNT');
	console.log('  ' + '─'.repeat(62));
	for (const r of results) {
		const count = r.count === null ? '—' : `${r.count} ${r.unit}`;
		const drift = r.drift
			? `  ${r.drift > 0 ? '+' : ''}${r.drift} vs last run`
			: r.prev !== null
				? '  ='
				: '';
		console.log(
			`  ${String(r.gate).padStart(2)}. ${r.name.padEnd(24)} ${(r.ok ? 'pass' : 'FAIL').padEnd(8)} ${count}${drift}${r.belowFloor ? `  BELOW FLOOR ${r.floor}` : ''}`
		);
	}
	console.log('  ' + '─'.repeat(62));
	for (const r of results.filter((x) => !x.ok)) {
		console.log(`\n  ── gate ${r.gate} (${r.name}) output, last 40 lines ──`);
		console.log(
			r.tail
				.split('\n')
				.map((l) => '  ' + l)
				.join('\n')
		);
	}
	const passed = results.filter((r) => r.ok).length;
	console.log(`\n  ${passed}/${results.length} gates pass\n`);
}

// Record counts so the next run can report drift. Only ever written on a full run
// that was fully GREEN: a red run used to overwrite the previous counts, which
// destroyed the drift signal at exactly the moment it was worth having.
if (!fast && !preDeploy) {
	// Per GATE, not per run. Requiring a fully green run to record anything
	// deadlocked the moment one check went red for a reason outside this repo —
	// prod.edge-intact waits on a Cloudflare dashboard toggle only the owner can
	// flip — and a floor that can never rise again is a floor that stops
	// protecting anything new. A gate that passed its own command has earned its
	// number; a gate that failed keeps the last number it earned, which is what
	// stops a red run from laundering away the evidence of what it broke.
	const next = { ...baseline };
	const nextFloors = { ...floors };
	let raised = false;
	for (const r of results) {
		if (!r.ok) continue;
		next[r.name] = { count: r.count, at: new Date().toISOString() };
		if (r.floor === null || r.count === null) continue;
		if (r.count > nextFloors[r.name]) {
			nextFloors[r.name] = r.count;
			raised = true;
		}
	}
	writeFileSync(BASELINE, JSON.stringify(next, null, 2) + '\n');
	if (raised) writeFileSync(FLOORS, JSON.stringify(nextFloors, null, 2) + '\n');
}

process.exit(results.every((r) => r.ok) ? 0 : 1);
