import { defineConfig, devices } from '@playwright/test';

// Real browser, real built artefact, served the way production serves it.
// Testing the dev server would test a thing no visitor ever loads.
export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: true,
	reporter: 'line',
	timeout: 60_000,
	// One preview server serves both projects. Unbounded workers starve it and
	// produce navigation timeouts that look exactly like real failures.
	workers: 4,
	use: {
		baseURL: process.env.TEST_BASE_URL ?? 'http://127.0.0.1:4173',
		// The browser is pre-installed in this image; never download another.
		launchOptions: { executablePath: process.env.CHROMIUM_PATH || undefined }
	},
	projects: [
		{ name: 'desktop', use: { ...devices['Desktop Chrome'] } },
		// A recruiter opens this on a phone, from LinkedIn, on cell data.
		{ name: 'mobile', use: { ...devices['Pixel 7'] } }
	],
	webServer: process.env.TEST_BASE_URL
		? undefined
		: {
				command: 'npx vite preview --port 4173 --strictPort',
				url: 'http://127.0.0.1:4173',
				// Never reuse a server someone else started. It may be serving an older
				// build, which produces a green suite over a stale artefact — the precise
				// failure this project exists to catch. Starting our own costs a second.
				reuseExistingServer: false,
				timeout: 120_000
			}
});
