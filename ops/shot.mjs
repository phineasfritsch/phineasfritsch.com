#!/usr/bin/env node
/**
 * Screenshot every page in a real browser, desktop and mobile.
 *
 * Manages its own preview server, start to finish. An earlier version assumed one
 * was already running, which produced two distinct failures worth remembering:
 *   - with nothing serving, it screenshotted Chrome's "This site can't be reached"
 *     page for every route and exited zero, which is a report of success over
 *     broken work;
 *   - with a server left running afterwards, the next `ops/gate.mjs` failed because
 *     playwright refuses to reuse a server it did not start (that refusal is
 *     deliberate: a reused server may be serving an older build).
 * Owning the lifecycle here removes both.
 */
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { chromiumPath } from './lib.mjs';

const BASE = 'http://127.0.0.1:4173';
const routes = ['/', '/work/', '/work/dibs/', '/answers/', '/resume/', '/blog/'];
const prefix = process.argv[2] ?? 'new-';

mkdirSync('ops/shots', { recursive: true });

const alreadyUp = await fetch(BASE + '/')
	.then((r) => r.ok)
	.catch(() => false);

let server = null;
if (!alreadyUp) {
	// detached so the whole process group can be signalled. Killing `npx` alone
	// leaves the vite child holding the port, and the next gate run then fails
	// because playwright refuses to reuse a server it did not start.
	server = spawn('npx', ['vite', 'preview', '--port', '4173', '--strictPort'], {
		stdio: 'ignore',
		detached: true
	});
	const deadline = Date.now() + 60_000;
	let up = false;
	while (Date.now() < deadline) {
		up = await fetch(BASE + '/')
			.then((r) => r.ok)
			.catch(() => false);
		if (up) break;
		await new Promise((r) => setTimeout(r, 500));
	}
	if (!up) {
		try {
			process.kill(-server.pid, 'SIGTERM');
		} catch {
			server.kill();
		}
		console.error('\n  REFUSING: preview server never came up on 4173.\n');
		process.exit(1);
	}
}

let stopped = false;
const shutdown = () => {
	if (stopped || !server) return;
	stopped = true;
	// Signal the group, not just npx: the vite child is what actually holds 4173.
	try {
		process.kill(-server.pid, 'SIGTERM');
	} catch {
		try {
			server.kill('SIGTERM');
		} catch {
			/* already gone */
		}
	}
};
process.on('exit', shutdown);
process.on('SIGINT', () => {
	shutdown();
	process.exit(130);
});

const b = await chromium.launch({ executablePath: chromiumPath() });
let failures = 0;

for (const dev of [
	{ n: 'desktop', v: { width: 1440, height: 900 } },
	{ n: 'mobile', v: { width: 390, height: 844 } }
]) {
	const ctx = await b.newContext({ viewport: dev.v, deviceScaleFactor: 1 });
	const p = await ctx.newPage();
	const errs = [];
	p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 160)));
	p.on('pageerror', (e) => errs.push('PAGEERROR ' + String(e).slice(0, 160)));

	for (const r of routes) {
		const t0 = Date.now();
		try {
			await p.goto(BASE + r, { waitUntil: 'networkidle', timeout: 30000 });
		} catch (e) {
			failures++;
			errs.push(`${r} NAV ${String(e.message).slice(0, 100)}`);
		}
		const name = `ops/shots/${prefix}${dev.n}${r === '/' ? '-home' : '-' + r.replace(/\//g, '')}.png`;
		await p.screenshot({ path: name, fullPage: dev.n === 'desktop' });
		const text = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').trim());
		// A page that renders almost nothing is the thing this tool exists to notice.
		if (text.length < 200) {
			failures++;
			console.log(`  !! ${dev.n} ${r} rendered only ${text.length} characters`);
		}
		console.log(
			`${dev.n} ${r.padEnd(14)} ${String(Date.now() - t0).padStart(5)}ms  ${String(text.length).padStart(5)} chars  "${text.slice(0, 60)}"`
		);
	}
	if (errs.length) console.log(`  ${dev.n} console: ${[...new Set(errs)].slice(0, 4).join(' | ')}`);
	await ctx.close();
}

await b.close();
shutdown();
process.exit(failures ? 1 : 0);
