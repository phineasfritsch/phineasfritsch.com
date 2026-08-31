#!/usr/bin/env node
/**
 * Deploy, and print the version that is now live.
 *
 * Parity is a fact or it is a hope, and a hope gets reported as a fact. This
 * command ends by reading production back and printing the commit it is serving.
 *
 * ORDER IS NOT NEGOTIABLE: push before deploying. Deploying first opens a window
 * where anything reading the repository sees older code and describes it as live.
 *
 *   node ops/deploy.mjs [--dry-run]
 */
import { execFileSync, spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO } from './lib.mjs';

// The Pages project that actually serves this domain. `personalsite` is the one
// holding phineasfritsch.com as a custom domain; there is no `phineasfritsch-com`
// project, and deploying to a name that does not exist would create an orphan that
// no visitor ever reaches. Overridable so a dry run can target a scratch project.
// Both spellings are accepted deliberately: the runbook said CF_PAGES_PROJECT and
// the code said PAGES_PROJECT, and that mismatch only surfaced mid-deploy. Default
// is the project that actually holds the phineasfritsch.com custom domain.
const PROJECT = process.env.PAGES_PROJECT || process.env.CF_PAGES_PROJECT || 'personalsite';

// The pages.dev hostname is NOT always `${PROJECT}.pages.dev`. When the bare
// subdomain is already taken Cloudflare appends a suffix, and this project's is
// `personalsite-ezt`. `personalsite.pages.dev` also answers 200 — with somebody
// else's site — so deriving the host from the project name would read a stranger's
// page, never find our commit, and report a good deploy as a failure.
const PAGES_HOST = process.env.PAGES_HOST || 'personalsite-ezt.pages.dev';

const dry = process.argv.includes('--dry-run');
const sh = (c, a, o = {}) => execFileSync(c, a, { cwd: REPO, encoding: 'utf8', ...o }).trim();
const die = (msg) => {
	console.error(`\n  DEPLOY REFUSED: ${msg}\n`);
	process.exit(1);
};

const sha = sh('git', ['rev-parse', '--short', 'HEAD']);
const branch = sh('git', ['rev-parse', '--abbrev-ref', 'HEAD']);
console.log(`\n  commit ${sha} on ${branch}`);

// 1. The gate, in full. A deploy is the one place where "probably fine" costs
//    something that cannot be taken back.
//
// One check is structurally unpassable here: `prod.serving` is red until the apex
// serves this build, and the apex cannot serve it until this command deploys it. A
// gate that can never go green before a deploy is a gate that gets switched off
// wholesale, which is how a real failure ships. So the override is NAMED:
// --override-gate=prod.serving permits exactly that check to be red and nothing
// else. A failing gate whose individual check names cannot be read is never
// overridable — "I could not tell what broke" must not read as permission.
const allowRed = (process.argv.find((a) => a.startsWith('--override-gate=')) || '')
	.replace('--override-gate=', '')
	.split(',')
	.map((x) => x.trim())
	.filter(Boolean);

console.log('  · running the gate');
if (!dry) {
	const g = spawnSync('node', [join(REPO, 'ops/gate.mjs'), '--json'], {
		cwd: REPO,
		encoding: 'utf8',
		maxBuffer: 64 * 1024 * 1024
	});

	let report;
	try {
		report = JSON.parse(g.stdout);
	} catch {
		console.error((g.stdout || '').split('\n').slice(-40).join('\n'));
		console.error((g.stderr || '').split('\n').slice(-40).join('\n'));
		die('the gate did not produce a readable report; treat that as a failed gate.');
	}

	for (const r of report.results) {
		const count = r.count === null ? '—' : `${r.count} ${r.unit}`;
		const drift = r.drift
			? `  ${r.drift > 0 ? '+' : ''}${r.drift} vs last run`
			: r.prev !== null
				? '  ='
				: '';
		console.log(
			`    ${String(r.gate).padStart(2)}. ${r.name.padEnd(24)} ${(r.ok ? 'pass' : 'FAIL').padEnd(8)} ${count}${drift}`
		);
	}

	const failed = report.results.filter((r) => !r.ok);
	if (failed.length) {
		const unexplained = [];
		for (const f of failed) {
			const names = [...(f.tail || '').matchAll(/FAIL\s+(\S+)/g)].map((m) => m[1]);
			if (!names.length) {
				unexplained.push(`gate ${f.gate} (${f.name}): no individual check names in its output`);
				continue;
			}
			for (const n of names) {
				if (!allowRed.includes(n)) unexplained.push(`gate ${f.gate} (${f.name}): ${n}`);
			}
		}
		if (unexplained.length) {
			for (const f of failed) {
				console.error(`\n  ── gate ${f.gate} (${f.name}) output, last 40 lines ──`);
				console.error(
					(f.tail || '')
						.split('\n')
						.map((l) => '  ' + l)
						.join('\n')
				);
			}
			die(
				'the gate is red on checks that were not explicitly overridden:\n    ' +
					unexplained.join('\n    ') +
					'\n  Fix them, or name them in --override-gate= if they are genuinely expected.'
			);
		}
		console.log(`\n  OVERRIDDEN (red, allowed explicitly): ${allowRed.join(', ')}`);
	}
}

// 2. Working tree must be clean, or the artefact does not match the commit.
// Generated paths are excluded, and the reason matters: the gate in step 1 rewrites
// ops/baseline.json (the drift record) on every run, so a naive check is dirty by the
// time it runs and deploy could NEVER succeed. What this check actually defends is
// that the SOURCE producing build/ matches a commit, and neither the drift record nor
// a screenshot affects the artefact.
const GENERATED = [/^ops\/baseline\.json$/, /^ops\/shots\//, /^static\/version\.json$/];
const dirty = sh('git', ['status', '--porcelain'])
	.split('\n')
	.filter(Boolean)
	// The status prefix is two columns, but sh() trims the whole output and eats the
	// leading space of the FIRST line, so " M path" arrives as "M path". Matching
	// one-or-two non-space characters handles both, and "??" for untracked.
	.map((l) => l.replace(/^\s*\S{1,2}\s+/, '').trim())
	.filter((f) => !GENERATED.some((re) => re.test(f)));
if (dirty.length) {
	die(
		`working tree is dirty; the deployed artefact would not match any commit:\n    ${dirty.slice(0, 8).join('\n    ')}`
	);
}

// 3. Push FIRST.
console.log('  · pushing');
if (!dry) {
	const p = spawnSync('git', ['push', '-u', 'origin', branch], { cwd: REPO, stdio: 'inherit' });
	if (p.status !== 0) die('push failed; refusing to deploy code that is not in the remote.');
}

// 4. Stamp the build so production can be asked what it is running.
const stamp = { commit: sha, branch, builtAt: new Date().toISOString() };
writeFileSync(join(REPO, 'static/version.json'), JSON.stringify(stamp, null, 2) + '\n');
if (!dry) execFileSync('npm', ['run', 'build'], { cwd: REPO, stdio: 'inherit' });

// 5. Deploy.
if (!process.env.CLOUDFLARE_API_TOKEN) {
	die(
		'CLOUDFLARE_API_TOKEN is not set.\n' +
			'  wrangler login needs a browser, which this container does not have.\n' +
			'  Create a token with the "Cloudflare Pages — Edit" template at\n' +
			'  https://dash.cloudflare.com/profile/api-tokens and add it to the\n' +
			'  environment as CLOUDFLARE_API_TOKEN.'
	);
}
console.log('  · deploying to cloudflare pages');
if (!dry) {
	const d = spawnSync(
		'npx',
		[
			'wrangler',
			'pages',
			'deploy',
			'build',
			'--project-name',
			PROJECT,
			// The Pages project serves its PRODUCTION branch on the custom domain;
			// anything else uploads as a preview that no visitor ever sees. This used
			// to read `branch === 'main' ? 'main' : branch`, where both arms are
			// `branch` — a no-op wearing the costume of a deliberate mapping.
			// PAGES_PRODUCTION_BRANCH overrides it when the project's production
			// branch is not what this checkout is called.
			'--branch',
			process.env.PAGES_PRODUCTION_BRANCH || branch
		],
		{ cwd: REPO, stdio: 'inherit' }
	);
	if (d.status !== 0) die('wrangler deploy failed.');
}

// 6. Read production back. Parity is a fact or it is a hope, and a hope gets
//    reported as a fact.
//
//    The apex is checked FIRST because that is what a visitor types. But while the
//    301 to phinster.net is in place the apex cannot serve this build no matter how
//    well the deploy went, so a failure there is not evidence the deploy failed —
//    and reporting it as one would be exactly the confident wrong answer this file
//    exists to prevent. So the pages.dev URL is checked as well, and the two are
//    reported separately.
console.log('  · confirming what is actually live');
if (!dry) {
	const fetchVersion = (base) => {
		for (let i = 0; i < 8; i++) {
			try {
				const out = execFileSync(
					'curl',
					['-sS', '-L', '--max-time', '15', `${base}/version.json`],
					{ encoding: 'utf8' }
				);
				const parsed = JSON.parse(out);
				if (parsed.commit) return parsed;
			} catch {
				/* edge not warm yet, or unreachable from here */
			}
			execFileSync('sleep', ['6']);
		}
		return null;
	};

	const apex = fetchVersion('https://phineasfritsch.com');
	const pages = fetchVersion(`https://${PAGES_HOST}`);

	console.log(`\n  apex      ${apex ? apex.commit : 'not serving this build'}`);
	console.log(`  pages.dev ${pages ? pages.commit : 'not reachable from here'}`);

	if (apex && apex.commit === sha) {
		console.log(`\n  LIVE at the apex: ${sha}\n`);
	} else if (pages && pages.commit === sha) {
		console.log(
			`\n  DEPLOYED (${sha}) and serving at ${PAGES_HOST}, but the apex is NOT.\n` +
				'  This is not finished. phineasfritsch.com still 301s to phinster.net, a\n' +
				'  Cloudflare tunnel with no origin. Remove that redirect rule in the dashboard\n' +
				'  and attach the custom domain to the Pages project. Do not describe this as\n' +
				'  shipped until a visitor typing the domain reaches the site.\n'
		);
		process.exit(3);
	} else {
		die(
			`deployed, but neither the apex nor ${PAGES_HOST} served version.json with ${sha}.\n` +
				'  Verify by hand before claiming this shipped. Note that some networks block\n' +
				'  *.pages.dev, so an unreachable pages.dev is not proof the deploy failed.'
		);
	}
}
