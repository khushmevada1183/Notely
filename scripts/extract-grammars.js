#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'resources', 'grammars');
const extensionsDir = path.join(root, 'extensions');

function loadLanguageScopeMap() {
	const src = fs.readFileSync(path.join(root, 'src/language-scope-map.ts'), 'utf8');
	const map = {};
	for (const match of src.matchAll(/(\w+):\s*'([^']+)'/g)) {
		map[match[1]] = match[2];
	}
	return map;
}

function scopeToFile(scopeName) {
	return `${scopeName}.json`;
}

function resolveOnigasmWasm() {
	const candidates = [
		path.join(root, 'node_modules', 'onigasm', 'lib', 'onigasm.wasm'),
		path.join(root, 'node_modules-minimal', 'node_modules', 'onigasm', 'lib', 'onigasm.wasm'),
	];
	for (const candidate of candidates) {
		if (fs.existsSync(candidate)) {
			return candidate;
		}
	}
	return null;
}

const scopeToGrammar = new Map();
for (const ext of fs.readdirSync(extensionsDir)) {
	const extDir = path.join(extensionsDir, ext);
	const pkgPath = path.join(extDir, 'package.json');
	if (!fs.existsSync(pkgPath)) {
		continue;
	}
	const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
	const grammars = (pkg.contributes && pkg.contributes.grammars) || [];
	for (const grammar of grammars) {
		if (!grammar.scopeName || !grammar.path || !grammar.path.endsWith('.json')) {
			continue;
		}
		if (!scopeToGrammar.has(grammar.scopeName)) {
			scopeToGrammar.set(grammar.scopeName, {
				extDir,
				grammarPath: grammar.path.replace(/^\.\//, ''),
			});
		}
	}
}

const languageToScope = loadLanguageScopeMap();
const manifest = [];
const copiedFiles = new Set();

fs.mkdirSync(outDir, { recursive: true });

for (const [languageId, scopeName] of Object.entries(languageToScope)) {
	const info = scopeToGrammar.get(scopeName);
	if (!info) {
		console.warn(`Missing grammar for ${languageId} (${scopeName})`);
		continue;
	}
	const src = path.join(info.extDir, info.grammarPath);
	if (!fs.existsSync(src)) {
		console.warn(`Grammar file not found: ${src}`);
		continue;
	}
	const file = scopeToFile(scopeName);
	const dest = path.join(outDir, file);
	if (!copiedFiles.has(file)) {
		fs.copyFileSync(src, dest);
		copiedFiles.add(file);
	}
	manifest.push({ languageId, scopeName, file });
}

const onigasmSrc = resolveOnigasmWasm();
if (onigasmSrc) {
	fs.copyFileSync(onigasmSrc, path.join(outDir, 'onigasm.wasm'));
} else {
	console.warn('onigasm.wasm not found; install onigasm before building');
}

manifest.sort((a, b) => a.languageId.localeCompare(b.languageId));
fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, '\t'));

console.log(`Extracted ${copiedFiles.size} grammar files for ${manifest.length} languages`);
