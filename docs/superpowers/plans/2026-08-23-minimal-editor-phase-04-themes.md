# Minimal Editor Phase 4: Theme System — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Bundle VS Code built-in themes, convert to Monaco format, apply on startup, persist selection, simple theme picker UI.

**Architecture:** Build-time extraction to `resources/themes/`; runtime `theme-service.ts` loads JSON; `theme-converter.ts` maps to Monaco; overlay `theme-selector.ts`.

**Tech Stack:** Node fs, Monaco `defineTheme`/`setTheme`, DOM overlay (no command palette).

## Global Constraints

(Same as master plan — startup < 1000ms, theme switch < 100ms, no telemetry, etc.)

**Prerequisite:** Phase 3 complete — Monaco editor running.

---

### Task 10: Extract and Bundle VS Code Themes

**Files:**
- Create: `scripts/extract-themes.js`
- Create: `resources/themes/.gitkeep`
- Modify: `build/gulpfile.minimal.ts`

**Interfaces:**
- Produces: `resources/themes/<theme-id>.json` files; `resources/themes/manifest.json` listing `{ id, label, uiTheme, path }`

- [ ] **Step 1: Write extraction script**

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'resources', 'themes');
const extensionsDir = path.join(root, 'extensions');
const manifest = [];

fs.mkdirSync(outDir, { recursive: true });

for (const ext of fs.readdirSync(extensionsDir)) {
	if (!ext.startsWith('theme-')) continue;
	const themesDir = path.join(extensionsDir, ext, 'themes');
	if (!fs.existsSync(themesDir)) continue;
	for (const file of fs.readdirSync(themesDir)) {
		if (!file.endsWith('.json')) continue;
		const src = path.join(themesDir, file);
		const id = `${ext}-${path.basename(file, '.json')}`;
		const dest = path.join(outDir, `${id}.json`);
		fs.copyFileSync(src, dest);
		const theme = JSON.parse(fs.readFileSync(dest, 'utf8'));
		manifest.push({ id, label: theme.name || id, uiTheme: theme.type || 'vs-dark', path: `${id}.json` });
	}
}

fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
console.log(`Extracted ${manifest.length} themes`);
```

- [ ] **Step 2: Run extraction**

Run: `node scripts/extract-themes.js`
Expected: `Extracted N themes` where N >= 15

- [ ] **Step 3: Add gulp copy step**

Ensure `copy-minimal-resources` copies `resources/themes/` to `out-minimal/resources/themes/`.

- [ ] **Step 4: Commit**

```bash
git add scripts/extract-themes.js resources/themes/ build/gulpfile.minimal.ts
git commit -m "feat(minimal): extract VS Code themes for bundling"
```

---

### Task 11: Implement Theme Service

**Files:**
- Create: `src/theme-converter.ts`
- Create: `src/theme-service.ts`
- Test: `test/unit/theme-converter.test.ts`

**Interfaces:**
- Produces:
  - `convertToMonacoTheme(def: IThemeDefinition): monaco.editor.IStandaloneThemeData`
  - `loadThemes(basePath: string): Promise<IThemeDefinition[]>`
  - `applyTheme(editor: monaco.editor.IStandaloneCodeEditor, themeId: string): void`

- [ ] **Step 1: Write theme converter test**

```typescript
import * as assert from 'assert';
import { convertToMonacoTheme } from '../../src/theme-converter';

suite('theme-converter', () => {
	test('maps uiTheme to Monaco base', () => {
		const result = convertToMonacoTheme({
			id: 'test', label: 'Test', uiTheme: 'vs-dark',
			colors: {}, tokenColors: [],
		});
		assert.strictEqual(result.base, 'vs-dark');
		assert.strictEqual(result.inherit, true);
	});
});
```

- [ ] **Step 2: Implement theme-converter.ts**

```typescript
import type * as monaco from 'monaco-editor';

export interface IThemeDefinition {
	id: string;
	label: string;
	uiTheme: 'vs' | 'vs-dark' | 'hc-black' | 'hc-light';
	colors: Record<string, string>;
	tokenColors: Array<{ scope?: string | string[]; settings: Record<string, string> }>;
}

export function convertToMonacoTheme(def: IThemeDefinition): monaco.editor.IStandaloneThemeData {
	return {
		base: def.uiTheme,
		inherit: true,
		colors: def.colors,
		rules: def.tokenColors.flatMap(tc => {
			const scopes = Array.isArray(tc.scope) ? tc.scope : tc.scope ? [tc.scope] : [];
			return scopes.map(scope => ({
				token: scope,
				foreground: tc.settings.foreground?.replace('#', ''),
				background: tc.settings.background?.replace('#', ''),
				fontStyle: tc.settings.fontStyle,
			}));
		}),
	};
}
```

- [ ] **Step 3: Implement theme-service.ts**

```typescript
import * as monaco from 'monaco-editor';
import { convertToMonacoTheme, IThemeDefinition } from './theme-converter';
import { loadConfig, saveConfig } from './minimal-config';

let themes: IThemeDefinition[] = [];

export async function loadThemes(): Promise<IThemeDefinition[]> {
	const resp = await fetch('./resources/themes/manifest.json');
	const manifest = await resp.json() as Array<{ id: string; label: string; uiTheme: string; path: string }>;
	themes = [];
	for (const entry of manifest) {
		const themeResp = await fetch(`./resources/themes/${entry.path}`);
		const raw = await themeResp.json();
		themes.push({
			id: entry.id,
			label: entry.label,
			uiTheme: (entry.uiTheme as IThemeDefinition['uiTheme']) || 'vs-dark',
			colors: raw.colors || {},
			tokenColors: raw.tokenColors || [],
		});
	}
	return themes;
}

export function getThemes(): IThemeDefinition[] {
	return themes;
}

export function applyTheme(themeId: string): void {
	const theme = themes.find(t => t.id === themeId);
	if (!theme) return;
	monaco.editor.defineTheme(themeId, convertToMonacoTheme(theme));
	monaco.editor.setTheme(themeId);
	saveConfig({ theme: themeId });
}

export async function applySavedTheme(): Promise<void> {
	await loadThemes();
	const { theme } = loadConfig();
	applyTheme(themes.some(t => t.id === theme) ? theme : 'vs-dark');
}
```

- [ ] **Step 4: Call applySavedTheme on renderer init**

In `minimal-renderer.ts` after editor create: `await applySavedTheme();`

- [ ] **Step 5: Run tests and verify theme applies**

Run: `npm run test-node -- --grep theme-converter`
Manual: restart app — dark theme visible

- [ ] **Step 6: Commit**

```bash
git add src/theme-converter.ts src/theme-service.ts test/unit/theme-converter.test.ts src/minimal-renderer.ts
git commit -m "feat(minimal): theme loading and Monaco conversion"
```

---

### Task 12: Add Theme Selection UI

**Files:**
- Create: `src/theme-selector.ts`
- Create: `resources/theme-selector.css`
- Modify: `src/minimal-renderer.ts`

**Interfaces:**
- Produces: `showThemeSelector(onSelect: (id: string) => void): void`

- [ ] **Step 1: Implement theme-selector.ts**

```typescript
import { getThemes } from './theme-service';

export function showThemeSelector(onSelect: (themeId: string) => void): void {
	const overlay = document.createElement('div');
	overlay.className = 'theme-selector-overlay';
	const list = document.createElement('div');
	list.className = 'theme-selector-list';

	for (const theme of getThemes()) {
		const item = document.createElement('button');
		item.type = 'button';
		item.className = 'theme-item';
		item.textContent = `${theme.label} (${theme.uiTheme})`;
		item.onclick = () => { onSelect(theme.id); overlay.remove(); };
		list.appendChild(item);
	}

	overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
	document.addEventListener('keydown', function esc(e) {
		if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', esc); }
	});

	overlay.appendChild(list);
	document.body.appendChild(overlay);
}
```

- [ ] **Step 2: Add CSS**

```css
.theme-selector-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.theme-selector-list {
  background: #252526; color: #ccc; padding: 8px; max-height: 60vh; overflow: auto;
  min-width: 280px; border: 1px solid #454545;
}
.theme-item { display: block; width: 100%; text-align: left; padding: 8px; background: none; border: none; color: inherit; cursor: pointer; }
.theme-item:hover { background: #094771; }
```

- [ ] **Step 3: Wire View menu**

```typescript
window.electronAPI.on('editor:selectTheme', () => {
	showThemeSelector((id) => applyTheme(id));
});
```

- [ ] **Step 4: Manual test**

View → Select Theme → pick Solarized → editor colors change; restart → persists

- [ ] **Step 5: Commit**

```bash
git add src/theme-selector.ts resources/theme-selector.css src/minimal-renderer.ts
git commit -m "feat(minimal): add theme selection overlay"
```

---

**Next:** [Phase 5 — Syntax Highlighting](./2026-08-23-minimal-editor-phase-05-syntax-highlighting.md)
