# Minimal Editor Phase 9–10: Testing & Release — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Unit + integration test suites, user docs, cross-platform validation, performance gates, v1.0.0 release artifacts.

**Architecture:** Mocha unit tests (already started per phase); Playwright driving Electron app for integration; manual matrix for macOS/Windows.

**Tech Stack:** Mocha/Chai, Playwright, Chrome DevTools memory profiler.

## Global Constraints

(Same as master plan — all performance targets must pass before release.)

**Prerequisite:** Phase 8 complete — packaged app builds.

---

### Task 22: Write Unit Tests

**Files:**
- Create: `test/unit/theme-converter.test.ts` (Phase 4)
- Create: `test/unit/config.test.ts`
- Extend: existing unit tests from prior phases

**Interfaces:** All pure functions exported for testing.

- [ ] **Step 1: Create config.test.ts**

```typescript
import * as assert from 'assert';
import { getDefaultConfig, normalizeWindowBounds } from '../../src/minimal-config';

suite('config', () => {
	test('defaults include tabSize 4', () => {
		assert.strictEqual(getDefaultConfig().tabSize, 4);
	});
});
```

- [ ] **Step 2: Add npm script**

```json
"minimal:test-unit": "npm run test-node -- --grep 'minimal-config|minimal-file-service|language-detection|theme-converter|error-handler|window-bounds|editor-preferences|config'"
```

- [ ] **Step 3: Run full unit suite**

Run: `npm run minimal:test-unit`
Expected: all PASS, < 5s

- [ ] **Step 4: Commit**

```bash
git add test/unit/ package.json
git commit -m "test(minimal): consolidate unit test suite"
```

---

### Task 23: Perform Integration Testing

**Files:**
- Create: `test/integration/minimal-editor.spec.ts`
- Create: `test/fixtures/sample.js`, `sample.py`

**Interfaces:** Playwright launches `npm run minimal:start` or packaged binary via `MINIMAL_ELECTRON_PATH`.

- [ ] **Step 1: Install Playwright if needed**

Use existing repo Playwright setup from `test-browser` scripts.

- [ ] **Step 2: Write integration spec**

```typescript
import { test, expect, _electron as electron } from '@playwright/test';
import path from 'path';

test('opens window and types in editor', async () => {
	const app = await electron.launch({
		args: [path.join(__dirname, '../../out-minimal/minimal-main.js')],
	});
	const page = await app.firstWindow();
	await expect(page.locator('#container')).toBeVisible();
	// Monaco renders canvas/div — type via keyboard
	await page.keyboard.type('hello minimal');
	await app.close();
});

test('file save workflow', async () => {
	// Use tmp dir fixture; trigger save via IPC or menu automation
});
```

- [ ] **Step 3: Run integration tests**

Run: `npx playwright test test/integration/minimal-editor.spec.ts`
Expected: PASS on Linux

- [ ] **Step 4: Commit**

```bash
git add test/integration/ test/fixtures/
git commit -m "test(minimal): Playwright integration tests"
```

---

### Task 24: Create User Documentation

**Files:**
- Create: `README-MINIMAL.md`
- Create: `docs/minimal-editor/user-guide.md`
- Create: `docs/minimal-editor/keyboard-shortcuts.md`

- [ ] **Step 1: Write README-MINIMAL.md**

Sections: What it is, features kept/removed, build (`npm run minimal:build`), run (`npm run minimal:start`), package, license MIT.

- [ ] **Step 2: Write user-guide.md**

Cover: New/Open/Save, find/replace, themes, word wrap, supported file types.

- [ ] **Step 3: Write keyboard-shortcuts.md**

Table: Action | Windows/Linux | macOS — all shortcuts from design §10.3.

- [ ] **Step 4: Commit**

```bash
git add README-MINIMAL.md docs/minimal-editor/
git commit -m "docs(minimal): user guide and keyboard shortcuts"
```

---

### Task 25: Cross-Platform Testing

**Files:**
- Create: `docs/minimal-editor/cross-platform-report.md`

- [ ] **Step 1: Define test matrix**

| OS | Version | Installer | Status |
|----|---------|-----------|--------|
| Ubuntu | 22.04 | AppImage | |
| Windows | 11 | NSIS | |
| macOS | 12+ | DMG | |

- [ ] **Step 2: Execute checklist per platform**

From requirements §12.4 design manual checklist:
- Native file dialogs
- Menu accelerators (Ctrl vs Cmd)
- Window controls
- All file types open with highlighting
- Find/replace, theme switch, unsaved prompt

- [ ] **Step 3: Document issues in report**

- [ ] **Step 4: Commit report**

```bash
git add docs/minimal-editor/cross-platform-report.md
git commit -m "docs(minimal): cross-platform test report"
```

---

### Task 26: Performance Testing & Optimization

**Files:**
- Create: `test/performance/minimal-benchmark.ts`
- Create: `docs/minimal-editor/performance-report.md`

**Targets:**

| Metric | Target |
|--------|--------|
| Startup | < 1000ms |
| Memory empty | < 100MB |
| Memory 10K lines | < 200MB |
| Open 1MB file | < 200ms |
| Theme switch | < 100ms |

- [ ] **Step 1: Write startup benchmark**

```typescript
import { _electron as electron } from '@playwright/test';
import path from 'path';

async function measureStartup(): Promise<number> {
	const start = Date.now();
	const app = await electron.launch({ args: [path.join(__dirname, '../../out-minimal/minimal-main.js')] });
	await app.firstWindow();
	const ms = Date.now() - start;
	await app.close();
	return ms;
}
```

- [ ] **Step 2: Measure memory via Electron app.getProcessMemoryInfo()**

Add dev-only IPC `debug:memory` returning RSS; call after opening empty file and 10K-line fixture.

- [ ] **Step 3: Record results in performance-report.md**

If startup > 1000ms: defer grammar loading (already lazy), disable sourcemaps in dev runs, profile main `ready` path.

- [ ] **Step 4: Commit**

```bash
git add test/performance/ docs/minimal-editor/performance-report.md
git commit -m "test(minimal): performance benchmarks and report"
```

---

### Task 27: Create Release Build

**Files:**
- Create: `CHANGELOG-MINIMAL.md`
- Create: `VERSION` (content: `1.0.0`)
- Modify: `package-minimal.json` version → `1.0.0`

- [ ] **Step 1: Update version**

Set `"version": "1.0.0"` in `package-minimal.json`; create `VERSION` file.

- [ ] **Step 2: Write CHANGELOG-MINIMAL.md**

```markdown
# Minimal Editor Changelog

## 1.0.0 (2026-08-23)

### Added
- Monaco-based text editor with syntax highlighting (20+ languages)
- File New/Open/Save/Save As with native dialogs
- Built-in VS Code themes with persistence
- Find/replace, word wrap, line numbers toggles
- Cross-platform Electron packaging (Windows, macOS, Linux)

### Removed (vs VS Code)
- Extensions, Git, terminal, debugger, LSP, workspaces, telemetry
```

- [ ] **Step 3: Clean production build all platforms**

```bash
MINIMAL_PRODUCTION=1 npm run minimal:build
npm run package-minimal:linux   # on Linux
# CI jobs for win/mac
```

- [ ] **Step 4: Generate checksums**

```bash
cd dist-minimal && sha256sum * > SHA256SUMS.txt
```

- [ ] **Step 5: Final commit and tag**

```bash
git add CHANGELOG-MINIMAL.md VERSION package-minimal.json
git commit -m "chore(minimal): release v1.0.0"
git tag minimal-editor-v1.0.0
```

---

## Phase 9–10 Verification Checklist

- [ ] `npm run minimal:test-unit` — all pass
- [ ] Playwright integration tests pass
- [ ] Performance report shows targets met (or documented exceptions)
- [ ] Cross-platform report complete
- [ ] `dist-minimal/` contains platform installers
- [ ] README-MINIMAL.md accurate

**Project complete.** Refer to master plan for post-1.0 optional enhancements (tabs, recent files, auto-save).
