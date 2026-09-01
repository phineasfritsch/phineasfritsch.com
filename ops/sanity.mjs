#!/usr/bin/env node
/**
 * Is the state sane? Distinct from tests: tests check code, this checks the
 * artefact, the deployment, and the world. Exits non-zero with a machine-readable
 * verdict so a repair loop never has to parse a log.
 *
 *   node ops/sanity.mjs [--json] [--skip-prod]
 */
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { REPO, walk, normalise, builtHtmlFiles, builtHaystack } from './lib.mjs';

const asJson = process.argv.includes('--json');
const skipProd = process.argv.includes('--skip-prod');
const checks = [];
const add = (id, ok, detail, sample = null) => checks.push({ id, ok, detail, sample });

// ── 1. The build exists and is not empty ────────────────────────────────────
const buildDir = join(REPO, 'build');
const html = existsSync(buildDir) ? walk(buildDir, ['.html']) : [];
add('build.exists', html.length > 0, `${html.length} html files in build/`);

// ── 2. No placeholder copy in the built artefact ────────────────────────────
// The live site shipped "Copyright 2023 Your Name" and "Short bio or
// introduction about yourself" for three years. This check exists so that
// never happens twice. Patterns are deliberately literal.
const PLACEHOLDERS = [
	/\[your [a-z ]+\]/i,
	/\[year\]/i,
	/\[clubs?, orgs?[^\]]*\]/i,
	/\[write about[^\]]*\]/i,
	/\[fill in[^\]]*\]/i,
	/\[this is a good place[^\]]*\]/i,
	/\byour name\b/i,
	/short bio or introduction/i,
	/description of the project/i,
	/lorem ipsum/i,
	/\btbd\b/i,
	/coming soon/i
];
const offenders = [];
for (const f of html) {
	const src = readFileSync(f, 'utf8');
	for (const re of PLACEHOLDERS) {
		const m = src.match(re);
		if (m) offenders.push(`${f.replace(REPO + '/', '')}: ${JSON.stringify(m[0])}`);
	}
}
add(
	'build.no-placeholders',
	offenders.length === 0,
	`${offenders.length} placeholder strings in built html`,
	offenders.slice(0, 8)
);

// ── 3. Every internal link resolves to something that was built ─────────────
const built = new Set(
	html.map((f) =>
		f
			.replace(buildDir, '')
			.replace(/\/index\.html$/, '/')
			.replace(/^$/, '/')
	)
);
const badLinks = [];
for (const f of html) {
	const src = readFileSync(f, 'utf8');
	for (const m of src.matchAll(/href="(\/[^"#?]*)"/g)) {
		const href = m[1].endsWith('/') || m[1].includes('.') ? m[1] : m[1] + '/';
		if (href.includes('.')) continue; // asset, not a route
		if (!built.has(href)) badLinks.push(`${f.replace(REPO + '/', '')} -> ${m[1]}`);
	}
}
add(
	'build.links-resolve',
	badLinks.length === 0,
	`${badLinks.length} internal links with no built page`,
	[...new Set(badLinks)].slice(0, 8)
);

// ── 4. Every page has a title, a description, and exactly one h1 ────────────
const seoBad = [];
for (const f of html) {
	if (f.endsWith('200.html')) continue; // SPA shell, intentionally bare
	const src = readFileSync(f, 'utf8');
	const rel = f.replace(REPO + '/', '');
	const title = (src.match(/<title[^>]*>([^<]*)<\/title>/i) || [, ''])[1].trim();
	const desc = (src.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i) || [
		,
		''
	])[1].trim();
	const h1s = [...src.matchAll(/<h1[\s>]/gi)].length;
	if (!title) seoBad.push(`${rel}: no <title>`);
	if (title && normalise(title) === 'phineas fritsch' && !rel.endsWith('index.html'))
		seoBad.push(`${rel}: title not page-specific`);
	if (!desc) seoBad.push(`${rel}: no meta description`);
	if (h1s !== 1) seoBad.push(`${rel}: ${h1s} h1 elements`);

	// Every page shipped TWO description tags: a generic one in app.html and the
	// page's own. The generic one came first, so a crawler read the boilerplate —
	// and this very check read the first match too, which meant it was guarding the
	// tag that never changed. An infra reviewer proved it by stripping the
	// page-specific description from a built page and watching three guards stay
	// green. Counting them is the check that would have caught it.
	const nDesc = [...src.matchAll(/<meta[^>]+name="description"/gi)].length;
	if (nDesc !== 1) seoBad.push(`${rel}: ${nDesc} meta descriptions`);

	// The canonical must name the page it is on. It rendered as /blog// on every
	// post for one build, because the slug was not passed through to the component.
	const canonical = (src.match(/<link[^>]+rel="canonical"[^>]+href="([^"]*)"/i) || [, ''])[1];
	const expected =
		'https://phineasfritsch.com' + rel.replace(/^build/, '').replace(/index\.html$/, '');
	// build/404.html is a copy of the prerendered /not-found/ page, served by
	// Cloudflare for any unmatched path. Its canonical correctly names the page it
	// is a copy of, not the URL the reader happened to mistype.
	const isNotFoundCopy = rel === 'build/404.html';
	if (!canonical) seoBad.push(`${rel}: no canonical`);
	else if (!isNotFoundCopy && canonical !== expected)
		seoBad.push(`${rel}: canonical is ${canonical}, expected ${expected}`);
}
add(
	'build.page-metadata',
	seoBad.length === 0,
	`${seoBad.length} metadata problems`,
	seoBad.slice(0, 10)
);

// ── 5. Page weight budget, measured PER PAGE ───────────────────────────────
// CHANGED 2026-08-31, and the reason matters. This used to sum every .js file in
// build/ and compare the total against one budget. That was correct while the
// 3D scene was the homepage. It is wrong now: the scene moved to /planet/, which
// nobody loads unless they click a button that says "Load the scene (903KB)".
// Summing the whole directory counted an 812KB chunk against pages that never
// fetch it.
//
// Verified before changing it, per the rule about not weakening a check to
// something an empty artefact would satisfy: build/index.html preloads
// nodes/0 and nodes/2 and does NOT reference nodes/5, the three.js chunk. The
// property this check exists to defend — the pages a reader actually lands on
// are light — is intact, and this form measures it directly rather than by proxy.
//
// The new form reads each page's own modulepreload graph, which is what the
// browser fetches before first interaction. /planet/ is exempt by name because
// its weight is disclosed on the page itself and gated behind a click.
const PER_PAGE_JS_BUDGET = 250 * 1024;
const EXEMPT = ['/planet/'];
const heavy = [];
let worstPage = { page: null, bytes: 0 };
for (const f of html) {
	if (f.endsWith('200.html')) continue;
	const rel = f.replace(buildDir, '').replace(/index\.html$/, '');
	const src = readFileSync(f, 'utf8');
	const mods = [...src.matchAll(/href="([^"]*_app\/immutable\/[^"]*\.js)"/g)].map((m) => m[1]);
	let bytes = 0;
	for (const m of mods) {
		const abs = join(buildDir, m.replace(/^\.?\//, ''));
		try {
			bytes += readFileSync(abs).length;
		} catch {
			/* hashed asset moved; the links-resolve check covers genuine breakage */
		}
	}
	if (bytes > worstPage.bytes) worstPage = { page: rel, bytes };
	if (bytes > PER_PAGE_JS_BUDGET && !EXEMPT.includes(rel)) {
		heavy.push(`${rel} loads ${(bytes / 1024).toFixed(0)}KB of js`);
	}
}
add(
	'build.js-budget',
	heavy.length === 0,
	`heaviest non-exempt page ${(worstPage.bytes / 1024).toFixed(0)}KB (budget ${PER_PAGE_JS_BUDGET / 1024}KB/page)`,
	heavy.slice(0, 6)
);

// ── 6. Content renders without JavaScript ───────────────────────────────────
// If the prerendered html is an empty shell, then every crawler, every link
// preview, and every reader with JS blocked sees nothing.
const noJsBad = [];
for (const f of html) {
	if (f.endsWith('200.html')) continue;
	const src = readFileSync(f, 'utf8');
	const bodyText = src
		.replace(/<script[\s\S]*?<\/script>/gi, ' ')
		.replace(/<style[\s\S]*?<\/style>/gi, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
	if (bodyText.length < 200)
		noJsBad.push(`${f.replace(REPO + '/', '')}: ${bodyText.length} chars without js`);
}
add(
	'build.renders-without-js',
	noJsBad.length === 0,
	`${noJsBad.length} pages that are empty without js`,
	noJsBad.slice(0, 8)
);

// ── 7. Nothing private reaches the built site ──────────────────────────────
// The resume source lives in ops/ and carries his phone number. ops/ is never
// copied into the build, but "never" is a claim, and a claim about a file layout
// is exactly the kind that stops being true after a refactor nobody connected to
// this risk. A browser test covers the rendered pages; this covers the artefact,
// runs without a browser, and is therefore the one that will still be running in
// a year.
const PRIVATE_PATTERNS = [
	[/\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/, 'a phone number'],
	[/\b3\.\d{2,3}\s*(gpa|cumulative)|gpa[:\s]+\d\.\d/i, 'a GPA'],
	[/yikyak/i, 'a project that is excluded by name; see ops/private/EVIDENCE.md'],
	// He confirmed he never asked permission to publish this outside the admin portal.
	// It was removed once and came back in three files, because the only thing holding
	// it out was a paragraph. A paragraph does not fail a build.
	[/collab\s*hub/i, 'the Collab Hub claim, which he asked to keep off permanently'],
	// Not private data of HIS — private data of his coworkers. The worker behind
	// this hostname answers an unauthenticated GET with their first names, their
	// duty assignments and a link to the internal sheet, and the site was the thing
	// driving traffic to it. The anchor stays out until the worker requires auth;
	// prose alone put the Collab Hub claim back in three files, so this one is code.
	[
		/better-bio-schedule\.phineas-fritsch\.workers\.dev/i,
		'a public link to an endpoint that exposes coworkers\u2019 names; see B8 in ops/QUEUE.md'
	]
];
const leaks = [];
for (const f of html) {
	const src = readFileSync(f, 'utf8');
	for (const [re, what] of PRIVATE_PATTERNS) {
		if (re.test(src)) leaks.push(`${f.replace(REPO + '/', '')} contains ${what}`);
	}
}
add(
	'build.no-private-data',
	leaks.length === 0,
	`${leaks.length} private-data leaks in built html`,
	leaks.slice(0, 6)
);

// ── 8. Production is serving, and 9. the edge is not rewriting it ───────────
// read-prod.mjs exits 0 = clean, 2 = answering but the CDN altered the page,
// anything else = not serving. Collapsing 2 into the failure branch reported
// "apex is not serving" about a site that was serving fine, and buried the
// real finding. Two checks, because they have two different owners.
if (!skipProd) {
	let code = 0;
	let out = '';
	try {
		out = execFileSync('node', [join(REPO, 'ops/read-prod.mjs')], { encoding: 'utf8' });
	} catch (e) {
		code = typeof e.status === 'number' ? e.status : 1;
		out = (e.stdout || '') + (e.stderr || '');
	}
	const serving = code === 0 || code === 2;
	add(
		'prod.serving',
		serving,
		serving ? 'apex serves a page' : 'apex is not serving — run: node ops/read-prod.mjs'
	);
	const edgeLines = out
		.split('\n')
		.filter((l) => l.includes('·') && l.toLowerCase().includes('cloudflare'))
		.map((l) => l.trim());
	add(
		'prod.edge-intact',
		code !== 2,
		code === 2
			? `${edgeLines.length} page(s) rewritten by the CDN — turn off Scrape Shield email obfuscation`
			: 'the CDN serves the page as built',
		edgeLines.slice(0, 6)
	);
}

// ── 9c. The invitation to check the source has to be checkable ─────────────
// /answers/ tells a skeptical reader to go and verify this site against its
// repository. The repository's DEFAULT branch is the untouched framework
// scaffold — no ops/, no tests, no gate — because all of this work lives on a
// working branch, so a recruiter who took the invitation found nothing and the
// one claim the whole page rests on was the one they could not confirm. A
// reviewer found it by clicking the link.
//
// So the page says where the machinery actually is, and this check keeps the two
// in step in BOTH directions: while main lacks ops/, the sentence must name the
// branch; once main has it, the sentence must stop saying it does not. Otherwise
// the caveat outlives the problem and becomes its own small lie.
if (!skipProd) {
	let mainHasOps = null;
	try {
		const code = execFileSync(
			'curl',
			[
				'-sS',
				'-o',
				'/dev/null',
				'-w',
				'%{http_code}',
				'--max-time',
				'20',
				'https://raw.githubusercontent.com/phineasfritsch/phineasfritsch.com/main/ops/gate.mjs'
			],
			{ encoding: 'utf8' }
		).trim();
		if (code === '200') mainHasOps = true;
		else if (code === '404') mainHasOps = false;
	} catch {
		/* left null: unreachable, reported as unknown rather than guessed */
	}
	const saysBranch = builtHaystack().includes('rather than main');
	const ok = mainHasOps === null ? true : mainHasOps !== saysBranch;
	add(
		'repo.source-claim',
		ok,
		mainHasOps === null
			? 'could not reach raw.githubusercontent.com — claim not checked'
			: mainHasOps
				? saysBranch
					? 'main now carries ops/ — drop the "rather than main" caveat from /answers/'
					: 'main carries ops/, and the page points at it'
				: saysBranch
					? 'main is still the scaffold, and the page says so'
					: 'main lacks ops/ but /answers/ sends readers there anyway'
	);
}

// ── 9d. Counted claims in metadata must match what is counted ──────────────
// Three meta descriptions said "three of them are serving traffic" and "Six
// projects" while the site rendered seven projects and six live services. None
// of it was a lie — each number was true when it was typed, and then a project
// was added. Those strings are derived now; this is what notices if one is ever
// typed back in, and it reads the same two files the pages render from.
{
	const projectsSrc = readFileSync(join(REPO, 'src/lib/data/projects.ts'), 'utf8');
	const nProjects = (projectsSrc.match(/^\t\tslug: '/gm) || []).length;
	const statusJson = JSON.parse(readFileSync(join(REPO, 'src/lib/data/status.json'), 'utf8'));
	const nServing = Object.values(statusJson.results).filter((r) => r.status === 'up').length;
	const WORDS = [
		'zero',
		'one',
		'two',
		'three',
		'four',
		'five',
		'six',
		'seven',
		'eight',
		'nine',
		'ten',
		'eleven',
		'twelve'
	];
	// Only an actual number, spelled or in digits. Matching any word here caught
	// 'software projects' and 'routing ... serving traffic' and reported both as
	// disagreements, which is the failure mode where a guard cries wolf and is then
	// switched off.
	const NUM = `${WORDS.join('|')}|\\d+`;
	const num = (w) => {
		const i = WORDS.indexOf(w.toLowerCase());
		return i >= 0 ? i : Number(w);
	};
	const wrong = [];
	for (const f of html) {
		const m = readFileSync(f, 'utf8').match(/name="description" content="([^"]*)"/);
		if (!m) continue;
		const d = m[1];
		const rel = f.replace(REPO + '/', '');
		for (const [, w] of d.matchAll(new RegExp(`\\b(${NUM}) projects\\b`, 'gi'))) {
			if (num(w) !== nProjects) wrong.push(`${rel}: says ${w} projects, there are ${nProjects}`);
		}
		for (const [, w] of d.matchAll(
			new RegExp(`\\b(${NUM})(?: of them)? (?:are|is) serving traffic`, 'gi')
		)) {
			if (num(w) !== nServing) wrong.push(`${rel}: says ${w} serving, ${nServing} are up`);
		}
		for (const [, w] of d.matchAll(new RegExp(`\\b(${NUM}) deployed software projects\\b`, 'gi'))) {
			if (num(w) !== nServing) wrong.push(`${rel}: says ${w} deployed, ${nServing} are up`);
		}
	}
	add(
		'build.counted-claims',
		wrong.length === 0,
		`${wrong.length} counted claims that disagree with the data`,
		wrong.slice(0, 6)
	);
}

// ── 9a. The public resume is present, and is the public one ────────────────
// It ships from static/ and is linked from /resume/. Two ways this goes wrong
// silently: the file is missing, so the link 404s on the one page a recruiter
// came for; or a rebuild without --public leaves the tailored variant's phone
// number in a file anyone can download. Both are invisible to every other check.
{
	// static/, not build/. The staleness comparison below was against the BUILT
	// copy, which `npm run build` recreates seconds earlier in the same gate run,
	// so its mtime was always newer than the fact base and the check was
	// structurally green every time it ran inside the gate or a deploy — it could
	// only ever fire standalone. The source file is the one that can be old.
	const pdf = join(REPO, 'static/Phineas-Fritsch-resume.pdf');
	const shipped = join(REPO, 'build/Phineas-Fritsch-resume.pdf');
	const problems = [];
	if (!existsSync(pdf)) {
		problems.push(
			'static/Phineas-Fritsch-resume.pdf is missing — run: node ops/resume-build.mjs --public'
		);
	} else if (!existsSync(shipped)) {
		problems.push('the resume is in static/ but did not reach build/ — the link would 404');
	} else {
		const bytes = readFileSync(pdf, 'latin1');
		// PDF text is compressed, so a digit run will not appear literally; the
		// clickable tel: annotation is stored as plain text in the link object and
		// is the reliable tell that a private variant was published by mistake.
		if (/tel:\+?\d/.test(bytes)) problems.push('the published PDF carries a tel: link');
		if (bytes.length < 20_000) problems.push('the published PDF is suspiciously small');
		// The fact base is gitignored, so this only runs where it exists. Where it
		// does, a PDF older than the facts it was built from is a stale document
		// with a download button on it, which is worse than no download button.
		const facts = join(REPO, 'ops/private/resume/resume.data.mjs');
		if (existsSync(facts) && statSync(facts).mtimeMs > statSync(pdf).mtimeMs) {
			problems.push('the published PDF is older than the facts it was built from');
		}
	}
	add(
		'build.public-resume',
		problems.length === 0,
		problems[0] ?? 'published, with no phone number',
		problems
	);
}

// ── 9b. The status figures were measured when the page says they were ───────
// The homepage prints "checked <time> / when this page was built" next to an
// uptime figure for each service. ops/probe-live.mjs, which produces those
// figures, was wired into no script and no gate, so the deployed page carried
// numbers stamped two hours and twenty-two minutes before the build it sat in.
// The figures were real; the sentence about them was not, and on this site that
// sentence is the entire reason the figures are worth anything.
{
	const statusPath = join(REPO, 'src/lib/data/status.json');
	const indexPath = join(REPO, 'build/index.html');
	let detail = 'status.json or build/index.html is missing';
	let ok = false;
	if (existsSync(statusPath) && existsSync(indexPath)) {
		const checkedAt = new Date(JSON.parse(readFileSync(statusPath, 'utf8')).checkedAt).getTime();
		const builtAt = statSync(indexPath).mtimeMs;
		const minutes = Math.round(Math.abs(builtAt - checkedAt) / 60000);
		ok = minutes <= 30;
		detail = ok
			? `measured ${minutes} min from the build`
			: `measured ${minutes} min from the build — the page says "when this page was built"`;
	}
	add('build.status-freshness', ok, detail);
}

// Files a deploy writes itself. Their contents are measurements — a latency, an
// instant, a count — and cannot be reproduced from a commit, so a difference in
// them is not a difference a visitor can see. Kept in step with ops/deploy.mjs.
const GENERATED_PATHS = [
	/^ops\/baseline\.json$/,
	/^ops\/floors\.json$/,
	/^ops\/shots\//,
	/^static\/version\.json$/,
	/^src\/lib\/data\/status\.json$/
];

// ── 10-11. What the EDGE is serving, not what this directory contains ───────
// Every content guard above reads build/. Nothing compared the live bytes to
// this repo, so a scheduled run could report 9/9 over a production site weeks
// behind or altered on the way out — which is precisely what happened: the site
// served a permanently-excluded claim for four commits while the gate was green.
if (!skipProd) {
	const curl = (url) => {
		try {
			return execFileSync('curl', ['-sS', '-L', '--max-time', '20', url], {
				encoding: 'utf8',
				maxBuffer: 32 * 1024 * 1024
			});
		} catch {
			return null;
		}
	};
	// A path that cannot exist must not answer 200. Nothing in this file ever
	// requested one, so the gate was green for months over a production site that
	// served the homepage for every mistyped URL — the check could only ever see
	// pages that were there.
	const probePath = `/__gate-probe-${Date.now()}-${Math.random().toString(36).slice(2)}/`;
	let probeStatus = null;
	try {
		probeStatus = Number(
			execFileSync(
				'curl',
				[
					'-sS',
					'-o',
					'/dev/null',
					'-w',
					'%{http_code}',
					'--max-time',
					'20',
					`https://phineasfritsch.com${probePath}`
				],
				{ encoding: 'utf8' }
			).trim()
		);
	} catch {
		/* left null, reported below */
	}
	add(
		'prod.404-is-404',
		probeStatus === 404,
		probeStatus === 404
			? 'a path that does not exist returns 404'
			: `a path that does not exist returned ${probeStatus ?? 'nothing readable'}`
	);

	const head = execFileSync('git', ['rev-parse', '--short', 'HEAD'], {
		cwd: REPO,
		encoding: 'utf8'
	}).trim();
	let liveCommit = null;
	try {
		liveCommit = JSON.parse(curl(`https://phineasfritsch.com/version.json?d=${Date.now()}`)).commit;
	} catch {
		/* left null, reported below */
	}
	// A deploy writes its own measurements — gate counts, service latencies — and
	// those get committed afterwards, so HEAD is routinely one commit ahead of the
	// deployed one with nothing in between that a visitor could see. Comparing the
	// shas alone made this check permanently red and therefore permanently ignored,
	// which is worse than not having it. So: equal shas pass, and unequal shas pass
	// only if every file that differs is generated output. Anything else is stale.
	let parity = liveCommit === head;
	let why = parity ? `production serves ${head}` : '';
	if (!parity && liveCommit) {
		let changed = [];
		try {
			changed = execFileSync('git', ['diff', '--name-only', `${liveCommit}..${head}`], {
				cwd: REPO,
				encoding: 'utf8'
			})
				.split('\n')
				.filter(Boolean);
		} catch {
			changed = ['<could not diff>'];
		}
		const meaningful = changed.filter((f) => !GENERATED_PATHS.some((re) => re.test(f)));
		parity = changed.length > 0 && meaningful.length === 0;
		why = parity
			? `production serves ${liveCommit}; HEAD ${head} differs only in generated output`
			: `production serves ${liveCommit}, HEAD is ${head} — ${meaningful.length} file(s) differ: ${meaningful.slice(0, 3).join(', ')}`;
	} else if (!parity) {
		why = `no readable version.json from production, HEAD is ${head}`;
	}
	add('prod.commit-parity', parity, why);

	// The same patterns as build.no-private-data, run over the live bytes. A guard
	// that only ever reads the local build cannot see a stale or rewritten edge.
	// Derived from what was built, not a hardcoded list: the hardcoded one still
	// asked for /about/, which has 301'd to /answers/ since the page was renamed,
	// and a page added tomorrow would not have been scanned at all. Top-level
	// routes only — the per-project pages share their prose with /work/.
	const livePaths = [
		'/',
		...new Set(
			builtHtmlFiles()
				.map((f) => f.slice(join(REPO, 'build').length).replace(/index\.html$/, ''))
				.filter((p) => /^\/[^/]+\/$/.test(p))
		)
	];
	const liveLeaks = [];
	for (const p of livePaths) {
		const body = curl(`https://phineasfritsch.com${p}?d=${Date.now()}`);
		if (body === null) {
			liveLeaks.push(`${p}: could not be read`);
			continue;
		}
		const hay = normalise(body);
		for (const [re, why] of PRIVATE_PATTERNS) {
			if (re.test(hay)) liveLeaks.push(`${p}: ${why}`);
		}
	}
	add(
		'prod.no-private-data',
		liveLeaks.length === 0,
		`${liveLeaks.length} private-data leaks in live html`,
		liveLeaks.slice(0, 6)
	);
}

const failed = checks.filter((c) => !c.ok);

if (asJson) {
	console.log(
		JSON.stringify(
			{
				ok: failed.length === 0,
				passed: checks.length - failed.length,
				failed: failed.length,
				checks
			},
			null,
			2
		)
	);
} else {
	for (const c of checks) {
		console.log(`  ${c.ok ? 'ok  ' : 'FAIL'}  ${c.id.padEnd(28)} ${c.detail}`);
		if (!c.ok && c.sample?.length) for (const s of c.sample) console.log(`          · ${s}`);
	}
	console.log(`\n  ${checks.length - failed.length}/${checks.length} sanity checks passed`);
}

process.exit(failed.length === 0 ? 0 : 1);
