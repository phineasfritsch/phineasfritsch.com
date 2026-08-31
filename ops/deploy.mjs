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
console.log('  · running the gate');
if (!dry) {
	const g = spawnSync('node', [join(REPO, 'ops/gate.mjs')], { cwd: REPO, stdio: 'inherit' });
	if (g.status !== 0) die('the gate is red. Fix it or say explicitly that you are overriding it.');
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
	.map((l) => l.replace(/^..\s+/, '').trim())
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
			'phineasfritsch-com',
			'--branch',
			branch === 'main' ? 'main' : branch
		],
		{ cwd: REPO, stdio: 'inherit' }
	);
	if (d.status !== 0) die('wrangler deploy failed.');
}

// 6. Read production back. Parity is now a fact.
console.log('  · confirming what is actually live');
if (!dry) {
	let live = null;
	for (let i = 0; i < 10; i++) {
		try {
			live = JSON.parse(
				execFileSync(
					'curl',
					['-sS', '--max-time', '15', 'https://phineasfritsch.com/version.json'],
					{ encoding: 'utf8' }
				)
			);
			if (live.commit === sha) break;
		} catch {
			/* edge not warm yet */
		}
		execFileSync('sleep', ['6']);
	}
	if (!live)
		die(
			'deployed, but production did not serve version.json. Verify by hand before claiming this shipped.'
		);
	console.log(`\n  LIVE: ${live.commit} (built ${live.builtAt})`);
	if (live.commit !== sha)
		die(`production is serving ${live.commit}, not ${sha}. Do not report this as deployed.`);
}
console.log(`\n  deployed ${sha}\n`);
