# Minimal Editor Phase 6: Editor Features — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Monaco find/replace widget wired to menus; word wrap and line numbers toggles with config persistence.

**Architecture:** Use Monaco built-in find controller actions; preference toggles via `editor.updateOptions` + `saveConfig`.

**Tech Stack:** Monaco editor actions, existing config service.

## Global Constraints

(Same as master plan.)

**Prerequisite:** Phase 3 Task 7 (Monaco), Phase 4 Task 11 (config persistence).

---

### Task 15: Enable Monaco Find/Replace Widget

**Files:**
- Modify: `src/minimal-renderer.ts`
- Modify: `src/minimal-menu.ts` (already sends channels)

**Interfaces:**
- Menu/IPC channels: `editor:find`, `editor:replace`
- Monaco actions: `actions.find`, `editor.action.startFindReplaceAction`

- [ ] **Step 1: Wire find/replace handlers**

```typescript
import * as monaco from 'monaco-editor';

function runEditorAction(actionId: string): void {
	const action = editor.getAction(actionId);
	action?.run();
}

window.electronAPI.on('editor:find', () => runEditorAction('actions.find'));
window.electronAPI.on('editor:replace', () => runEditorAction('editor.action.startFindReplaceAction'));

window.electronAPI.on('editor:undo', () => runEditorAction('undo'));
window.electronAPI.on('editor:redo', () => runEditorAction('redo'));
window.electronAPI.on('editor:selectAll', () => runEditorAction('editor.action.selectAll'));
```

- [ ] **Step 2: Register Monaco keybindings (backup)**

```typescript
editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => runEditorAction('actions.find'));
editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => runEditorAction('editor.action.startFindReplaceAction'));
```

On macOS replace uses Cmd+Alt+F per spec — add conditional binding.

- [ ] **Step 3: Manual verification**

1. Ctrl+F → find widget opens, highlights matches
2. Ctrl+H → replace mode
3. Test case-sensitive toggle, regex, replace all

- [ ] **Step 4: Commit**

```bash
git add src/minimal-renderer.ts
git commit -m "feat(minimal): enable Monaco find and replace"
```

---

### Task 16: Implement Editor Preferences

**Files:**
- Modify: `src/minimal-renderer.ts`
- Modify: `src/minimal-config.ts` (already has wordWrap, lineNumbers)

**Interfaces:**
- Functions: `toggleWordWrap(): void`, `toggleLineNumbers(): void`
- Applies `loadConfig()` values on startup

- [ ] **Step 1: Write preference test**

```typescript
import * as assert from 'assert';

function toggleValue(current: 'on' | 'off'): 'on' | 'off' {
	return current === 'off' ? 'on' : 'off';
}

suite('editor-preferences', () => {
	test('toggleValue flips on/off', () => {
		assert.strictEqual(toggleValue('off'), 'on');
		assert.strictEqual(toggleValue('on'), 'off');
	});
});
```

Extract `toggleValue` to `src/editor-preferences.ts` if testing directly.

- [ ] **Step 2: Implement toggles in renderer**

```typescript
import { loadConfig, saveConfig } from './minimal-config';

function applyConfigToEditor(): void {
	const cfg = loadConfig();
	editor.updateOptions({
		wordWrap: cfg.wordWrap,
		lineNumbers: cfg.lineNumbers,
		fontSize: cfg.fontSize,
		tabSize: cfg.tabSize,
		insertSpaces: cfg.insertSpaces,
	});
}

function toggleWordWrap(): void {
	const current = editor.getOption(monaco.editor.EditorOption.wordWrap);
	const next = current === 'off' ? 'on' : 'off';
	editor.updateOptions({ wordWrap: next });
	saveConfig({ wordWrap: next });
}

function toggleLineNumbers(): void {
	const current = editor.getOption(monaco.editor.EditorOption.lineNumbers);
	const next = current === 'off' ? 'on' : 'off';
	editor.updateOptions({ lineNumbers: next });
	saveConfig({ lineNumbers: next });
}

window.electronAPI.on('editor:toggleWordWrap', toggleWordWrap);
window.electronAPI.on('editor:toggleLineNumbers', toggleLineNumbers);
```

Call `applyConfigToEditor()` after editor creation.

- [ ] **Step 3: Manual verification**

View → Toggle Word Wrap → long line wraps; restart → setting persists

- [ ] **Step 4: Commit**

```bash
git add src/minimal-renderer.ts src/editor-preferences.ts test/unit/editor-preferences.test.ts
git commit -m "feat(minimal): word wrap and line number toggles with persistence"
```

---

**Next:** [Phase 7 — Polish](./2026-08-23-minimal-editor-phase-07-polish.md)
