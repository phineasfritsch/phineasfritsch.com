#!/usr/bin/env node
/**
 * Measure how much of the old chapter site the replacement actually preserves.
 *
 * This exists because the number was wrong twice, in a sentence that boasted about
 * having measured it. The first version said every old URL still resolved; four
 * did. The second pulled two of the old sitemap's six sub-sitemaps, counted 123
 * URLs and reported 71 missing; the index names 292 URLs and 232 are missing,
 * including all 160 portfolio entries. Both times a reviewer found it with one
 * curl of a public sitemap.
 *
 * A number a person types is a number a person can get wrong twice. This writes it.
 *
 * Usage: node ops/measure-migration.mjs   ->  src/lib/data/migration.json
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO } from './lib.mjs';

const run = promisify(execFile);
const OLD = 'https://www.bruinthetachi.com';
const NEW = 'https://preview.bruinthetachi.pages.dev';

const get = async (url) => {
	const { stdout } = await run('curl', ['-sS', '-L', '--max-time', '25', url], {
		maxBuffer: 32 * 1024 * 1024
	});
	return stdout;
};

const locs = (xml) => [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const index = await get(`${OLD}/wp-sitemap.xml`);
const subs = locs(index);
// Keep the sub-sitemap each URL came from. WordPress puts posts and pages at the
// same depth, so a path shape cannot tell them apart — and the distinction is the
// whole point: 232 missing reads as old social posts until you notice the PAGES
// sub-sitemap, the site's actual navigation, is most of the loss.
const urls = new Map();
for (const s of subs) {
	const kind = (s.match(/wp-sitemap-(?:posts|taxonomies)-([a-z-]+)-/) || [, 'other'])[1];
	for (const u of locs(await get(s))) if (!urls.has(u)) urls.set(u, kind);
}

const paths = [...urls.keys()].map((u) => u.replace(/^https?:\/\/[^/]+/, ''));
const kindOf = new Map([...urls].map(([u, k]) => [u.replace(/^https?:\/\/[^/]+/, ''), k]));
let resolve = 0;
const missing = [];
for (const p of paths) {
	let code = '000';
	try {
		const { stdout } = await run('curl', [
			'-sS',
			'-L',
			'-o',
			'/dev/null',
			'-w',
			'%{http_code}',
			'--max-time',
			'12',
			NEW + p
		]);
		code = stdout.trim();
	} catch {
		/* unreachable counts as missing, which is what a reader would experience */
	}
	if (code === '200') resolve++;
	else missing.push(p);
}

// The top-level pages are the ones alumni actually link. Counting them separately
// matters: 232 missing sounds like old social posts until you notice /about/ and
// /brotherhood/ are in there.
const topLevel = paths.filter((p) => kindOf.get(p) === 'page');
const topLevelMissing = missing.filter((p) => topLevel.includes(p));

const out = {
	checkedAt: new Date().toISOString(),
	sitemaps: subs.length,
	total: paths.length,
	resolve,
	missing: missing.length,
	topLevel: topLevel.length,
	topLevelMissing: topLevelMissing.length,
	notableMissing: topLevelMissing.slice(0, 8)
};
writeFileSync(join(REPO, 'src/lib/data/migration.json'), JSON.stringify(out, null, '\t') + '\n');
console.log(
	`  ${subs.length} sitemaps, ${paths.length} urls: ${resolve} resolve, ${missing.length} do not ` +
		`(${topLevelMissing.length} of ${topLevel.length} top-level pages missing)`
);
