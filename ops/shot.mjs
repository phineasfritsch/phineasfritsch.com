import { chromium } from '@playwright/test';
const routes = ['/', '/ucla/', '/theta-chi/', '/sailing/', '/future/', '/blog/'];
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH });
for (const dev of [{ n: 'desktop', v: { width: 1440, height: 900 } }, { n: 'mobile', v: { width: 390, height: 844 } }]) {
	const ctx = await b.newContext({ viewport: dev.v, deviceScaleFactor: 1 });
	const p = await ctx.newPage();
	const errs = [];
	p.on('console', (m) => m.type() === 'error' && errs.push(m.text().slice(0, 200)));
	p.on('pageerror', (e) => errs.push('PAGEERROR ' + String(e).slice(0, 200)));
	for (const r of routes) {
		const t0 = Date.now();
		await p.goto('http://127.0.0.1:4173' + r, { waitUntil: 'networkidle', timeout: 30000 }).catch((e) => errs.push(r + ' NAV ' + e.message.slice(0, 120)));
		await p.waitForTimeout(2500);
		const name = 'ops/shots/' + dev.n + (r === '/' ? '-home' : '-' + r.replace(/\//g, '')) + '.png';
		await p.screenshot({ path: name, fullPage: dev.n === 'desktop' });
		const text = await p.evaluate(() => document.body.innerText.replace(/\s+/g, ' ').trim());
		console.log(`${dev.n} ${r.padEnd(14)} ${Date.now() - t0}ms  textchars=${text.length}  "${text.slice(0, 90)}"`);
	}
	if (errs.length) console.log(`  ${dev.n} console errors: ${[...new Set(errs)].slice(0, 6).join(' | ')}`);
	await ctx.close();
}
await b.close();
