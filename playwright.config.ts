import { defineConfig, devices } from '@playwright/test';

// Real browser, real built artefact, served the way production serves it.
// Testing the dev server would test a thing no visitor ever loads.
export default defineConfig({
	testDir: './tests/e2e',
	fullyParallel: true,
	reporter: 'line',
	timeout: 30_000,
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
				reuseExistingServer: true,
				timeout: 120_000
			}
});
