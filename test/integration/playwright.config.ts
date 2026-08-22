import { defineConfig } from '@playwright/test';

export default defineConfig({
	testDir: '.',
	testMatch: 'minimal-editor.spec.ts',
	timeout: 60_000,
	retries: 0,
	use: {
		trace: 'retain-on-failure',
	},
});
