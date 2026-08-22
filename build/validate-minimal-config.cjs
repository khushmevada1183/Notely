#!/usr/bin/env node

/**
 * Validation script for minimal.config.js
 */

const path = require('path');
const fs = require('fs');

const configPath = path.join(__dirname, 'minimal.config.cjs');

console.log('Validating build configuration...');
console.log('Config file path:', configPath);

// Check if file exists
if (!fs.existsSync(configPath)) {
	console.error('ERROR: Configuration file not found');
	process.exit(1);
}

// Load the configuration
let config;
try {
	// Clear cache to ensure fresh load
	delete require.cache[require.resolve(configPath)];
	config = require(configPath);
	console.log('\n✓ Configuration file loaded successfully');
} catch (error) {
	console.error('ERROR: Failed to load configuration:', error.message);
	process.exit(1);
}

// Validate configuration structure
const errors = [];
const warnings = [];

// Check required properties
if (!config.entryPoints) {
	errors.push('Missing required property: entryPoints');
} else {
	if (!config.entryPoints.main) {
		errors.push('Missing entry point: main');
	}
	if (!config.entryPoints.renderer) {
		errors.push('Missing entry point: renderer');
	}
	if (!config.entryPoints.preload) {
		errors.push('Missing entry point: preload');
	}
	console.log('✓ Entry points defined:', Object.keys(config.entryPoints).join(', '));
}

if (!config.output) {
	errors.push('Missing required property: output');
} else {
	if (!config.output.dir) {
		errors.push('Missing output.dir');
	}
	if (!config.output.format) {
		warnings.push('Missing output.format (recommended: cjs for Electron)');
	}
	console.log('✓ Output directory:', config.output.dir);
	console.log('✓ Output format:', config.output.format);
}

if (!config.external || !Array.isArray(config.external)) {
	warnings.push('external should be an array of dependencies');
} else {
	const requiredExternal = ['electron', 'fs', 'path'];
	const missingExternal = requiredExternal.filter(dep => !config.external.includes(dep));
	if (missingExternal.length > 0) {
		warnings.push('Consider adding to external: ' + missingExternal.join(', '));
	}
	console.log('✓ External dependencies:', config.external.join(', '));
}

if (!config.bundle) {
	warnings.push('No bundle configuration specified');
} else {
	console.log('✓ Bundle configuration:');
	console.log('  - Monaco:', config.bundle.monaco);
	console.log('  - Themes:', config.bundle.themes);
	console.log('  - Grammars:', config.bundle.grammars);
}

// Print summary
console.log('\n=== Validation Summary ===');
if (errors.length === 0 && warnings.length === 0) {
	console.log('✓ Configuration is VALID');
	console.log('✓ All required properties are present');
	console.log('✓ Entry points are correctly specified');
	console.log('✓ Output directory and format are defined');
	console.log('✓ External dependencies are properly listed');
	process.exit(0);
} else {
	if (errors.length > 0) {
		console.error('\nERRORS:');
		errors.forEach(err => console.error('  ✗', err));
	}
	if (warnings.length > 0) {
		console.warn('\nWARNINGS:');
		warnings.forEach(warn => console.warn('  ⚠', warn));
	}
	process.exit(errors.length > 0 ? 1 : 0);
}
