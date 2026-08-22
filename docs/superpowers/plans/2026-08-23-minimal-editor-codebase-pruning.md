# Minimal Editor Codebase Pruning Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Verify `npm run minimal:test-unit` after each task.

**Goal:** Turn the repo from "full VS Code + minimal overlay" into a **minimal-editor-only** codebase per `.kiro` Requirement 8 — no workbench, no extension host, no full VS Code tree.

**Architecture:** Minimal Editor is **already self-contained** — `src/minimal-*.ts` + npm `monaco-editor` + vendored `resources/themes/` and `resources/grammars/`. It does **not** import `src/vs/**`. Safe to delete the VS Code application tree while keeping the minimal build pipeline and platform packagers (`electron-builder.json`).

**Tech Stack:** esbuild (`build/gulpfile.minimal.ts`), electron-builder, vendored TextMate/themes.

## Global Constraints

- **Keep** all `src/minimal-*.ts`, `src/theme-*.ts`, `src/grammar-service.ts`, `src/language-*.ts`, `src/monaco-config.ts`, `src/editor-preferences.ts`, `src/error-handler.ts`, `src/electron-api.d.ts`
- **Keep** `resources/` (HTML, CSS, themes, grammars, icons), `build/minimal*`, `build/gulpfile.minimal.ts`, `build/run-gulp-minimal.cjs`, `build/lib/gulp/`, `build/lib/util.ts`
- **Keep** `electron-builder.json`, `package-minimal.json`, `package-minimal:*` scripts, `scripts/install-minimal-deps.sh`, `scripts/extract-*.js` (for refreshing vendored assets)
- **Keep** `test/unit/*minimal*`, `test/unit/{config,theme,language,error,window,editor,monaco}*`, `test/integration/`, `test/fixtures/`, `test/performance/minimal-benchmark.ts`
- **Keep** `.kiro/`, `docs/minimal-editor/`, `README-MINIMAL.md`, platform builders: `package-minimal:linux|win|mac`
- **Do not** delete LICENSE, `.gitignore`, `node_modules-minimal/` install path

---

### Task 28: Remove VS Code application source (`src/vs/`)

**Delete:**
- `src/vs/` (workbench, platform, editor, base, server, sessions, code)
- VS Code entrypoints: `src/main.ts`, `src/server-main.ts`, `src/server-cli.ts`, `src/cli.ts`, `src/bootstrap-*.ts`

**Verify:**
```bash
npm run minimal:test-unit   # expect 15 passing
```

---

### Task 29: Remove VS Code extensions tree

**Rationale:** Themes/grammars already vendored under `resources/themes/` (20 files) and `resources/grammars/` (23 files). Re-extract only if upstream grammar/theme updates needed.

**Delete:** `extensions/` entire directory (~107MB)

**Verify:** `node scripts/extract-themes.js` documented as optional refresh; `resources/` remains source of truth.

---

### Task 30: Remove VS Code-only tests and CI bulk

**Delete:**
- `test/automation/`, `test/mcp/`, `test/sanity/`, `test/smoke/`
- `build/azure-pipelines/` (optional: keep if user wants CI templates)

**Keep:** minimal unit/integration/performance tests.

---

### Task 31: Slim root package identity

**Modify:**
- Add note at top of `README-MINIMAL.md`: this repo is Minimal Editor, not full VS Code
- Optionally rename `README-MINIMAL.md` → `README.md` and archive old VS Code README
- Add `scripts/prune-vscode-bulk.sh` for reproducible pruning

**Do not** replace root `package.json` with `package-minimal.json` in one step — VS Code root deps still needed for `build/lib` gulp chain until Task 32.

---

### Task 32 (optional): Replace root package.json with minimal manifest

Merge `package-minimal.json` scripts/deps into root `package.json`; remove 300+ VS Code devDependencies. Only after Tasks 28–31 pass and `minimal:build` works with `node_modules-minimal` only.

---

## What stays for Linux / Windows / macOS builds

| Platform | Tool | Command |
|----------|------|---------|
| Linux | electron-builder | `npm run package-minimal:linux` |
| Windows | electron-builder | `npm run package-minimal:win` |
| macOS | electron-builder | `npm run package-minimal:mac` |

VS Code's `@vscode/gulp-electron` / `gulpfile.vscode.*` pipelines are **not** required for Minimal Editor.

---

## Self-review vs `.kiro` Requirement 8

| Requirement | After pruning |
|-------------|---------------|
| No extension system | ✅ no `extensions/`, no workbench |
| No Git/terminal/debug | ✅ workbench removed |
| No LSP/IntelliSense | ✅ never added in minimal app |
| Cross-platform desktop | ✅ electron-builder retained |
