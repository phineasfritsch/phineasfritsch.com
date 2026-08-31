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
		return { url, status: 0, ms: Date.now() - started, error: String(err.message || err).split('\n')[0] };
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

const root = results[0];
const serving = root.status >= 200 && root.status < 400 && !root.cfError;

if (asJson) {
	console.log(JSON.stringify(results.map(({ body, ...r }) => r), null, 2));
} else {
	console.log(`PRODUCTION  ${APEX}`);
	console.log('─'.repeat(64));
	for (const r of results) {
		const flag = r.cfError ? `CF-${r.cfError}` : r.status || 'ERR';
		const note = r.cfError ? CF_CODES[r.cfError] || 'Cloudflare edge error.' : r.error || r.title || '';
		console.log(`  ${String(flag).padEnd(8)} ${r.url.replace(APEX, '') || '/'}`.padEnd(28) + ` ${r.ms}ms  ${note}`);
	}
	console.log('─'.repeat(64));
	if (root.final && !root.final.startsWith(APEX)) {
		console.log(`  REDIRECT  apex redirects off-domain to ${root.final}`);
	}
	console.log(serving ? '  VERDICT   serving' : '  VERDICT   NOT SERVING — visitors see an error page');
}

process.exit(serving ? 0 : 1);
