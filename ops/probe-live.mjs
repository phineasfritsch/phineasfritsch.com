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
for (const t of TARGETS) {
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
		results[t.slug] = {
			status: code >= 200 && code < 400 ? 'up' : 'down',
			code,
			ms: Date.now() - started
		};
	} catch {
		// Could not reach it from the build machine. That is not evidence it is down,
		// and it is certainly not evidence it is up.
		results[t.slug] = { status: 'unknown', code: null, ms: null };
	}
}

const out = { checkedAt: new Date().toISOString(), results };
writeFileSync(join(REPO, 'src/lib/data/status.json'), JSON.stringify(out, null, 2) + '\n');
for (const [k, v] of Object.entries(results))
	console.log(`  ${k.padEnd(18)} ${v.status.padEnd(8)} ${v.code ?? '—'}  ${v.ms ?? '—'}ms`);
