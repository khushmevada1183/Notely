/**
 * Minimal Editor performance benchmarks.
 * Run: npm run minimal:benchmark
 */
import { _electron as electron } from '@playwright/test';
import fs from 'fs';
import os from 'os';
import path from 'path';

const root = process.cwd();
const mainJs = path.join(root, 'out-minimal/minimal-main.js');
const defaultElectron = path.join(root, 'node_modules-minimal/node_modules/electron/dist/electron');
const electronPath = process.env.MINIMAL_ELECTRON_PATH ?? defaultElectron;

export interface BenchmarkResult {
	startupMs: number;
	memoryEmptyMb: number;
	memory10kLinesMb: number;
	open1MbMs: number;
	themeSwitchMs: number;
}

function requireBuild(): void {
	if (!fs.existsSync(mainJs)) {
		throw new Error(`Missing build output: ${mainJs}. Run npm run minimal:build first.`);
	}
	if (!fs.existsSync(electronPath)) {
		throw new Error(`Missing Electron binary: ${electronPath}`);
	}
}

function kbToMb(kb: number): number {
	return Math.round((kb / 1024) * 10) / 10;
}

function make10kLines(): string {
	return Array.from({ length: 10_000 }, (_, i) => `// line ${i + 1}`).join('\n');
}

function make1MbContent(): string {
	const line = '// benchmark line with padding to reach ~1MB total\n';
	const targetBytes = 1024 * 1024;
	const repeat = Math.ceil(targetBytes / Buffer.byteLength(line, 'utf8'));
	return line.repeat(repeat);
}

async function launchApp() {
	return electron.launch({
		executablePath: electronPath,
		args: ['--no-sandbox', mainJs],
		timeout: 30_000,
	});
}

type Page = Awaited<ReturnType<Awaited<ReturnType<typeof launchApp>>['firstWindow']>>;

async function waitForEditor(page: Page): Promise<void> {
	await page.locator('#container').waitFor({ state: 'visible', timeout: 15_000 });
	await page.locator('.monaco-editor').waitFor({ state: 'visible', timeout: 15_000 });
	await page.waitForTimeout(500);
}

async function getMemoryMb(page: Page): Promise<number> {
	const info = await page.evaluate(async () => {
		return window.electronAPI.invoke('debug:memory') as Promise<{ rssKb: number }>;
	});
	return kbToMb(info.rssKb);
}

async function openFilePath(page: Page, filePath: string): Promise<void> {
	await page.evaluate(async (targetPath) => {
		await window.electronAPI.invoke('debug:openPath', targetPath);
	}, filePath);
	await page.waitForTimeout(200);
}

async function switchThemeViaMenu(page: Page): Promise<void> {
	await page.keyboard.press('Alt');
	await page.getByRole('menuitem', { name: 'View' }).click({ timeout: 5000 }).catch(() => undefined);
	await page.getByRole('menuitem', { name: 'Select Theme' }).click({ timeout: 5000 }).catch(() => undefined);
	const firstTheme = page.locator('.theme-item, [data-theme-id]').first();
	if (await firstTheme.count()) {
		await firstTheme.click();
		return;
	}
	await page.keyboard.press('Escape');
}

export async function runBenchmarks(): Promise<BenchmarkResult> {
	requireBuild();

	const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'minimal-bench-'));
	const file10k = path.join(tmpDir, 'lines-10k.js');
	const file1Mb = path.join(tmpDir, 'bench-1mb.js');
	fs.writeFileSync(file10k, make10kLines(), 'utf8');
	fs.writeFileSync(file1Mb, make1MbContent(), 'utf8');

	const start = Date.now();
	const app = await launchApp();
	const page = await app.firstWindow();
	await waitForEditor(page);
	const startupMs = Date.now() - start;

	const memoryEmptyMb = await getMemoryMb(page);

	await openFilePath(page, file10k);
	const memory10kLinesMb = await getMemoryMb(page);

	const openStart = Date.now();
	await openFilePath(page, file1Mb);
	const open1MbMs = Date.now() - openStart;

	const themeStart = Date.now();
	await switchThemeViaMenu(page);
	await page.waitForTimeout(50);
	const themeSwitchMs = Date.now() - themeStart;

	await app.close();
	fs.rmSync(tmpDir, { recursive: true, force: true });

	return { startupMs, memoryEmptyMb, memory10kLinesMb, open1MbMs, themeSwitchMs };
}

async function main(): Promise<void> {
	try {
		const result = await runBenchmarks();
		console.log(JSON.stringify(result, null, 2));
	} catch (err) {
		console.error('Benchmark failed:', err);
		process.exit(1);
	}
}

if (require.main === module) {
	void main();
}
