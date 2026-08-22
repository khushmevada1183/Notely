# Minimal Editor Phase 2: Main Process — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Electron main process with window lifecycle, config persistence, file IPC, and native menus.

**Architecture:** `minimal-main.ts` bootstraps app; `minimal-preload.ts` exposes typed `window.electronAPI`; `minimal-file-service.ts` handles fs + dialogs; `minimal-menu.ts` builds platform menus sending IPC to renderer.

**Tech Stack:** Electron 28 BrowserWindow/Menu/dialog/ipcMain, Node fs/path/os.

## Global Constraints

- Startup window visible and editor interactive within **1000ms** (quad-core, 8GB RAM, SSD)
- Memory: **< 100MB** empty file, **< 200MB** for 10K-line file
- File open (< 1MB): **< 200ms**; theme switch: **< 100ms**
- **No** telemetry, extension system, Git, terminal, debugger, multi-file search, LSP/IntelliSense, settings UI, workspace/multi-root, remote dev, webviews, activity bar, side panels
- Supported extensions for syntax: `c, js, md, txt, json, html, css, py, java, cpp, rs, go, ts, jsx, tsx, xml, yaml, sql, sh, bat, php, rb, swift, kt`
- Config dir: `~/.config/minimal-editor/` (Linux), `%APPDATA%/MinimalEditor` (Win), `~/Library/Application Support/MinimalEditor` (macOS)
- App ID: `com.minimal.editor`; output: `out-minimal/`, dist: `dist-minimal/`
- Native menus (File/Edit/View), native file dialogs, platform shortcuts (Ctrl vs Cmd)

**Prerequisite:** Phase 1 complete — `npm run minimal:compile` pipeline exists.

---

### Task 3: Create Minimal Main Process Entry Point

**Files:**
- Create: `src/minimal-config.ts`
- Create: `src/minimal-preload.ts`
- Create: `src/minimal-main.ts`
- Create: `resources/index.html` (minimal stub for window load)
- Test: `test/unit/minimal-config.test.ts`

**Interfaces:**
- Consumes: Electron APIs
- Produces:
  - `IMinimalConfiguration` interface
  - `loadConfig(): IMinimalConfiguration`
  - `saveConfig(partial: Partial<IMinimalConfiguration>): void`
  - `getConfigDir(): string`
  - Preload exposes `window.electronAPI` with `platform: string`

- [ ] **Step 1: Write failing config test**

Create `test/unit/minimal-config.test.ts`:

```typescript
import * as assert from 'assert';
import { getDefaultConfig, detectLanguage } from '../../src/minimal-config';

suite('minimal-config', () => {
	test('getDefaultConfig returns vs-dark theme', () => {
		const cfg = getDefaultConfig();
		assert.strictEqual(cfg.theme, 'vs-dark');
		assert.strictEqual(cfg.wordWrap, 'off');
		assert.strictEqual(cfg.lineNumbers, 'on');
	});
});
```

Add `detectLanguage` stub export in test import only after Task 8 — for now test only `getDefaultConfig`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test-node -- --grep minimal-config`
Expected: FAIL — module not found

- [ ] **Step 3: Implement minimal-config.ts**

```typescript
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export interface IMinimalConfiguration {
	theme: string;
	wordWrap: 'on' | 'off';
	lineNumbers: 'on' | 'off';
	fontSize: number;
	tabSize: number;
	insertSpaces: boolean;
	windowBounds: { x: number; y: number; width: number; height: number };
	isMaximized?: boolean;
}

export function getConfigDir(): string {
	if (process.platform === 'darwin') {
		return path.join(os.homedir(), 'Library', 'Application Support', 'MinimalEditor');
	}
	if (process.platform === 'win32') {
		return path.join(os.homedir(), 'AppData', 'Roaming', 'MinimalEditor');
	}
	return path.join(os.homedir(), '.config', 'minimal-editor');
}

export function getDefaultConfig(): IMinimalConfiguration {
	return {
		theme: 'vs-dark',
		wordWrap: 'off',
		lineNumbers: 'on',
		fontSize: 14,
		tabSize: 4,
		insertSpaces: true,
		windowBounds: { x: 100, y: 100, width: 1200, height: 800 },
	};
}

export function loadConfig(): IMinimalConfiguration {
	try {
		const configPath = path.join(getConfigDir(), 'config.json');
		return { ...getDefaultConfig(), ...JSON.parse(fs.readFileSync(configPath, 'utf8')) };
	} catch {
		return getDefaultConfig();
	}
}

export function saveConfig(partial: Partial<IMinimalConfiguration>): void {
	const dir = getConfigDir();
	fs.mkdirSync(dir, { recursive: true });
	const current = loadConfig();
	fs.writeFileSync(path.join(dir, 'config.json'), JSON.stringify({ ...current, ...partial }, null, 2));
}
```

- [ ] **Step 4: Implement minimal-preload.ts**

```typescript
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
	platform: process.platform,
	invoke: (channel: string, ...args: unknown[]) => ipcRenderer.invoke(channel, ...args),
	on: (channel: string, listener: (...args: unknown[]) => void) => {
		ipcRenderer.on(channel, (_event, ...args) => listener(...args));
	},
	send: (channel: string, ...args: unknown[]) => ipcRenderer.send(channel, ...args),
});
```

- [ ] **Step 5: Implement minimal-main.ts**

```typescript
import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { loadConfig, saveConfig } from './minimal-config';

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
	const config = loadConfig();
	const { x, y, width, height } = config.windowBounds;

	mainWindow = new BrowserWindow({
		x, y, width, height,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, 'minimal-preload.js'),
		},
	});

	if (config.isMaximized) {
		mainWindow.maximize();
	}

	mainWindow.loadFile(path.join(__dirname, 'resources', 'index.html'));

	mainWindow.on('close', () => {
		if (!mainWindow) return;
		const bounds = mainWindow.getBounds();
		saveConfig({
			windowBounds: bounds,
			isMaximized: mainWindow.isMaximized(),
		});
	});

	mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
```

- [ ] **Step 6: Create stub resources/index.html**

```html
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>Minimal Editor</title></head>
<body><div id="container">Loading…</div></body></html>
```

- [ ] **Step 7: Run tests and compile**

Run: `npm run test-node -- --grep minimal-config`
Expected: PASS

Run: `npm run minimal:build`
Expected: PASS — outputs in `out-minimal/`

Run: `npm run minimal:start`
Expected: Window opens with "Loading…"

- [ ] **Step 8: Commit**

```bash
git add src/minimal-config.ts src/minimal-preload.ts src/minimal-main.ts resources/index.html test/unit/minimal-config.test.ts
git commit -m "feat(minimal): add Electron main process bootstrap and config"
```

---

### Task 4: Implement File Operations IPC Handlers

**Files:**
- Create: `src/minimal-file-service.ts`
- Modify: `src/minimal-main.ts`
- Test: `test/unit/minimal-file-service.test.ts`

**Interfaces:**
- Consumes: Electron `dialog`, Node `fs`
- Produces:
  - `export interface FileData { path: string; name: string; content: string; mtime: number; size: number; encoding: string; eol: '\n' | '\r\n' }`
  - `openFile(): Promise<FileData | null>`
  - `saveFile(path: string, content: string): Promise<{ success: boolean; mtime: number; size: number }>`
  - `saveFileAs(content: string): Promise<FileData | null>`
  - IPC channels: `file:open`, `file:save`, `file:saveAs`

- [ ] **Step 1: Write failing file service test**

```typescript
import * as assert from 'assert';
import { detectEOL } from '../../src/minimal-file-service';

suite('minimal-file-service', () => {
	test('detectEOL finds CRLF', () => {
		assert.strictEqual(detectEOL('a\r\nb'), '\r\n');
	});
	test('detectEOL defaults to LF', () => {
		assert.strictEqual(detectEOL('a\nb'), '\n');
	});
});
```

- [ ] **Step 2: Run test — expect FAIL**

Run: `npm run test-node -- --grep minimal-file-service`

- [ ] **Step 3: Implement minimal-file-service.ts**

```typescript
import { dialog } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

export interface FileData {
	path: string;
	name: string;
	content: string;
	mtime: number;
	size: number;
	encoding: string;
	eol: '\n' | '\r\n';
}

export function detectEOL(content: string): '\n' | '\r\n' {
	return content.includes('\r\n') ? '\r\n' : '\n';
}

export async function openFile(): Promise<FileData | null> {
	const result = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'All Files', extensions: ['*'] }] });
	if (result.canceled || !result.filePaths[0]) return null;
	const filePath = result.filePaths[0];
	const content = await fs.promises.readFile(filePath, 'utf8');
	const stat = await fs.promises.stat(filePath);
	return {
		path: filePath,
		name: path.basename(filePath),
		content,
		mtime: stat.mtimeMs,
		size: stat.size,
		encoding: 'utf-8',
		eol: detectEOL(content),
	};
}

export async function saveFile(filePath: string, content: string) {
	const tempPath = filePath + '.tmp';
	await fs.promises.writeFile(tempPath, content, 'utf8');
	await fs.promises.rename(tempPath, filePath);
	const stat = await fs.promises.stat(filePath);
	return { success: true, mtime: stat.mtimeMs, size: stat.size };
}

export async function saveFileAs(content: string): Promise<FileData | null> {
	const result = await dialog.showSaveDialog({ filters: [{ name: 'All Files', extensions: ['*'] }] });
	if (result.canceled || !result.filePath) return null;
	await saveFile(result.filePath, content);
	const stat = await fs.promises.stat(result.filePath);
	return {
		path: result.filePath,
		name: path.basename(result.filePath),
		content,
		mtime: stat.mtimeMs,
		size: stat.size,
		encoding: 'utf-8',
		eol: detectEOL(content),
	};
}
```

- [ ] **Step 4: Register IPC in minimal-main.ts**

```typescript
import { ipcMain } from 'electron';
import * as fileService from './minimal-file-service';

// inside app.whenReady().then():
ipcMain.handle('file:open', () => fileService.openFile());
ipcMain.handle('file:save', (_e, { path, content }) => fileService.saveFile(path, content));
ipcMain.handle('file:saveAs', (_e, { content }) => fileService.saveFileAs(content));
```

- [ ] **Step 5: Run tests**

Run: `npm run test-node -- --grep minimal-file-service`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/minimal-file-service.ts src/minimal-main.ts test/unit/minimal-file-service.test.ts
git commit -m "feat(minimal): add file open/save IPC handlers"
```

---

### Task 5: Implement Native Menu System

**Files:**
- Create: `src/minimal-menu.ts`
- Modify: `src/minimal-main.ts`

**Interfaces:**
- Consumes: `mainWindow`, `sendToRenderer(channel: string, ...args: unknown[])`
- Produces: `createApplicationMenu(mainWindow: BrowserWindow): void`
- Renderer channels: `editor:undo`, `editor:redo`, `editor:find`, `editor:replace`, `editor:toggleWordWrap`, `editor:toggleLineNumbers`, `editor:selectTheme`, `editor:newFile`, `file:opened` (from main)

- [ ] **Step 1: Write menu accelerator test (unit)**

Create `test/unit/minimal-menu.test.ts`:

```typescript
import * as assert from 'assert';
import { getCommandKey } from '../../src/minimal-menu';

suite('minimal-menu', () => {
	test('getCommandKey is Cmd on darwin', () => {
		const original = process.platform;
		Object.defineProperty(process, 'platform', { value: 'darwin' });
		assert.strictEqual(getCommandKey(), 'Cmd');
		Object.defineProperty(process, 'platform', { value: original });
	});
});
```

- [ ] **Step 2: Run — expect FAIL**

- [ ] **Step 3: Implement minimal-menu.ts**

```typescript
import { app, Menu, BrowserWindow, MenuItemConstructorOptions } from 'electron';

export function getCommandKey(): string {
	return process.platform === 'darwin' ? 'Cmd' : 'Ctrl';
}

export function createApplicationMenu(mainWindow: BrowserWindow): void {
	const cmd = getCommandKey();
	const isMac = process.platform === 'darwin';

	const send = (channel: string) => () => {
		mainWindow.webContents.send(channel);
	};

	const template: MenuItemConstructorOptions[] = [
		...(isMac ? [{ label: app.name, submenu: [{ role: 'about' as const }, { type: 'separator' as const }, { role: 'quit' as const }] }] : []),
		{
			label: 'File',
			submenu: [
				{ label: 'New File', accelerator: `${cmd}+N`, click: send('editor:newFile') },
				{ label: 'Open File', accelerator: `${cmd}+O`, click: send('editor:openFile') },
				{ type: 'separator' },
				{ label: 'Save', accelerator: `${cmd}+S`, click: send('editor:saveFile') },
				{ label: 'Save As', accelerator: `${cmd}+Shift+S`, click: send('editor:saveFileAs') },
				{ type: 'separator' },
				{ label: 'Close Window', accelerator: `${cmd}+W`, role: 'close' },
				...(!isMac ? [{ label: 'Exit', role: 'quit' as const }] : []),
			],
		},
		{
			label: 'Edit',
			submenu: [
				{ label: 'Undo', accelerator: `${cmd}+Z`, click: send('editor:undo') },
				{ label: 'Redo', accelerator: isMac ? 'Cmd+Shift+Z' : 'Ctrl+Y', click: send('editor:redo') },
				{ type: 'separator' },
				{ role: 'cut' }, { role: 'copy' }, { role: 'paste' },
				{ label: 'Select All', accelerator: `${cmd}+A`, click: send('editor:selectAll') },
				{ type: 'separator' },
				{ label: 'Find', accelerator: `${cmd}+F`, click: send('editor:find') },
				{ label: 'Replace', accelerator: isMac ? 'Cmd+Alt+F' : 'Ctrl+H', click: send('editor:replace') },
			],
		},
		{
			label: 'View',
			submenu: [
				{ label: 'Toggle Word Wrap', click: send('editor:toggleWordWrap') },
				{ label: 'Toggle Line Numbers', click: send('editor:toggleLineNumbers') },
				{ type: 'separator' },
				{ label: 'Select Theme', click: send('editor:selectTheme') },
			],
		},
	];

	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
```

- [ ] **Step 4: Wire menu in minimal-main.ts**

After `createWindow()`, call `createApplicationMenu(mainWindow!)`.

Handle `editor:openFile` in main (file picker is main-side):

```typescript
mainWindow.webContents.on('did-finish-load', () => {
	// IPC from menu for open — or handle via ipcMain:
});
ipcMain.on('editor:openFile', async () => {
	const data = await fileService.openFile();
	if (data && mainWindow) mainWindow.webContents.send('file:opened', data);
});
```

Adjust menu Open to trigger `ipcMain` instead of renderer-only send.

- [ ] **Step 5: Manual verification**

Run: `npm run minimal:start`
Expected: File/Edit/View menus visible; accelerators shown

- [ ] **Step 6: Commit**

```bash
git add src/minimal-menu.ts src/minimal-main.ts test/unit/minimal-menu.test.ts
git commit -m "feat(minimal): add native File/Edit/View menus"
```

---

**Next:** [Phase 3 — Renderer & Monaco](./2026-08-23-minimal-editor-phase-03-renderer-monaco.md)
