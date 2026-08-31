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
import { REPO } from './lib.mjs';

const fast = process.argv.includes('--fast');
// Pre-deploy: skip the production check. It asks "is the apex serving THIS build",
// which cannot be true before the build is deployed. Including it made the deploy
// gate unsatisfiable — deploy required a green gate, the gate required a completed
// deploy, and neither could ever happen first.
const preDeploy = process.argv.includes('--pre-deploy');
const asJson = process.argv.includes('--json');
const BASELINE = join(REPO, 'ops/baseline.json');

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
	const r = run('npx', ['prettier', '--check', '.']);
	const m = r.out.match(/(\d+) files? (?:use|match)/);
	return { ...r, count: m ? Number(m[1]) : null, unit: 'files' };
});

gate(2, 'typecheck', () => {
	const r = run('npm', ['run', '--silent', 'check']);
	const m = r.out.match(/(\d+) errors? and (\d+) warnings?/);
	return { ...r, count: m ? Number(m[1]) : null, unit: 'errors', invert: true };
});

gate(3, 'build', () => {
	const r = run('npm', ['run', '--silent', 'build']);
	const m = r.out.match(/(\d+) html files/) || [];
	return { ...r, count: m[1] ? Number(m[1]) : null, unit: 'pages' };
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
	const m = r.out.match(/(\d+)\/(\d+) sanity checks passed/);
	return { ...r, count: m ? Number(m[1]) : null, unit: `of ${m ? m[2] : '?'} checks` };
});

if (!fast) {
	gate(6, 'real user (browser)', () => {
		const r = run('npx', ['playwright', 'test', '--reporter=line']);
		const m = r.out.match(/(\d+) passed/);
		return { ...r, count: m ? Number(m[1]) : null, unit: 'browser checks' };
	});
}

const baseline = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')) : {};
const results = [];

for (const g of gates) {
	const r = g.fn();
	const ok = r.code === 0;
	const prev = baseline[g.name]?.count ?? null;
	// Drift is the signal the count exists for: a gate can stay green while its
	// number falls, and that is exactly the case nobody notices.
	const drift = prev !== null && r.count !== null && r.count !== prev ? r.count - prev : 0;
	results.push({
		gate: g.n,
		name: g.name,
		ok,
		count: r.count,
		unit: r.unit,
		prev,
		drift,
		tail: ok ? null : r.tail
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
			`  ${String(r.gate).padStart(2)}. ${r.name.padEnd(24)} ${(r.ok ? 'pass' : 'FAIL').padEnd(8)} ${count}${drift}`
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

// Record counts so the next run can report drift. Only ever written on a full run.
if (!fast && !preDeploy) {
	const next = {};
	for (const r of results) next[r.name] = { count: r.count, at: new Date().toISOString() };
	writeFileSync(BASELINE, JSON.stringify(next, null, 2) + '\n');
}

process.exit(results.every((r) => r.ok) ? 0 : 1);
