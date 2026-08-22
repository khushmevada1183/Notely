#!/usr/bin/env node
/**
 * Standalone Minimal Editor build (no VS Code gulp).
 * Usage: node build/minimal-build.cjs [clean|compile|copy|all]
 */
const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');
const { rimrafSync } = require('rimraf');

const root = path.join(__dirname, '..');
const config = require('./minimal.config.cjs');
const outDir = path.join(root, config.output.dir);
const isProd = process.env.MINIMAL_PRODUCTION === '1';
const pkg = require(path.join(root, 'package.json'));

function getMonacoEditorRoot() {
	const a = path.join(root, 'node_modules', 'monaco-editor');
	if (fs.existsSync(a)) return a;
	const b = path.join(root, 'node_modules-minimal', 'node_modules', 'monaco-editor');
	if (fs.existsSync(b)) return b;
	return a;
}

const MONACO_WORKERS = [
	{ entry: 'esm/vs/editor/editor.worker.js', out: 'vs/editor/editor.worker.js' },
	{ entry: 'esm/vs/language/json/json.worker.js', out: 'vs/language/json/json.worker.js' },
	{ entry: 'esm/vs/language/css/css.worker.js', out: 'vs/language/css/css.worker.js' },
	{ entry: 'esm/vs/language/html/html.worker.js', out: 'vs/language/html/html.worker.js' },
	{ entry: 'esm/vs/language/typescript/ts.worker.js', out: 'vs/language/typescript/ts.worker.js' },
];

function outfileName(name) {
	if (name === 'main') return 'minimal-main.js';
	if (name === 'renderer') return 'minimal-renderer.js';
	return 'minimal-preload.js';
}

async function bundleMonacoWorkers(monacoEditorRoot) {
	if (!fs.existsSync(monacoEditorRoot)) return;
	await Promise.all(MONACO_WORKERS.map(async ({ entry, out }) => {
		const entryPath = path.join(monacoEditorRoot, entry);
		if (!fs.existsSync(entryPath)) return;
		const outfile = path.join(outDir, out);
		fs.mkdirSync(path.dirname(outfile), { recursive: true });
		await esbuild.build({
			entryPoints: [entryPath],
			outfile,
			bundle: true,
			platform: 'browser',
			format: 'iife',
			minify: isProd,
			sourcemap: !isProd,
			treeShaking: true,
			drop: isProd ? ['console'] : [],
			logLevel: 'silent',
		});
	}));
}

async function compile() {
	const monacoEditorRoot = getMonacoEditorRoot();
	for (const [name, entry] of Object.entries(config.entryPoints)) {
		const isRenderer = name === 'renderer';
		await esbuild.build({
			entryPoints: [path.join(root, entry)],
			outfile: path.join(outDir, outfileName(name)),
			bundle: true,
			platform: name === 'main' || name === 'preload' ? 'node' : 'browser',
			format: 'cjs',
			external: config.external,
			alias: isRenderer && fs.existsSync(monacoEditorRoot) ? {
				'monaco-editor': path.join(monacoEditorRoot, 'esm/vs/editor/editor.main.js'),
			} : undefined,
			loader: isRenderer ? { '.ttf': 'file', '.svg': 'file', '.png': 'file', '.css': 'empty' } : undefined,
			assetNames: isRenderer ? 'assets/[name]' : undefined,
			minify: isProd,
			sourcemap: !isProd,
			treeShaking: true,
			drop: isProd ? ['console'] : [],
			logLevel: 'info',
		});
	}
	await bundleMonacoWorkers(monacoEditorRoot);
}

function copyResources() {
	const { electron: _e, ...runtimeDeps } = pkg.dependencies || {};
	const appPkg = {
		name: pkg.name,
		version: pkg.version,
		main: 'minimal-main.js',
		type: 'commonjs',
		dependencies: runtimeDeps,
	};
	fs.writeFileSync(path.join(outDir, 'package.json'), JSON.stringify(appPkg, null, 2));
	const resourcesSrc = path.join(root, 'resources');
	if (fs.existsSync(resourcesSrc)) {
		fs.cpSync(resourcesSrc, path.join(outDir, 'resources'), { recursive: true });
	}
	const monacoMin = path.join(getMonacoEditorRoot(), 'min', 'vs');
	if (fs.existsSync(monacoMin)) {
		fs.cpSync(monacoMin, path.join(outDir, 'vs'), { recursive: true });
	}
}

function clean() {
	rimrafSync(outDir);
}

async function main() {
	const cmd = process.argv[2] || 'all';
	if (cmd === 'clean') { clean(); return; }
	if (cmd === 'compile') { await compile(); return; }
	if (cmd === 'copy') { copyResources(); return; }
	if (cmd === 'all') {
		clean();
		await compile();
		copyResources();
		console.log('Build complete:', outDir);
		return;
	}
	console.error('Usage: node build/minimal-build.cjs [clean|compile|copy|all]');
	process.exit(1);
}

main().catch(err => { console.error(err); process.exit(1); });
