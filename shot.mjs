import { chromium } from 'playwright';
const b = await chromium.launch();
const S =
	'/tmp/claude-0/-home-user-phineasfritsch-com/fcaf79f6-0832-5543-b33a-c863474d4338/scratchpad';
for (const [name, w, h] of [
	['desk', 1440, 900],
	['mob', 390, 844]
]) {
	const c = await b.newContext({
		viewport: { width: w, height: h },
		isMobile: w < 500,
		hasTouch: w < 500,
		deviceScaleFactor: 1
	});
	for (const [slug, path] of [
		['resume', '/resume/'],
		['answers', '/answers/'],
		['post', '/blog/reading-your-own-output/'],
		['dibs', '/work/dibs/']
	]) {
		const p = await c.newPage();
		await p.goto('http://localhost:8899' + path, { waitUntil: 'networkidle' });
		await p.screenshot({ path: `${S}/${name}-${slug}.png`, fullPage: true });
		const ow = await p.evaluate(() => ({
			scrollW: document.documentElement.scrollWidth,
			clientW: document.documentElement.clientWidth
		}));
		console.log(name, slug, JSON.stringify(ow));
		await p.close();
	}
	await c.close();
}
await b.close();
