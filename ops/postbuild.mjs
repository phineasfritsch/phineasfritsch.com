#!/usr/bin/env node
/**
 * Publish the prerendered /not-found/ page as build/404.html.
 *
 * Cloudflare Pages serves /404.html — with a real 404 status — for a request
 * that matches no asset. SvelteKit's own 404 mechanism is a client-side shell,
 * which would hand a reader without JavaScript a blank page, so the route is an
 * ordinary prerendered page and this copies it into place.
 */
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { REPO } from './lib.mjs';

const src = join(REPO, 'build/not-found/index.html');
const dest = join(REPO, 'build/404.html');

if (!existsSync(src)) {
	console.error('postbuild: build/not-found/index.html is missing — did the route prerender?');
	process.exit(1);
}
// Absolute asset paths, not the relative ones SvelteKit prerendered.
//
// /404.html is served for a request at ANY depth, but it is a byte copy of a page
// that lived at /not-found/, so its links read ../_app/... — which resolves to
// /_app/... only for a one-segment URL. A visitor mistyping anything under /work/
// or /blog/ (the two directories every shared and indexed deep link points into)
// got the right words in Times New Roman with the nav run together as
// "indexworkquestionsresumewriting". The gate could not see it because read-prod
// probed exactly one path, at the one depth where the relative path happens to work.
const html = readFileSync(src, 'utf8').replace(/(["'(])\.\.\/(_app\/|favicon|fonts\/)/g, '$1/$2');
if (html.includes('../_app/')) {
	console.error('postbuild: some ../_app/ references survived the rewrite');
	process.exit(1);
}
writeFileSync(dest, html);
console.log('postbuild: wrote build/404.html with absolute asset paths');
