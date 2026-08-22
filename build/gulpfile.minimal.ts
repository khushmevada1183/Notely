/*---------------------------------------------------------------------------------------------
 *  Minimal Editor build tasks
 *--------------------------------------------------------------------------------------------*/

import * as esbuild from 'esbuild';
import * as fs from 'fs';
import { createRequire } from 'node:module';
import * as path from 'path';
import * as task from './lib/gulp/task.ts';
import * as util from './lib/util.ts';

const require = createRequire(import.meta.url);
const root = path.dirname(import.meta.dirname);
const config = require('./minimal.config.cjs');

const outDir = path.join(root, config.output.dir);

function getMonacoEditorRoot(): string {
	const rootMonaco = path.join(root, 'node_modules', 'monaco-editor');
	if (fs.existsSync(rootMonaco)) {
		return rootMonaco;
	}
	return path.join(root, 'node_modules-minimal', 'node_modules', 'monaco-editor');
}

const MONACO_WORKERS = [
	{ entry: 'esm/vs/editor/editor.worker.js', out: 'vs/editor/editor.worker.js' },
	{ entry: 'esm/vs/language/json/json.worker.js', out: 'vs/language/json/json.worker.js' },
	{ entry: 'esm/vs/language/css/css.worker.js', out: 'vs/language/css/css.worker.js' },
	{ entry: 'esm/vs/language/html/html.worker.js', out: 'vs/language/html/html.worker.js' },
	{ entry: 'esm/vs/language/typescript/ts.worker.js', out: 'vs/language/typescript/ts.worker.js' },
];

async function bundleMonacoWorkers(monacoEditorRoot: string): Promise<void> {
	if (!fs.existsSync(monacoEditorRoot)) {
		return;
	}
	await Promise.all(MONACO_WORKERS.map(async ({ entry, out }) => {
		const entryPath = path.join(monacoEditorRoot, entry);
		if (!fs.existsSync(entryPath)) {
			return;
		}
		const outfile = path.join(outDir, out);
		fs.mkdirSync(path.dirname(outfile), { recursive: true });
		await esbuild.build({
			entryPoints: [entryPath],
			outfile,
			bundle: true,
			platform: 'browser',
			format: 'iife',
			logLevel: 'silent',
		});
	}));
}

const compileMinimalTask = task.define('compile-minimal', async () => {
	const monacoEditorRoot = getMonacoEditorRoot();
	const entryPoints = Object.entries(config.entryPoints as Record<string, string>);
	await Promise.all(entryPoints.map(async ([name, entry]) => {
		const isRenderer = name === 'renderer';
		await esbuild.build({
			entryPoints: [path.join(root, entry as string)],
			outfile: path.join(outDir, `${name === 'main' ? 'minimal-main' : name === 'renderer' ? 'minimal-renderer' : 'minimal-preload'}.js`),
			bundle: true,
			platform: name === 'main' || name === 'preload' ? 'node' : 'browser',
			format: 'cjs',
			external: config.external,
			alias: isRenderer && fs.existsSync(monacoEditorRoot) ? {
				'monaco-editor': path.join(monacoEditorRoot, 'esm/vs/editor/editor.main.js'),
			} : undefined,
			loader: isRenderer ? {
				'.ttf': 'file',
				'.svg': 'file',
				'.png': 'file',
				'.css': 'empty',
			} : undefined,
			assetNames: isRenderer ? 'assets/[name]' : undefined,
			sourcemap: true,
			logLevel: 'info',
		});
	}));
	await bundleMonacoWorkers(monacoEditorRoot);
});

const copyMinimalResourcesTask = task.define('copy-minimal-resources', () => {
	// CJS bundles; root package.json is ESM — scope CommonJS to out-minimal only
	fs.writeFileSync(path.join(outDir, 'package.json'), JSON.stringify({ type: 'commonjs' }, null, 2));
	const resourcesSrc = path.join(root, 'resources');
	const resourcesDest = path.join(outDir, 'resources');
	if (fs.existsSync(resourcesSrc)) {
		// includes resources/themes/ (run scripts/extract-themes.js to populate)
		fs.cpSync(resourcesSrc, resourcesDest, { recursive: true });
	}
	const monacoWorkers = path.join(getMonacoEditorRoot(), 'min', 'vs');
	if (fs.existsSync(monacoWorkers)) {
		fs.cpSync(monacoWorkers, path.join(outDir, 'vs'), { recursive: true });
	}
});

const cleanMinimalTask = task.define('clean-minimal', util.rimraf(outDir));

task.task(compileMinimalTask);
task.task(copyMinimalResourcesTask);
task.task(cleanMinimalTask);
task.task(task.define('build-minimal', task.series(cleanMinimalTask, compileMinimalTask, copyMinimalResourcesTask)));
