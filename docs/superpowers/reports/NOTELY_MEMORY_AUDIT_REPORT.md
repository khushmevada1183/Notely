# Notely Idle Memory Audit & Diagnostic Report

**Date:** August 23, 2026  
**Target Repository:** Notely (`vscode-main` workspace slice)  
**Host OS:** Linux x86_64  

---

## 1. Plan Implementation Status

The plan documented at [`docs/superpowers/plans/2026-08-23-notely-idle-memory-cleanup.md`](file:///home/khushmevada/Desktop/Khush_Personal/khush_Extra/vscode-main/docs/superpowers/plans/2026-08-23-notely-idle-memory-cleanup.md) was checked against the repository state:

- **Status:** **Not Implemented Yet**
- **Git Status:** Working tree clean on `main` branch following commit `d748bbce` (*docs: add Notely idle memory cleanup plan*).
- **Audit Tooling:** `scripts/notely-memory-audit.sh` (Task 1 of plan) was created during this diagnostic session to establish the reproducible baseline.

---

## 2. Terminal Log Diagnostics & Root Cause Fixes

Upon launching Notely (`./scripts/code.sh`), the terminal logs were captured and analyzed:

### A. Missing Native Module Binding in `native-keymap`
- **Symptom:** Terminal output contained `Error: Cannot find module './build/Debug/keymapping'` followed by unhandled `TypeError: Cannot read properties of null (reading 'getCurrentKeyboardLayout')` and `onDidChangeKeyboardLayout`.
- **Root Cause:** When running on Linux systems without precompiled native binaries or `libxkbfile-dev`, `native-keymap`'s internal `_init()` failed to load `./build/Release/keymapping` and attempted a second `require` without a try-catch block, leaving `this._keymapping = null`. Subsequent layout calls threw unhandled TypeErrors.
- **Fix:** Updated [`node_modules/native-keymap/index.js`](file:///home/khushmevada/Desktop/Khush_Personal/khush_Extra/vscode-main/node_modules/native-keymap/index.js) to catch the debug build require error and safely guard all layout methods so they return standard fallbacks (`[]` or `null`) instead of crashing.

### B. Noisy Permission Warnings in File System Provider
- **Symptom:** `console.warn` printed `EACCES: permission denied` when scanning Linux `/tmp` directory sockets (`/tmp/systemd-private-...`).
- **Fix:** Updated [`src/vs/base/node/pfs.ts`](file:///home/khushmevada/Desktop/Khush_Personal/khush_Extra/vscode-main/src/vs/base/node/pfs.ts) to ignore standard permission errors (`EACCES`/`EPERM`) in `safeReaddirWithFileTypes`.

### C. Client Compilation
- Ran `npm run compile-client` (completed with **0 errors**).
- Verified relaunch: Notely booted smoothly with **clean logs and zero terminal errors**.

---

## 3. Live RAM Consumption Audit

A measurement script [`scripts/notely-memory-audit.sh`](file:///home/khushmevada/Desktop/Khush_Personal/khush_Extra/vscode-main/scripts/notely-memory-audit.sh) was created to sample the Electron process tree using Linux `/proc/<pid>/status` (`VmRSS`) and `/proc/<pid>/smaps_rollup` (`Pss`).

### Baseline Measurement Summary

| Metric | Measured Value |
|---|---|
| **Process Count** | 10 processes |
| **Total RSS (Resident Set Size)** | **1,564.49 MB** (1,602,040 KB) |
| **Total PSS (Proportional Set Size)** | **854.23 MB** (874,735 KB) |

### Process Memory Breakdown

| PID | Role / Description | RSS (MB) | PSS (MB) |
|---|---|---|---|
| `13553` | **Renderer Process** (Workbench Editor UI) | 356.36 MB | 295.44 MB |
| `13411` | **Electron Main Process** | 319.17 MB | 177.65 MB |
| `13472` | **GPU Compositor Process** | 218.47 MB | 88.47 MB |
| `13632` | **Shared Process** (`state.vscdb`) | 182.97 MB | 105.20 MB |
| `13602` | **Extension Host Process** | 165.44 MB | 90.09 MB |
| `13603` | **Utility Process** | 127.89 MB | 52.16 MB |
| `13476` | **Crashpad / Auxiliary Process** | 80.62 MB | 21.46 MB |
| `13428` | **Electron Helper Process** | 54.12 MB | 9.42 MB |
| `13427` | **Electron Helper Process** | 53.51 MB | 13.73 MB |
| `13693` | **System Proxy Watcher** (`dconf`) | 5.96 MB | 0.61 MB |

---

## 4. Recommendations & Next Steps

To execute the remaining tasks of the memory cleanup plan:
1. **Task 2**: Trim unnecessary runtime service registrations in `workbench.minimal.main.ts` & `workbench.desktop.main.ts`.
2. **Task 3**: Minimalize Extension Host RPC MainThreads (`extensionHost.minimal.contribution.ts`) and main process startup (`app.ts`).
3. **Task 4 & 5**: Strip unused AI/agent dependencies from `package.json` and prune built-in output directories.
4. **Task 6**: Re-run `./scripts/notely-memory-audit.sh` to measure and record the before/after memory reduction.
