# Minimal Editor Phase 3: Renderer & Monaco — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Renderer shell with Monaco editor, file load/save from IPC, language detection, dirty state, window title updates.

**Architecture:** `minimal-renderer.ts` creates Monaco instance; `monaco-config.ts` sets workers/options; `language-detection.ts` maps extensions; IPC via preload `electronAPI`.

**Tech Stack:** Monaco Editor standalone, Electron renderer IPC.

## Global Constraints

- Startup window visible and editor interactive within **1000ms** (quad-core, 8GB RAM, SSD)
- Memory: **< 100MB** empty file, **< 200MB** for 10K-line file
- File open (< 1MB): **< 200ms**; theme switch: **< 100ms**
- **No** telemetry, extension system, Git, terminal, debugger, multi-file search, LSP/IntelliSense, settings UI, workspace/multi-root, remote dev, webviews, activity bar, side panels
- Supported extensions for syntax: `c, js, md, txt, json, html, css, py, java, cpp, rs, go, ts, jsx, tsx, xml, yaml, sql, sh, bat, php, rb, swift, kt`
- Config dir: `~/.config/minimal-editor/` (Linux), `%APPDATA%/MinimalEditor` (Win), `~/Library/Application Support/MinimalEditor` (macOS)
- App ID: `com.minimal.editor`; output: `out-minimal/`, dist: `dist-minimal/`
- Native menus (File/Edit/View), native file dialogs, platform shortcuts (Ctrl vs Cmd)

**Prerequisite:** Phase 2 complete — main process opens window with menus and file IPC.

---

### Task 6: Create Renderer Process Entry Point

**Files:**
- Create: `resources/styles.css`
- Modify: `resources/index.html`
- Create: `src/minimal-renderer.ts`
- Create: `src/electron-api.d.ts`

**Interfaces:**
- Consumes: `window.electronAPI` from preload
- Produces: renderer bootstrap calling `initMinimalEditor()` on DOMContentLoaded

- [ ] **Step 1: Update index.html**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'">
  <title>Minimal Editor</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="container"></div>
  <script src="../minimal-renderer.js"></script>
</body>
</html>
```

- [ ] **Step 2: Create resources/styles.css**

```css
html, body { margin: 0; padding: 0; height: 100%; overflow: hidden; }
#container { width: 100vw; height: 100vh; }
```

- [ ] **Step 3: Create electron-api.d.ts**

```typescript
export interface ElectronAPI {
	platform: string;
	invoke(channel: string, ...args: unknown[]): Promise<unknown>;
	on(channel: string, listener: (...args: unknown[]) => void): void;
	send(channel: string, ...args: unknown[]): void;
}

declare global {
	interface Window {
		electronAPI: ElectronAPI;
	}
}
```

- [ ] **Step 4: Create minimal-renderer.ts skeleton**

```typescript
import './electron-api.d.ts';

function initMinimalEditor(): void {
	const container = document.getElementById('container');
	if (!container) throw new Error('Missing #container');
	container.textContent = 'Renderer ready';
	setupIpcListeners();
}

function setupIpcListeners(): void {
	window.electronAPI.on('file:opened', (data) => {
		console.log('file opened', data);
	});
}

document.addEventListener('DOMContentLoaded', initMinimalEditor);
```

- [ ] **Step 5: Build and verify**

Run: `npm run minimal:build && npm run minimal:start`
Expected: Window shows "Renderer ready"; no console errors

- [ ] **Step 6: Commit**

```bash
git add resources/index.html resources/styles.css src/minimal-renderer.ts src/electron-api.d.ts
git commit -m "feat(minimal): add renderer shell and IPC listeners"
```

---

### Task 7: Integrate Monaco Editor

**Files:**
- Create: `src/monaco-config.ts`
- Modify: `src/minimal-renderer.ts`
- Modify: `build/gulpfile.minimal.ts` (copy workers)

**Interfaces:**
- Produces: `createMonacoEditor(container: HTMLElement): monaco.editor.IStandaloneCodeEditor`
- Produces: `configureMonacoEnvironment(baseUrl: string): void`

- [ ] **Step 1: Write failing test for editor options**

Create `test/unit/monaco-config.test.ts`:

```typescript
import * as assert from 'assert';
import { getDefaultEditorOptions } from '../../src/monaco-config';

suite('monaco-config', () => {
	test('minimap disabled by default', () => {
		const opts = getDefaultEditorOptions();
		assert.deepStrictEqual(opts.minimap, { enabled: false });
	});
});
```

- [ ] **Step 2: Run test — FAIL**

- [ ] **Step 3: Implement monaco-config.ts**

```typescript
import type * as monaco from 'monaco-editor';

export function configureMonacoEnvironment(baseUrl: string): void {
	(self as any).MonacoEnvironment = {
		getWorkerUrl: (_moduleId: string, label: string) => {
			if (label === 'json') return `${baseUrl}/vs/language/json/json.worker.js`;
			if (label === 'css' || label === 'scss' || label === 'less') return `${baseUrl}/vs/language/css/css.worker.js`;
			if (label === 'html' || label === 'handlebars' || label === 'razor') return `${baseUrl}/vs/language/html/html.worker.js`;
			if (label === 'typescript' || label === 'javascript') return `${baseUrl}/vs/language/typescript/ts.worker.js`;
			return `${baseUrl}/vs/editor/editor.worker.js`;
		},
	};
}

export function getDefaultEditorOptions(): monaco.editor.IStandaloneEditorConstructionOptions {
	return {
		value: '',
		language: 'plaintext',
		theme: 'vs-dark',
		automaticLayout: true,
		minimap: { enabled: false },
		scrollBeyondLastLine: false,
		fontSize: 14,
		lineNumbers: 'on',
		wordWrap: 'off',
	};
}
```

- [ ] **Step 4: Wire Monaco in minimal-renderer.ts**

```typescript
import * as monaco from 'monaco-editor';
import { configureMonacoEnvironment, getDefaultEditorOptions } from './monaco-config';

let editor: monaco.editor.IStandaloneCodeEditor;

function initMinimalEditor(): void {
	const container = document.getElementById('container')!;
	configureMonacoEnvironment('.');
	editor = monaco.editor.create(container, getDefaultEditorOptions());
	setupIpcListeners();
	setupEditorListeners();
}

function setupEditorListeners(): void {
	editor.onDidChangeModelContent(() => {
		isDirty = true;
		updateWindowTitle();
		window.electronAPI.send('editor:dirty', isDirty);
	});
}
```

- [ ] **Step 5: Ensure esbuild bundles monaco for browser platform**

In `gulpfile.minimal.ts`, renderer build must use `platform: 'browser'` and not externalize `monaco-editor`.

- [ ] **Step 6: Verify manually**

Run: `npm run minimal:build && npm run minimal:start`
Expected: Monaco editor visible, typing works, line numbers on

- [ ] **Step 7: Commit**

```bash
git add src/monaco-config.ts src/minimal-renderer.ts test/unit/monaco-config.test.ts build/gulpfile.minimal.ts
git commit -m "feat(minimal): integrate Monaco editor in renderer"
```

---

### Task 8: Implement File Loading in Editor

**Files:**
- Create: `src/language-detection.ts`
- Modify: `src/minimal-renderer.ts`
- Test: `test/unit/language-detection.test.ts`

**Interfaces:**
- Produces: `detectLanguage(filename: string): string`
- State: `currentFile: FileData | null`, `isDirty: boolean`, `updateWindowTitle(): void`

- [ ] **Step 1: Write language detection tests**

```typescript
import * as assert from 'assert';
import { detectLanguage } from '../../src/language-detection';

suite('language-detection', () => {
	const cases: Record<string, string> = {
		'app.js': 'javascript', 'app.ts': 'typescript', 'app.py': 'python',
		'readme.md': 'markdown', 'data.json': 'json', 'unknown.xyz': 'plaintext',
	};
	for (const [file, lang] of Object.entries(cases)) {
		test(`detects ${file} as ${lang}`, () => assert.strictEqual(detectLanguage(file), lang));
	}
});
```

- [ ] **Step 2: Run — FAIL**

- [ ] **Step 3: Implement language-detection.ts**

```typescript
const EXT_MAP: Record<string, string> = {
	js: 'javascript', ts: 'typescript', jsx: 'javascript', tsx: 'typescriptreact',
	py: 'python', java: 'java', cpp: 'cpp', c: 'c', rs: 'rust', go: 'go',
	html: 'html', css: 'css', json: 'json', md: 'markdown', xml: 'xml',
	yaml: 'yaml', yml: 'yaml', sql: 'sql', sh: 'shell', bat: 'bat',
	php: 'php', rb: 'ruby', swift: 'swift', kt: 'kotlin', txt: 'plaintext',
};

export function detectLanguage(filename: string): string {
	const ext = filename.split('.').pop()?.toLowerCase() ?? '';
	return EXT_MAP[ext] ?? 'plaintext';
}
```

- [ ] **Step 4: Handle file:opened in renderer**

```typescript
import type { FileData } from './minimal-file-service';
import { detectLanguage } from './language-detection';

let currentFile: FileData | null = null;
let isDirty = false;

window.electronAPI.on('file:opened', (data) => {
	const file = data as FileData;
	currentFile = file;
	editor.setValue(file.content);
	monaco.editor.setModelLanguage(editor.getModel()!, detectLanguage(file.name));
	isDirty = false;
	updateWindowTitle();
});

function updateWindowTitle(): void {
	const name = currentFile?.name ?? 'Untitled';
	document.title = `${isDirty ? '* ' : ''}${name} - Minimal Editor`;
}
```

- [ ] **Step 5: Run tests**

Run: `npm run test-node -- --grep language-detection`
Expected: PASS

- [ ] **Step 6: Manual test open file**

Run app → File → Open → select `.js` file → content appears, title updates

- [ ] **Step 7: Commit**

```bash
git add src/language-detection.ts src/minimal-renderer.ts test/unit/language-detection.test.ts
git commit -m "feat(minimal): load files into Monaco with language detection"
```

---

### Task 9: Implement File Saving from Editor

**Files:**
- Modify: `src/minimal-renderer.ts`
- Modify: `src/minimal-main.ts` (wire save menu IPC)

**Interfaces:**
- IPC: `file:save` `{ path, content }`, `file:saveAs` `{ content }`
- Renderer handlers: `saveFile()`, `saveFileAs()`, menu channels `editor:saveFile`, `editor:saveFileAs`, `editor:newFile`

- [ ] **Step 1: Implement save in renderer**

```typescript
async function saveFile(): Promise<void> {
	const content = editor.getValue();
	if (!currentFile?.path) {
		await saveFileAs();
		return;
	}
	const result = await window.electronAPI.invoke('file:save', { path: currentFile.path, content }) as { success: boolean; mtime: number; size: number };
	if (result.success) {
		currentFile.mtime = result.mtime;
		currentFile.size = result.size;
		isDirty = false;
		updateWindowTitle();
		window.electronAPI.send('editor:dirty', false);
	}
}

async function saveFileAs(): Promise<void> {
	const content = editor.getValue();
	const data = await window.electronAPI.invoke('file:saveAs', { content }) as FileData | null;
	if (!data) return;
	currentFile = data;
	isDirty = false;
	updateWindowTitle();
}

function newFile(): void {
	currentFile = null;
	editor.setValue('');
	monaco.editor.setModelLanguage(editor.getModel()!, 'plaintext');
	isDirty = false;
	updateWindowTitle();
}
```

- [ ] **Step 2: Register IPC listeners**

```typescript
window.electronAPI.on('editor:saveFile', () => { void saveFile(); });
window.electronAPI.on('editor:saveFileAs', () => { void saveFileAs(); });
window.electronAPI.on('editor:newFile', () => newFile());
```

Wire main process menu clicks to `webContents.send('editor:saveFile')` etc.

- [ ] **Step 3: Manual verification**

1. New file → type → Save As → file on disk
2. Modify → Save → dirty flag clears, title loses `*`

- [ ] **Step 4: Commit**

```bash
git add src/minimal-renderer.ts src/minimal-main.ts src/minimal-menu.ts
git commit -m "feat(minimal): implement save, save as, and new file"
```

---

**Next:** [Phase 4 — Themes](./2026-08-23-minimal-editor-phase-04-themes.md)
