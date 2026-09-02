import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['tests/**/*.spec.ts'],
		exclude: ['tests/e2e/**'],
		environment: 'node',
		reporters: ['default'],
		// The gate reads the count. Bail-on-first-failure hides the count, so never bail.
		bail: 0
	}
});
