#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'resources', 'themes');
const extensionsDir = path.join(root, 'extensions');
const manifest = [];

function resolveNls(value, nls) {
	if (typeof value === 'string' && value.startsWith('%') && value.endsWith('%')) {
		return nls[value.slice(1, -1)] || value;
	}
	return value;
}

fs.mkdirSync(outDir, { recursive: true });

for (const ext of fs.readdirSync(extensionsDir)) {
	if (!ext.startsWith('theme-')) continue;
	const extDir = path.join(extensionsDir, ext);
	const themesDir = path.join(extDir, 'themes');
	if (!fs.existsSync(themesDir)) continue;

	const pkg = JSON.parse(fs.readFileSync(path.join(extDir, 'package.json'), 'utf8'));
	const nlsPath = path.join(extDir, 'package.nls.json');
	const nls = fs.existsSync(nlsPath) ? JSON.parse(fs.readFileSync(nlsPath, 'utf8')) : {};
	const contributes = (pkg.contributes && pkg.contributes.themes) || [];

	for (const file of fs.readdirSync(themesDir)) {
		if (!file.endsWith('.json')) continue;
		const src = path.join(themesDir, file);
		const id = `${ext}-${path.basename(file, '.json')}`;
		const dest = path.join(outDir, `${id}.json`);
		fs.copyFileSync(src, dest);

		const relPath = `./themes/${file}`;
		const entry = contributes.find(t => t.path === relPath || t.path === `themes/${file}`);
		const label = entry ? (resolveNls(entry.label, nls) || entry.id || id) : id;
		const uiTheme = entry?.uiTheme || 'vs-dark';
		manifest.push({ id, label, uiTheme, path: `${id}.json` });
	}
}

fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Extracted ${manifest.length} themes`);
