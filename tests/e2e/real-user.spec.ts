import { test, expect } from '@playwright/test';

/**
 * Test as a real user, against the real built artefact, in a real browser.
 *
 * These are the things a person actually does: arrive cold, skim for ninety
 * seconds, tab through with a keyboard, share the link, read it with images and
 * scripts misbehaving. Unit tests cannot see any of it.
 */

const PAGES = ['/', '/work/', '/resume/', '/blog/'];

test.describe('arriving cold', () => {
	for (const path of PAGES) {
		test(`${path} shows who this is, above the fold, as text`, async ({ page }) => {
			await page.goto(path);
			// Not a canvas, not an image: text a crawler and a screen reader can read.
			await expect(page.locator('h1')).toHaveCount(1);
			await expect(page.getByRole('link', { name: /PHINEAS FRITSCH/i })).toBeVisible();
			// The property is "this is not an empty SPA shell", not "this page is long".
			// A one-post index is legitimately short; asserting 400 characters here made
			// the guard cry wolf on a correct page, and a guard people mute protects
			// nothing. So: the h1 must actually be in the text, and there must be real
			// prose around it.
			const h1 = (await page.locator('h1').innerText()).trim();
			const text = await page.evaluate(() => document.body.innerText.trim());
			expect(text, `${path} does not contain its own headline`).toContain(h1);
			expect(text.length, `${path} rendered almost no text`).toBeGreaterThan(250);
		});
	}

	test('the homepage answers the four screening questions', async ({ page }) => {
		await page.goto('/');
		const text = await page.evaluate(() => document.body.innerText);
		// What is this person / what can they do / when are they available / what do they want.
		expect(text).toMatch(/actuarial/i);
		expect(text).toMatch(/UCLA/);
		expect(text).toMatch(/2027/);
		expect(text).toMatch(/contact@phineasfritsch\.com/);
	});

	test('every project links somewhere a skeptic can verify', async ({ page }) => {
		await page.goto('/work/');
		// Collect the hrefs once. Re-visiting /work/ between each project made this
		// fourteen extra navigations against a single preview server, which timed out
		// and looked exactly like a real failure.
		const hrefs = await page.evaluate(() =>
			[...document.querySelectorAll('.rows .row-title h3 a')].map((a) => a.getAttribute('href'))
		);
		expect(hrefs.length).toBeGreaterThanOrEqual(6);
		for (const href of hrefs) {
			// domcontentloaded, not load: the fonts come from fonts.googleapis.com and
			// the load event waits on them. Text is painted before that (display=swap),
			// so domcontentloaded is what a reader actually waits for, and waiting on
			// load here measures the font CDN rather than the site.
			await page.goto(href!, { waitUntil: 'domcontentloaded' });
			const body = await page.evaluate(() => document.body.innerText);
			// The two fields every project must carry. See ops/pins.json.
			expect(body, `${href} is missing its limitation`).toMatch(/What it does not do/i);
			expect(body, `${href} is missing its AI disclosure`).toMatch(/What an AI wrote/i);
		}
	});
});

test.describe('keyboard and screen reader', () => {
	test('the first tab stop is a working skip link', async ({ page }) => {
		await page.goto('/');
		await page.keyboard.press('Tab');
		const focused = page.locator(':focus');
		await expect(focused).toHaveText(/skip to content/i);
		await focused.press('Enter');
		await expect(page.locator('#main')).toBeVisible();
	});

	test('every page has exactly one main landmark and a labelled nav', async ({ page }) => {
		for (const path of PAGES) {
			await page.goto(path);
			await expect(page.getByRole('main')).toHaveCount(1);
			await expect(page.getByRole('navigation', { name: /primary/i })).toHaveCount(1);
		}
	});

	test('no link opens with an empty or ambiguous accessible name', async ({ page }) => {
		await page.goto('/');
		const bad = await page.evaluate(() =>
			[...document.querySelectorAll('a')]
				.filter((a) => !(a.textContent || '').trim() && !a.getAttribute('aria-label'))
				.map((a) => a.getAttribute('href'))
		);
		expect(bad).toEqual([]);
	});
});

test.describe('the page a link preview sees', () => {
	for (const path of PAGES) {
		test(`${path} has a title and description in the served html`, async ({ request }) => {
			const res = await request.get(path);
			expect(res.status()).toBe(200);
			const html = await res.text();
			// Read from the raw response, before any JavaScript runs. This is exactly
			// what a crawler, a Slack unfurl and an iMessage preview get.
			const title = html.match(/<title[^>]*>([^<]*)<\/title>/i)?.[1] ?? '';
			const desc = html.match(/<meta[^>]+name="description"[^>]+content="([^"]*)"/i)?.[1] ?? '';
			expect(title.length, `${path} has no title in the served html`).toBeGreaterThan(10);
			expect(desc.length, `${path} has no description in the served html`).toBeGreaterThan(40);
			const visible = html
				.replace(/<script[\s\S]*?<\/script>/gi, ' ')
				.replace(/<style[\s\S]*?<\/style>/gi, ' ')
				.replace(/<[^>]+>/g, ' ')
				.replace(/\s+/g, ' ')
				.trim();
			// Same reasoning as above: prove it is not a shell, not that it is long.
			expect(visible.length, `${path} is an empty shell without javascript`).toBeGreaterThan(250);
		});
	}
});

test.describe('honesty', () => {
	test('the homepage states the AI assistance without needing a click', async ({ page }) => {
		await page.goto('/');
		await expect(page.getByText(/an AI wrote most of the code/i)).toBeVisible();
	});

	test('no page claims an actuarial exam has been passed', async ({ page }) => {
		for (const path of ['/', '/resume/']) {
			await page.goto(path);
			const text = await page.evaluate(() => document.body.innerText);
			expect(text, `${path} must state that no exams are passed yet`).toMatch(
				/no exams passed yet/i
			);
			expect(text).not.toMatch(/passed exam/i);
		}
	});

	test('no page publishes the phone number or a revenue projection', async ({ page }) => {
		for (const path of PAGES) {
			await page.goto(path);
			const text = await page.evaluate(() => document.body.innerText);
			expect(text, `${path} leaks a phone number`).not.toMatch(/\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/);
			expect(text, `${path} makes an unproven revenue claim`).not.toMatch(
				/projected to (make|earn)|revenue of|\$\d+k? (in|over) /i
			);
		}
	});
});

test.describe('weight', () => {
	test('the homepage is readable quickly and does not ship the 3D scene', async ({ page }) => {
		const bytes: number[] = [];
		page.on('response', async (r) => {
			if (r.url().endsWith('.js')) {
				try {
					bytes.push((await r.body()).length);
				} catch {
					/* redirected or cached */
				}
			}
		});
		await page.goto('/', { waitUntil: 'domcontentloaded' });
		await page.waitForLoadState('networkidle').catch(() => {});
		const total = bytes.reduce((a, b) => a + b, 0);
		expect(total, 'the homepage got heavy again').toBeLessThan(300 * 1024);
	});
});
