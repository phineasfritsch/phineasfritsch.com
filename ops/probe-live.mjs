#!/usr/bin/env node
/**
 * Measure whether his deployed things are actually up, and how fast, and bake the
 * result into the build.
 *
 * This is honest only because the page says WHEN it was checked. A static site
 * cannot know the current state of anything, and a green dot implying live
 * monitoring would be a lie told in CSS. The output carries a timestamp and the
 * page prints it. If the probe cannot run, status is 'unknown' and the page says
 * unknown — never 'up'.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO } from './lib.mjs';

const run = promisify(execFile);

const TARGETS = [
	{ slug: 'dibs', url: 'https://dibs.ge/' },
	{ slug: 'shelfmark', url: 'https://shelfmark.phineasfritsch.com/' },
	{ slug: 'biomed-schedule', url: 'https://better-bio-schedule.phineas-fritsch.workers.dev/' },
	{ slug: 'the-cut-card', url: 'https://thecutcard.com/' },
	{ slug: 'jellyfin-matcher', url: 'https://jellymatch.phinster.net/' },
	{ slug: 'bruinthetachi', url: 'https://preview.bruinthetachi.pages.dev/' }
];

const results = {};
// Three attempts, not one. A single dropped curl at deploy time wrote 'unknown'
// for Dibs — the flagship, the first row on the homepage — while dibs.ge answered
// 200 on every attempt anyone made afterwards. Five of eight reviewers opened the
// page, saw the site's headline project in an indeterminate state next to five
// siblings reading "up · NNNms", and concluded the measurement apparatus the page
// brags about is unreliable. That is the exact trust the figures exist to buy.
// 'unknown' is still honest, and it is still what gets written when the network
// really cannot answer — it just has to be earned now.
const ATTEMPTS = 3;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

for (const t of TARGETS) {
	let recorded = null;
	for (let i = 0; i < ATTEMPTS; i++) {
		const started = Date.now();
		try {
			const { stdout } = await run('curl', [
				'-sS',
				'-o',
				'/dev/null',
				'-L',
				'--max-time',
				'15',
				'-w',
				'%{http_code}',
				t.url
			]);
			const code = Number(stdout.trim());
			const ms = Date.now() - started;
			// Keep the fastest successful reading, so a slow first attempt that later
			// succeeds does not publish a latency the service does not really have.
			if (code >= 200 && code < 400) {
				if (!recorded || recorded.status !== 'up' || ms < recorded.ms) {
					recorded = { status: 'up', code, ms };
				}
				continue;
			}
			// A real HTTP error is an answer, not a failure to reach: record it and stop.
			recorded = { status: 'down', code, ms };
			break;
		} catch {
			// Could not reach it from the build machine. That is not evidence it is
			// down, and it is certainly not evidence it is up. Try again.
			if (i < ATTEMPTS - 1) await sleep(1000 * (i + 1));
		}
	}
	results[t.slug] = recorded ?? { status: 'unknown', code: null, ms: null };
}

const out = { checkedAt: new Date().toISOString(), results };
writeFileSync(join(REPO, 'src/lib/data/status.json'), JSON.stringify(out, null, 2) + '\n');
for (const [k, v] of Object.entries(results))
	console.log(`  ${k.padEnd(18)} ${v.status.padEnd(8)} ${v.code ?? '—'}  ${v.ms ?? '—'}ms`);
