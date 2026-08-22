# Minimal Editor Phase 7: Polish & Error Handling — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Unsaved-changes guard on close, graceful file/theme/grammar/config errors, window bounds persistence (extend Task 3).

**Architecture:** Main process intercepts `close` when dirty; `error-handler.ts` maps errno to dialogs; config saves bounds on close.

**Tech Stack:** Electron dialog, ipcMain/ipcRenderer sync for dirty flag.

## Global Constraints

(Same as master plan — Requirement 2.8 unsaved prompt; Requirement 12.4 window restore.)

**Prerequisite:** Phase 3 Task 9 (save + dirty tracking).

---

### Task 17: Implement Unsaved Changes Protection

**Files:**
- Modify: `src/minimal-main.ts`
- Modify: `src/minimal-renderer.ts`

**Interfaces:**
- IPC: `editor:dirty` (renderer → main, boolean)
- IPC: `window:request-close-response` (main → renderer, asks save)
- State in main: `let isDirty = false`

- [ ] **Step 1: Track dirty in main**

```typescript
let isDirty = false;

ipcMain.on('editor:dirty', (_e, dirty: boolean) => {
	isDirty = dirty;
});

mainWindow.on('close', (event) => {
	if (!isDirty) return;
	event.preventDefault();
	dialog.showMessageBox(mainWindow!, {
		type: 'question',
		buttons: ['Save', 'Discard', 'Cancel'],
		defaultId: 0,
		cancelId: 2,
		title: 'Unsaved Changes',
		message: 'Do you want to save the changes you made?',
	}).then(async (result) => {
		if (result.response === 2) return; // Cancel
		if (result.response === 1) {
			isDirty = false;
			mainWindow?.destroy();
			return;
		}
		// Save
		mainWindow?.webContents.send('editor:saveAndClose');
	});
});
```

- [ ] **Step 2: Handle saveAndClose in renderer**

```typescript
window.electronAPI.on('editor:saveAndClose', async () => {
	await saveFile();
	window.electronAPI.send('editor:dirty', false);
	window.electronAPI.send('window:force-close');
});
```

```typescript
ipcMain.on('window:force-close', () => {
	isDirty = false;
	mainWindow?.destroy();
});
```

- [ ] **Step 3: Manual test**

Edit file → close window → dialog appears → Save/Discard/Cancel each work

- [ ] **Step 4: Commit**

```bash
git add src/minimal-main.ts src/minimal-renderer.ts
git commit -m "feat(minimal): unsaved changes dialog on window close"
```

---

### Task 18: Add Error Handling

**Files:**
- Create: `src/error-handler.ts`
- Modify: `src/minimal-file-service.ts`
- Modify: `src/theme-service.ts`
- Modify: `src/grammar-service.ts`

**Interfaces:**
- Produces: `handleFileError(error: NodeJS.ErrnoException, filePath: string): Promise<void>`
- Produces: `showError(title: string, message: string): Promise<void>`

- [ ] **Step 1: Write error mapping test**

```typescript
import * as assert from 'assert';
import { getFileErrorMessage } from '../../src/error-handler';

suite('error-handler', () => {
	test('ENOENT message', () => {
		const msg = getFileErrorMessage({ code: 'ENOENT', message: 'missing' } as NodeJS.ErrnoException, '/a/b.txt');
		assert.ok(msg.includes('not found'));
	});
});
```

- [ ] **Step 2: Implement error-handler.ts**

```typescript
import { dialog } from 'electron';

export function getFileErrorMessage(error: NodeJS.ErrnoException, filePath: string): string {
	switch (error.code) {
		case 'ENOENT': return `Could not find file: ${filePath}`;
		case 'EACCES': return `Permission denied: ${filePath}`;
		case 'ENOSPC': return 'Disk is full. Free space and try again.';
		case 'EISDIR': return `Path is a directory, not a file: ${filePath}`;
		default: return error.message || 'Unknown file error';
	}
}

export async function showError(title: string, message: string): Promise<void> {
	await dialog.showMessageBox({ type: 'error', title, message, buttons: ['OK'] });
}

export async function handleFileError(error: NodeJS.ErrnoException, filePath: string): Promise<void> {
	await showError('File Error', getFileErrorMessage(error, filePath));
}
```

- [ ] **Step 3: Wrap file service operations**

```typescript
export async function openFile(): Promise<FileData | null> {
	try {
		// existing logic
	} catch (error) {
		await handleFileError(error as NodeJS.ErrnoException, 'selected file');
		return null;
	}
}
```

- [ ] **Step 4: Fallbacks for theme/grammar**

In `theme-service.ts`: catch load failure → `monaco.editor.setTheme('vs-dark')`
In `grammar-service.ts`: catch → `console.warn`, continue without TextMate

- [ ] **Step 5: Run tests; manual error cases**

Try open non-existent path via CLI test hook; save to read-only dir

- [ ] **Step 6: Commit**

```bash
git add src/error-handler.ts src/minimal-file-service.ts src/theme-service.ts src/grammar-service.ts test/unit/error-handler.test.ts
git commit -m "feat(minimal): file and resource error handling with fallbacks"
```

---

### Task 19: Implement Window State Persistence

**Files:**
- Modify: `src/minimal-config.ts`
- Modify: `src/minimal-main.ts`

Note: Task 3 saves bounds on close — this task adds off-screen detection and maximize restore.

- [ ] **Step 1: Write bounds validation test**

```typescript
import * as assert from 'assert';
import { normalizeWindowBounds } from '../../src/minimal-config';

suite('window-bounds', () => {
	test('off-screen bounds reset to defaults', () => {
		const result = normalizeWindowBounds({ x: -9999, y: -9999, width: 1200, height: 800 }, { width: 1920, height: 1080 });
		assert.ok(result.x >= 0);
		assert.ok(result.y >= 0);
	});
});
```

- [ ] **Step 2: Implement normalizeWindowBounds**

```typescript
export function normalizeWindowBounds(
	bounds: { x: number; y: number; width: number; height: number },
	screen: { width: number; height: number },
): typeof bounds {
	const minVisible = 50;
	if (bounds.x + minVisible < 0 || bounds.y + minVisible < 0 ||
		bounds.x > screen.width || bounds.y > screen.height) {
		return getDefaultConfig().windowBounds;
	}
	return bounds;
}
```

- [ ] **Step 3: Use screen API in createWindow**

```typescript
import { screen } from 'electron';

const display = screen.getPrimaryDisplay().workAreaSize;
const bounds = normalizeWindowBounds(config.windowBounds, display);
```

- [ ] **Step 4: Manual test**

Move window → restart → same position; move off-screen → restart → centered defaults

- [ ] **Step 5: Commit**

```bash
git add src/minimal-config.ts src/minimal-main.ts test/unit/window-bounds.test.ts
git commit -m "feat(minimal): window bounds persistence with off-screen recovery"
```

---

**Next:** [Phase 8 — Packaging](./2026-08-23-minimal-editor-phase-08-packaging.md)
