#!/usr/bin/env node
/**
 * Publish the prerendered /not-found/ page as build/404.html.
 *
 * Cloudflare Pages serves /404.html — with a real 404 status — for a request
 * that matches no asset. SvelteKit's own 404 mechanism is a client-side shell,
 * which would hand a reader without JavaScript a blank page, so the route is an
 * ordinary prerendered page and this copies it into place.
 */
import { copyFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { REPO } from './lib.mjs';

const src = join(REPO, 'build/not-found/index.html');
const dest = join(REPO, 'build/404.html');

if (!existsSync(src)) {
	console.error('postbuild: build/not-found/index.html is missing — did the route prerender?');
	process.exit(1);
}
copyFileSync(src, dest);
console.log('postbuild: wrote build/404.html');
