# Notely Production Memory Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform Notely into an ultra-lean, modern notepad fork by stripping all unneeded VS Code subsystems, background processes, heavy service contributions, unused npm packages, and V8 heap overhead to achieve maximum RAM efficiency (~200–300 MB PSS target).

**Architecture:** Maintain Notely strictly as a focused notepad workbench slice (Monaco/workbench text editor, File I/O, Find/Replace, Themes, Line Numbers, Word Wrap, and Auto-Update). Remove all background services, IPC channels, and contributions at their import boundaries. Enforce V8 memory limits and process tree optimizations in the launch scripts and Electron main entrypoint.

**Tech Stack:** TypeScript, Node.js 24.18.0, Electron 42, V8 flags, npm lockfile v3, Bash, Linux `/proc` memory counters.

## Global Constraints

- **Node.js**: Require 24.18.0 as documented in `README-NOTELY.md`.
- **Scope Limits**: Keep real workbench editor, file I/O, themes, find/replace, and auto-update (`updateService.js`). Do not load SCM, terminal, chat, MCP, remote development, sync, marketplace, or debugging.
- **Safety**: Every modification batch must pass `npm run compile-client` and `scripts/notely-memory-audit.sh`.
- **Evidence**: Measure and report total PSS and RSS values before and after each optimization phase.

---

## File Structure & Touch Plan

- `scripts/notely-memory-audit.sh`: Reproducible idle process-tree memory measurement script.
- `scripts/code.sh`: Development launch script; add V8 memory flags (`--max-old-space-size=256`, `--optimize-for-size`).
- `src/vs/workbench/workbench.minimal.main.ts`: Minimal workbench service and contribution entrypoint.
- `src/vs/workbench/workbench.desktop.main.ts`: Desktop service and contribution entrypoint.
- `src/vs/workbench/api/browser/extensionHost.minimal.contribution.ts`: Minimal extension-host contribution entrypoint.
- `src/vs/code/electron-main/app.ts`: Main process app lifecycle and background process spawning.
- `build/lib/notelyDirs.ts` & `build/lib/notelyPackage.ts`: Packaging exclusion filters and npm roots.
- `package.json` & `package-lock.json`: Dependency manifests; prune unused top-level entries.
- `README-NOTELY.md` & `docs/superpowers/reports/2026-08-23-notely-memory-audit.md`: Memory documentation and audit metrics.

---

### Task 1: Audit Tooling & Baseline Verification

**Files:**
- Modify: `scripts/notely-memory-audit.sh`
- Modify: `README-NOTELY.md`

- [x] **Step 1: Write and verify audit script**
  Run: `./scripts/notely-memory-audit.sh --self-check`
  Expected: PASS with numeric VmRSS and PSS values.
- [x] **Step 2: Measure initial baseline**
  Run: `./scripts/notely-memory-audit.sh`
  Recorded: Total RSS 1,564.49 MB, Total PSS 854.23 MB across 10 processes.

---

### Task 2: Trim Renderer & Desktop Subsystem Registrations

**Files:**
- Modify: `src/vs/workbench/workbench.minimal.main.ts`
- Modify: `src/vs/workbench/workbench.desktop.main.ts`

- [x] **Step 1: Remove unneeded service imports**
  Prune imports for Telemetry, User Data Sync, Remote Agent, Tunnels, Activity Bar, Metered Connection, and Diagnostics.
- [x] **Step 2: Compile client and verify zero errors**
  Run: `npm run compile-client`
  Expected: PASS with 0 compilation errors.
- [x] **Step 3: Measure RAM reduction after service trim**
  Run: `./scripts/notely-memory-audit.sh`
  Recorded: Total RSS 1,281.64 MB (-283.25 MB), Total PSS 676.45 MB (-178.30 MB).

---

### Task 3: Apply V8 Heap Limits & Electron Main Process Optimization

**Files:**
- Modify: `scripts/code.sh`
- Modify: `src/vs/code/electron-main/app.ts`

- [ ] **Step 1: Add V8 memory flags to launch script**
  Add `--js-flags="--max-old-space-size=256 --optimize-for-size"` to Electron args in `scripts/code.sh`.

```bash
# Add V8 memory optimization flags
export JS_FLAGS="--max-old-space-size=256 --optimize-for-size"
exec "$CODE" . --js-flags="$JS_FLAGS" $DISABLE_TEST_EXTENSION "$@"
```

- [ ] **Step 2: Verify Notely startup with V8 memory flags**
  Run: `VSCODE_SKIP_PRELAUNCH=1 ./scripts/code.sh --no-sandbox --user-data-dir /tmp/notely-v8-test --disable-workspace-trust /tmp`
  Expected: Application launches cleanly without V8 heap allocation errors.

- [ ] **Step 3: Measure RAM reduction with V8 flags**
  Run: `./scripts/notely-memory-audit.sh`
  Expected: Reduced PSS memory in Main, Renderer, and Extension Host V8 heaps.

---

### Task 4: Prune Unused npm Dependencies & Lockfile

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`

- [x] **Step 1: Remove unused direct dependencies from package.json**
  Removed `@microsoft/1ds-core-js`, `@microsoft/1ds-post-js`, and `@microsoft/mxc-sdk`.
- [x] **Step 2: Regenerate package-lock.json**
  Run: `npm install --package-lock-only --ignore-scripts`
  Expected: `package-lock.json` updated with no dependency resolution errors.
- [x] **Step 3: Verify client compilation**
  Run: `npm run compile-client`
  Expected: PASS with 0 errors.

---

### Task 5: Final Memory Audit & Documentation

**Files:**
- Modify: `NOTELY_MEMORY_AUDIT_REPORT.md`
- Modify: `docs/superpowers/reports/2026-08-23-notely-memory-audit.md`
- Modify: `README-NOTELY.md`

- [x] **Step 1: Execute final memory audit benchmark**
  Run: `./scripts/notely-memory-audit.sh`
- [x] **Step 2: Update documentation reports with before/after metrics**
  Record net PSS/RSS reductions and process tree breakdown in documentation.
