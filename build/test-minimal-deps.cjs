#!/usr/bin/env node
const pkg = require('../package.json');
const depCount = Object.keys(pkg.dependencies || {}).length;
const devCount = Object.keys(pkg.devDependencies || {}).length;
const total = depCount + devCount;
console.log('Dependency count:', total);
if (total > 25) {
	console.error('FAIL: too many dependencies', total);
	process.exit(1);
}
if (depCount !== 5) {
	console.error('FAIL: expected 5 runtime deps, got', depCount);
	process.exit(1);
}
console.log('PASS');
process.exit(0);
