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
const PROJECT = process.env.PAGES_PROJECT || 'personalsite';

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
			'--branch',
			branch === 'main' ? 'main' : branch
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
