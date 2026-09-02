#!/usr/bin/env node
/**
 * Render the resume, one document per track.
 *
 *   node ops/resume-build.mjs            # all tracks
 *   node ops/resume-build.mjs product    # one
 *
 * One fact base (ops/private/resume/resume.data.mjs), one renderer, three PDFs. The
 * board was unanimous that the resume is the artefact that must pick a single target,
 * because it is the one that enters an ATS — and equally clear that three hand-edited
 * copies of a one-page file with two pixels of headroom diverge inside a month.
 *
 * Everything lives under ops/private/, which is gitignored, because the resume carries
 * a phone number and this repository is public.
 */
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync, statSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { join } from 'node:path';
import { REPO, chromiumPath } from './lib.mjs';

const DIR = join(REPO, 'ops/private/resume');
const OUT = join(DIR, 'build');
mkdirSync(OUT, { recursive: true });

const data = await import(pathToFileURL(join(DIR, 'resume.data.mjs')).href);
// Font URLs are rewritten to absolute file:// paths. They are relative in the source
// CSS, the rendered HTML lands one directory deeper than the CSS, and a 404 on a font
// does not error — it silently falls back to system metrics, which reflows the page
// taller and turns a one-page resume into two. That exact failure has now happened
// twice, and both times the only visible symptom was the PDF getting smaller.
const css = readFileSync(join(DIR, 'resume.css'), 'utf8').replace(
	/url\('([^']*\/)?([\w-]+\.woff2)'\)/g,
	(_m, _dir, file) => `url('${pathToFileURL(join(REPO, 'static/fonts', file)).href}')`
);

const want = process.argv.slice(2).filter((a) => !a.startsWith('-'));
// The public one is opt-in: `--public` builds it, and it is the only variant that
// leaves ops/private/. Everything else stays a file he attaches to an application.
const wantPublic = process.argv.includes('--public');
const tracks = want.length ? want : wantPublic ? [data.PUBLIC_TRACK] : data.TRACKS;

// Never rendered, in any variant. Each was decided deliberately and each would be easy
// to reintroduce by accident from a stale draft.
const FORBIDDEN = [
	[/\bGPA\b/i, 'a GPA'],
	[/collab\s*hub/i, 'the Collab Hub claim, which he asked to keep off permanently'],
	[/yikyak/i, 'an excluded project'],
	[/minor in accounting/i, 'the accounting minor, which he dropped'],
	[/projected to (make|earn)/i, 'a revenue projection'],
	[/passed exam|exam .{0,4}passed/i, 'a claim that an exam was passed']
];

/** Pick a track-specific value from either a plain value or a {track|default} object. */
const pick = (v, track) =>
	v && typeof v === 'object' && !Array.isArray(v) ? (v[track] ?? v.default) : v;
/** Items may declare which tracks they belong to; absent means all. */
const forTrack = (items, track) => items.filter((i) => !i.variants || i.variants.includes(track));

const esc = (s) => String(s);

/**
 * The public PDF drops the phone number. The three tailored documents go to a named
 * person who asked for one; the public file is something a stranger downloads from
 * a website, and a phone number on it is on the open internet forever. The address
 * stays, because a resume nobody can answer is not a resume.
 */
function contactLine(track) {
	if (track !== data.PUBLIC_TRACK) return data.contact.line;
	return data.contact.line.filter((x) => !(x.href || '').startsWith('tel:'));
}

function render(track) {
	const exp = forTrack(data.experience, track)
		.map(
			(e) => `<div class="row">
			<div class="rowhead"><strong>${esc(e.title)}</strong><span class="when">${esc(e.when)}</span></div>
			<ul>${e.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
		</div>`
		)
		.join('\n\t\t');

	const proj = forTrack(data.projects, track)
		.map((p) => {
			const bullets = pick(p.bullets, track) || [];
			return `<div class="row">
			<div class="rowhead"><strong>${esc(p.title)}</strong><span class="when">${esc(p.meta)}</span></div>
			<ul>${bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
		</div>`;
		})
		.join('\n\t\t');

	const lead = forTrack(data.leadership, track)
		.map(
			(l) => `<div class="row">
			<div class="rowhead"><strong>${esc(l.title)}</strong><span class="when">${esc(l.when)}</span></div>
			<ul>${l.bullets.map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
		</div>`
		)
		.join('\n\t\t');

	const eduRows = data.education.rows
		.map((r) => `<dt>${esc(r.dt)}</dt><dd>${esc(pick(r.dd, track))}</dd>`)
		.join('\n\t\t\t');

	const skillRows = data.skills
		.map((s) => `<dt>${esc(s.dt)}</dt><dd>${esc(s.dd)}</dd>`)
		.join('\n\t\t\t');

	return `<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<title>Phineas Fritsch — Resume (${track})</title>
		<style>
${css}
		</style>
	</head>
	<body>
		<h1>${esc(data.contact.name)}</h1>
		<div class="contact">${contactLine(track)
			.map((x) =>
				x.href
					? `<span><a href="${x.href}">${esc(x.text)}</a></span>`
					: `<span>${esc(x.text)}</span>`
			)
			.join('')}</div>
		<p class="lede">${esc(data.ledes[track])}</p>

		<h2>EDUCATION</h2>
		<div class="rowhead">
			<strong>${esc(data.education.school)}</strong><span class="when">${esc(data.education.when)}</span>
		</div>
		<dl class="kv" style="margin-top: 2pt">
			${eduRows}
		</dl>

		<h2>EXPERIENCE</h2>
		${exp}

		<h2>PROJECTS</h2>
		${proj}

		<h2>LEADERSHIP</h2>
		${lead}

		<h2>SKILLS</h2>
		<dl class="kv">
			${skillRows}
		</dl>
	</body>
</html>
`;
}

const b = await chromium.launch({ executablePath: chromiumPath() });
let failed = 0;

for (const track of tracks) {
	if (!data.ledes[track]) {
		console.error(`  unknown track "${track}"`);
		failed++;
		continue;
	}
	const html = render(track);

	const text = html.replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
	const hits = FORBIDDEN.filter(([re]) => re.test(text));
	if (hits.length) {
		console.error(`\n  REFUSING ${track}: ${hits.map(([, w]) => w).join('; ')}`);
		failed++;
		continue;
	}

	const isPublic = track === data.PUBLIC_TRACK;
	const htmlPath = join(OUT, `resume-${track}.html`);
	// The public one is written straight into static/, so it ships with the site and
	// the gate's own checks see it. The others never leave ops/private/.
	const pdfPath = isPublic
		? join(REPO, 'static/Phineas-Fritsch-resume.pdf')
		: join(OUT, `Phineas-Fritsch-resume-${track}.pdf`);
	writeFileSync(htmlPath, html);

	// Letter minus 0.55in margins each side is 7.4in = 710px at 96dpi. Measuring at the
	// default 1280px viewport reflows narrower and reports a two-page document as fitting.
	const p = await b.newPage({ viewport: { width: 710, height: 960 } });
	await p.emulateMedia({ media: 'print' });
	await p.goto(pathToFileURL(htmlPath).href, { waitUntil: 'networkidle' });
	const height = await p.evaluate(() => document.body.scrollHeight);
	// tagged: true emits a /StructTreeRoot, so a screen reader gets headings and
	// lists instead of a wall of positioned glyphs. The published PDF had none — no
	// structure tree, no /MarkInfo, no /Lang — which fails WCAG 1.3.1 and 3.1.1 on
	// the one artefact a reader keeps offline, on a site that advertises measured
	// accessibility everywhere else. outline: false because a one-page document does
	// not need bookmarks.
	await p.pdf({
		path: pdfPath,
		format: 'Letter',
		printBackground: true,
		tagged: true,
		outline: false,
		margin: { top: '0.5in', bottom: '0.5in', left: '0.55in', right: '0.55in' }
	});
	await p.close();

	// Verify the PDF the way a machine reads it. Rendering correctly and extracting
	// correctly are different properties, and only one of them is visible to a person.
	let verify = { problems: ['verifier did not run'] };
	try {
		verify = JSON.parse(
			execFileSync('python3', [join(REPO, 'ops/resume-verify.py'), pdfPath], { encoding: 'utf8' })
		);
	} catch (e) {
		try {
			verify = JSON.parse(String(e.stdout || '{}'));
		} catch {
			verify = { problems: ['verifier failed to run'] };
		}
	}

	const pages = (
		readFileSync(pdfPath)
			.toString('latin1')
			.match(/\/Type\s*\/Page[^s]/g) || []
	).length;
	const over = Math.round(height - 960);
	const ok = pages === 1 && (verify.problems || []).length === 0;
	if (!ok) failed++;
	for (const prob of verify.problems || []) console.log(`        · ${prob}`);
	// A page that fits with almost nothing to spare spills on the next edit.
	if (pages === 1 && height > 960 * 0.985) {
		console.log(
			`        · only ${Math.round(960 - height)}px of headroom; the next edit will spill`
		);
	}
	console.log(
		`  ${ok ? 'ok  ' : 'OVER'}  ${track.padEnd(10)} ${pages} page${pages === 1 ? ' ' : 's'}  ${String(Math.round(height)).padStart(4)}px${over > 0 ? ` (over by ${over})` : ''}  ${(statSync(pdfPath).size / 1024).toFixed(0)}KB`
	);
}

await b.close();
if (failed)
	console.error(
		`\n  ${failed} variant(s) need work. Cut something rather than shrinking the type.\n`
	);
process.exit(failed ? 1 : 0);
