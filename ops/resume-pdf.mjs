#!/usr/bin/env node
/**
 * Render ops/private/resume/resume.html to a PDF.
 *
 * The source lives under ops/private/, which is gitignored, because this repository
 * is public and the resume carries a phone number. It is also outside static/, so it
 * can never be swept into the build. Three separate guards, because the cost of
 * getting this wrong is not recoverable once it is pushed:
 *   - untracked, so it is not in the repository;
 *   - outside static/, so it is not in the build;
 *   - ops/sanity.mjs fails if a phone number appears in any built page anyway.
 *
 *   CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome node ops/resume-pdf.mjs
 */
import { chromium } from '@playwright/test';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { REPO } from './lib.mjs';

const src = join(REPO, 'ops/private/resume/resume.html');
const out = join(REPO, 'ops/private/resume/Phineas-Fritsch-resume.pdf');

if (!existsSync(src)) {
	console.error(`\n  REFUSING: ${src} does not exist.\n`);
	process.exit(1);
}

// Guard the things that must never reach a resume, checked against the source
// rather than trusted. See ops/private/EVIDENCE.md for why each one is here.
const html = readFileSync(src, 'utf8');
const text = html
	.replace(/<style[\s\S]*?<\/style>/gi, ' ')
	.replace(/<[^>]+>/g, ' ')
	.replace(/\s+/g, ' ');
const forbidden = [
	[/\bGPA\b/i, 'a GPA appears. It is deliberately omitted; see ops/private/EVIDENCE.md.'],
	[
		/projected to (make|earn)|\$\d+\s*k?\s*(over|in)\s+\d/i,
		'a revenue projection appears. There is no revenue.'
	],
	[/passed exam|exam .{0,4}passed/i, 'it implies an exam has been passed. None has.'],
	[/yikyak/i, 'an excluded project appears; see ops/private/EVIDENCE.md.'],
	[/collab\s*hub/i, 'the Collab Hub claim appears. He asked for it off permanently.']
];
const hits = forbidden.filter(([re]) => re.test(text));
if (hits.length) {
	console.error('\n  REFUSING to render:');
	for (const [, why] of hits) console.error(`    · ${why}`);
	console.error('');
	process.exit(1);
}

const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
// Letter is 8.5in wide; minus 0.55in margins each side that is 7.4in = 710px at 96dpi.
// Measuring at the default 1280px viewport reflows the text narrower and reports it
// fitting when it does not — that mistake cost two rounds of guessing at cuts.
const p = await b.newPage({ viewport: { width: 710, height: 960 } });
await p.emulateMedia({ media: 'print' });
await p.goto(pathToFileURL(src).href, { waitUntil: 'networkidle' });

const usable = (11 - 1.0) * 96;
const contentHeight = await p.evaluate(() => document.body.scrollHeight);
console.log(
	`\n  content ${Math.round(contentHeight)}px against ${usable}px of usable page` +
		(contentHeight > usable ? `  — OVER BY ${Math.round(contentHeight - usable)}px` : '  — fits')
);
await p.pdf({
	path: out,
	format: 'Letter',
	printBackground: true,
	margin: { top: '0.5in', bottom: '0.5in', left: '0.55in', right: '0.55in' }
});

// Count the pages so "it fits on one page" is a fact rather than a hope. A PDF's
// page count is the number of /Type /Page objects in it.
const bytes = readFileSync(out);
const pages = (bytes.toString('latin1').match(/\/Type\s*\/Page[^s]/g) || []).length;
await b.close();

console.log(`\n  wrote ${out}`);
console.log(
	`  ${(statSync(out).size / 1024).toFixed(0)}KB, ${pages} page${pages === 1 ? '' : 's'}`
);
if (pages > 1) {
	console.log('\n  WARNING: more than one page. Cut something rather than shrinking the type.');
	process.exit(2);
}
