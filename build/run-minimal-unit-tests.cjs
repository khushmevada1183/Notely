#!/usr/bin/env node
'use strict';

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const outDir = path.join(root, '.build', 'minimal-unit-tests');
const esbuild = require(path.join(root, 'node_modules-minimal', 'node_modules', 'esbuild'));
const electronStub = path.join(__dirname, 'minimal-test-stubs', 'electron.cjs');

const TEST_FILES = [
	'test/unit/config.test.ts',
	'test/unit/minimal-config.test.ts',
	'test/unit/minimal-file-service.test.ts',
	'test/unit/language-detection.test.ts',
	'test/unit/theme-converter.test.ts',
	'test/unit/error-handler.test.ts',
	'test/unit/window-bounds.test.ts',
	'test/unit/editor-preferences.test.ts',
];

const GREP = 'minimal-config|minimal-file-service|language-detection|theme-converter|error-handler|window-bounds|editor-preferences|config';

async function compileTests() {
	fs.mkdirSync(outDir, { recursive: true });
	for (const testFile of TEST_FILES) {
		const name = path.basename(testFile, '.test.ts');
		await esbuild.build({
			entryPoints: [path.join(root, testFile)],
			outfile: path.join(outDir, `${name}.test.cjs`),
			bundle: true,
			platform: 'node',
			format: 'cjs',
			external: ['assert'],
			alias: { electron: electronStub },
			logLevel: 'silent',
		});
	}
}

async function main() {
	await compileTests();
	const mochaBin = path.join(root, 'node_modules', '.bin', 'mocha');
	const result = spawnSync(
		mochaBin,
		[`${outDir}/*.test.cjs`, '--grep', GREP, '--ui', 'tdd', '--timeout', '5000', '--exit'],
		{ cwd: root, stdio: 'inherit', shell: false },
	);
	process.exit(result.status ?? 1);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
