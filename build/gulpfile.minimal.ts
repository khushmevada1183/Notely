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

const compileMinimalTask = task.define('compile-minimal', async () => {
	const entryPoints = Object.entries(config.entryPoints as Record<string, string>);
	await Promise.all(entryPoints.map(async ([name, entry]) => {
		await esbuild.build({
			entryPoints: [path.join(root, entry as string)],
			outfile: path.join(outDir, `${name === 'main' ? 'minimal-main' : name === 'renderer' ? 'minimal-renderer' : 'minimal-preload'}.js`),
			bundle: true,
			platform: name === 'main' || name === 'preload' ? 'node' : 'browser',
			format: 'cjs',
			external: config.external,
			sourcemap: true,
			logLevel: 'info',
		});
	}));
});

const copyMinimalResourcesTask = task.define('copy-minimal-resources', () => {
	// CJS bundles; root package.json is ESM — scope CommonJS to out-minimal only
	fs.writeFileSync(path.join(outDir, 'package.json'), JSON.stringify({ type: 'commonjs' }, null, 2));
	const resourcesSrc = path.join(root, 'resources');
	const resourcesDest = path.join(outDir, 'resources');
	if (fs.existsSync(resourcesSrc)) {
		fs.cpSync(resourcesSrc, resourcesDest, { recursive: true });
	}
	const monacoWorkers = path.join(root, 'node_modules', 'monaco-editor', 'min', 'vs');
	if (fs.existsSync(monacoWorkers)) {
		fs.cpSync(monacoWorkers, path.join(outDir, 'vs'), { recursive: true });
	}
});

const cleanMinimalTask = task.define('clean-minimal', util.rimraf(outDir));

task.task(compileMinimalTask);
task.task(copyMinimalResourcesTask);
task.task(cleanMinimalTask);
task.task(task.define('build-minimal', task.series(cleanMinimalTask, compileMinimalTask, copyMinimalResourcesTask)));
