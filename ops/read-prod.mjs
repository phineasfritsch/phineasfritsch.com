#!/usr/bin/env node
/**
 * Read production. Read-only, one command, boring to use.
 *
 *   node ops/read-prod.mjs            # summary
 *   node ops/read-prod.mjs --json     # machine-readable
 *   node ops/read-prod.mjs --body /   # dump one page's HTML
 *
 * Exit 0 = production answered with a page. Exit 1 = production is not serving.
 * A loop reads the exit code; a person reads the summary.
 */
const APEX = 'https://phineasfritsch.com';
const args = process.argv.slice(2);
const asJson = args.includes('--json');
const bodyIdx = args.indexOf('--body');

const PATHS = ['/', '/work/', '/about/', '/blog/', '/resume/'];

// Cloudflare puts its real complaint in the body, not the status line.
const CF_CODES = {
	1033: 'Cloudflare Tunnel error — no origin is connected to the tunnel.',
	1000: 'DNS points at a Cloudflare IP that is not configured for this host.',
	1016: 'Origin DNS error — the origin hostname does not resolve.',
	521: 'Origin refused the connection.',
	522: 'Connection to origin timed out.',
	523: 'Origin is unreachable.'
};

// Transport is curl, not node fetch: fetch ignores HTTPS_PROXY, and this command
// has to be boring to use from any machine, including behind a proxy.
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
const run = promisify(execFile);

async function probe(url) {
	const started = Date.now();
	try {
		const { stdout } = await run(
			'curl',
			['-sS', '-L', '--max-time', '20', '-w', '\\n__META__%{http_code} %{url_effective}', url],
			{ maxBuffer: 20 * 1024 * 1024 }
		);
		const mi = stdout.lastIndexOf('__META__');
		const text = mi === -1 ? stdout : stdout.slice(0, mi).replace(/\n$/, '');
		const meta = mi === -1 ? '' : stdout.slice(mi + 8).trim();
		const [code, finalUrl] = meta.split(/\s+/);
		const cf = text.match(/error code:\s*(\d+)/i);
		return {
			url,
			final: finalUrl || url,
			status: Number(code) || 0,
			ms: Date.now() - started,
			bytes: text.length,
			cfError: cf ? Number(cf[1]) : null,
			title: (text.match(/<title[^>]*>([^<]*)<\/title>/i) || [, ''])[1].trim(),
			body: text
		};
	} catch (err) {
		return {
			url,
			status: 0,
			ms: Date.now() - started,
			error: String(err.message || err).split('\n')[0]
		};
	}
}

if (bodyIdx !== -1) {
	const p = args[bodyIdx + 1] || '/';
	const r = await probe(APEX + p);
	process.stdout.write(r.body || r.error || '');
	process.exit(r.status >= 200 && r.status < 400 ? 0 : 1);
}

const results = [];
for (const p of PATHS) results.push(await probe(APEX + p));

// A path that must NOT exist. Every entry in PATHS is a page that does, so no
// probe here could ever observe a 404 — and for months the site answered every
// unmatched URL with HTTP 200 and the homepage body while this file reported
// "serving". A check that can only see the happy case is not a check. The path
// is randomised so a cached answer cannot fake it.
const missing = await probe(
	`${APEX}/__gate-probe-${Date.now()}-${Math.random().toString(36).slice(2)}/`
);
const softNotFound = missing.status === 200;

// ── things that are only broken in production ──────────────────────────────
// Every local check can pass while the edge rewrites the page underneath you.
// This one is real and was live: Cloudflare's Email Address Obfuscation (Scrape
// Shield) rewrites mailto: links to /cdn-cgi/l/email-protection#<hex> and replaces
// the visible address with a span that only JavaScript decodes. Without JS the
// footer reads "[email protected]" — on a site built because its owner disliked
// email domains that go nowhere. Turn it off under the zone's Scrape Shield.
const edgeIssues = [];
for (const r of results) {
	if (!r.body || r.cfError) continue;
	if (r.body.includes('__cf_email__') || r.body.includes('/cdn-cgi/l/email-protection')) {
		edgeIssues.push(
			`${r.url.replace(APEX, '') || '/'}: contact address obfuscated by Cloudflare Scrape Shield`
		);
	}
	const noJs = r.body.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ');
	if (noJs.includes('[email' + ' protected]')) {
		edgeIssues.push(
			`${r.url.replace(APEX, '') || '/'}: renders "[email protected]" without JavaScript`
		);
	}
}

const root = results[0];
// Identity is part of serving. curl follows redirects, so an apex that 301s to a
// stranger's site used to read as "serving" — the off-domain case printed a line
// and left the exit code alone. Pointing APEX at example.com returned 200 and
// VERDICT serving, which is a check passing over a site that is not his.
const onDomain = !root.final || root.final.startsWith(APEX);
// Every path, not just the first. The verdict used to come from results[0] alone,
// so the other four statuses were printed and then thrown away: a production site
// with every page but the homepage gone still read as "serving".
const allAnswer = results.every(
	(r) => r.status >= 200 && r.status < 400 && !r.cfError && (!r.final || r.final.startsWith(APEX))
);
const serving = root.status >= 200 && root.status < 400 && !root.cfError && onDomain && allAnswer;

if (asJson) {
	console.log(
		JSON.stringify(
			{
				serving,
				softNotFound,
				pages: results.map(({ body, ...r }) => r)
			},
			null,
			2
		)
	);
} else {
	console.log(`PRODUCTION  ${APEX}`);
	console.log('─'.repeat(64));
	for (const r of results) {
		const flag = r.cfError ? `CF-${r.cfError}` : r.status || 'ERR';
		const note = r.cfError
			? CF_CODES[r.cfError] || 'Cloudflare edge error.'
			: r.error || r.title || '';
		console.log(
			`  ${String(flag).padEnd(8)} ${r.url.replace(APEX, '') || '/'}`.padEnd(28) +
				` ${r.ms}ms  ${note}`
		);
	}
	console.log('─'.repeat(64));
	if (root.final && !root.final.startsWith(APEX)) {
		console.log(`  REDIRECT  apex redirects off-domain to ${root.final}`);
	}
	if (softNotFound) {
		console.log('  SOFT 404  a path that does not exist answered 200 — every mistyped link');
		console.log('            renders as a real page');
	}
	if (edgeIssues.length) {
		console.log('  EDGE      the CDN is rewriting the page on the way out:');
		for (const e of [...new Set(edgeIssues)]) console.log(`            \u00b7 ${e}`);
	}
	console.log(
		serving ? '  VERDICT   serving' : '  VERDICT   NOT SERVING — visitors see an error page'
	);
}

// Exit 2 means production answers, but the edge has broken something on the way out.
// Distinct from 1 (not serving at all) so a loop can tell the two apart.
process.exit(serving ? (edgeIssues.length || softNotFound ? 2 : 0) : 1);
