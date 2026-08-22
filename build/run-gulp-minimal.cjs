#!/usr/bin/env node
const { spawnSync } = require('child_process');
const path = require('path');

const taskName = process.argv[2];
if (!taskName) {
	console.error('Usage: node build/run-gulp-minimal.cjs <task>');
	process.exit(1);
}

const result = spawnSync('npm', ['run', 'gulp', '--', taskName], {
	stdio: 'inherit',
	cwd: path.join(__dirname, '..'),
	shell: true,
});
process.exit(result.status ?? 1);
