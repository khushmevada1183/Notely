import { test, expect, _electron as electron } from '@playwright/test';
import fs from 'fs';
import { mkdtempSync, readFileSync } from 'fs';
import os from 'os';
import path from 'path';

const root = process.cwd();
const mainJs = path.join(root, 'out-minimal/minimal-main.js');
const defaultElectron = path.join(root, 'node_modules-minimal/node_modules/electron/dist/electron');
const electronPath = process.env.MINIMAL_ELECTRON_PATH ?? defaultElectron;

function getSkipReason(): string | undefined {
	if (!fs.existsSync(path.join(root, 'node_modules/@playwright/test'))) {
		return 'Playwright not installed';
	}
	if (!fs.existsSync(mainJs)) {
		return `Build output missing: ${mainJs}`;
	}
	if (!fs.existsSync(electronPath)) {
		return `Electron binary missing: ${electronPath}`;
	}
	return undefined;
}

const skipReason = getSkipReason();

async function launchApp() {
	return electron.launch({
		executablePath: electronPath,
		args: [mainJs],
		timeout: 30_000,
	});
}

test.describe('Notely integration', () => {
	test.beforeEach(({}, testInfo) => {
		test.skip(!!skipReason, skipReason);
	});

	test('opens window and types in editor', async () => {
		const app = await launchApp();
		try {
			const page = await app.firstWindow();
			await expect(page.locator('#container')).toBeVisible({ timeout: 15_000 });
			await page.locator('.monaco-editor').click({ timeout: 10_000 });
			await page.keyboard.type('hello minimal');
			await expect(page.locator('.view-lines')).toContainText('hello minimal', { timeout: 5_000 });
		} finally {
			await app.close();
		}
	});

	test('file save workflow', async () => {
		const tmpDir = mkdtempSync(path.join(os.tmpdir(), 'minimal-editor-test-'));
		const filePath = path.join(tmpDir, 'sample.js');

		const app = await launchApp();
		try {
			const page = await app.firstWindow();
			await expect(page.locator('#container')).toBeVisible({ timeout: 15_000 });
			await page.locator('.monaco-editor').click({ timeout: 10_000 });
			await page.keyboard.type('console.log("save test");\n');

			const content = 'console.log("save test");\n// saved\n';
			await page.evaluate(async ({ targetPath, text }) => {
				await window.electronAPI.invoke('file:save', { path: targetPath, content: text });
			}, { targetPath: filePath, text: content });

			await page.waitForTimeout(250);
			const saved = readFileSync(filePath, 'utf8');
			expect(saved).toBe(content);
		} finally {
			await app.close();
		}
	});
});
