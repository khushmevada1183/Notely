#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const outDir = path.join(root, '.build', 'minimal-benchmark');
const esbuild = require(path.join(root, 'node_modules-minimal', 'node_modules', 'esbuild'));

async function compileBenchmark() {
	fs.mkdirSync(outDir, { recursive: true });
	await esbuild.build({
		entryPoints: [path.join(root, 'test/performance/minimal-benchmark.ts')],
		outfile: path.join(outDir, 'minimal-benchmark.cjs'),
		bundle: true,
		platform: 'node',
		format: 'cjs',
		external: ['@playwright/test'],
		logLevel: 'silent',
	});
}

async function main() {
	await compileBenchmark();
	const result = spawnSync(process.execPath, [path.join(outDir, 'minimal-benchmark.cjs')], {
		cwd: root,
		stdio: 'inherit',
		env: { ...process.env, ELECTRON_DISABLE_SANDBOX: '1' },
	});
	process.exit(result.status ?? 1);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
