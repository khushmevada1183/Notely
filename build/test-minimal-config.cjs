#!/usr/bin/env node

/**
 * Comprehensive test for minimal.config.cjs
 * Validates all requirements from Task 1
 */

const fs = require('fs');
const path = require('path');
const config = require('./minimal.config.cjs');

console.log('=== Testing Minimal Build Configuration ===\n');

let passed = 0;
let failed = 0;

function test(description, assertion) {
	try {
		if (assertion()) {
			console.log('✓', description);
			passed++;
		} else {
			console.error('✗', description);
			failed++;
		}
	} catch (error) {
		console.error('✗', description, '(Error:', error.message + ')');
		failed++;
	}
}

// Test 1: Configuration includes correct entry points
console.log('1. Entry Points:');
test('  Main entry point is defined', () => config.entryPoints?.main === 'src/minimal-main.ts');
test('  Renderer entry point is defined', () => config.entryPoints?.renderer === 'src/minimal-renderer.ts');
test('  Preload entry point is defined', () => config.entryPoints?.preload === 'src/minimal-preload.ts');

// Test 2: Output directory and format settings
console.log('\n2. Output Settings:');
test('  Output directory is specified', () => config.output?.dir === 'out-minimal');
test('  Output format is CommonJS', () => config.output?.format === 'cjs');

// Test 3: External dependencies are properly specified
console.log('\n3. External Dependencies:');
test('  External is an array', () => Array.isArray(config.external));
test('  Electron is marked as external', () => config.external?.includes('electron'));
test('  Node fs module is marked as external', () => config.external?.includes('fs'));
test('  Node path module is marked as external', () => config.external?.includes('path'));
test('  Node crypto module is marked as external', () => config.external?.includes('crypto'));
test('  Node os module is marked as external', () => config.external?.includes('os'));

// Test 4: Bundle configuration
console.log('\n4. Bundle Configuration:');
test('  Monaco bundling is enabled', () => config.bundle?.monaco === true);
test('  Theme bundling is enabled', () => config.bundle?.themes === true);
test('  Grammar bundling is enabled', () => config.bundle?.grammars === true);

// Test 5: Gulp tasks and package scaffolding
console.log('\n5. Gulp Tasks:');
test('  gulpfile.minimal.ts exists', () => fs.existsSync(path.join(__dirname, 'gulpfile.minimal.ts')));
test('  package-minimal.json exists', () => fs.existsSync(path.join(__dirname, '..', 'package-minimal.json')));

// Summary
console.log('\n=== Test Summary ===');
console.log('Passed:', passed);
console.log('Failed:', failed);

if (failed === 0) {
	console.log('\n✓ All tests passed! Configuration is valid.');
	process.exit(0);
} else {
	console.error('\n✗ Some tests failed. Please review the configuration.');
	process.exit(1);
}
