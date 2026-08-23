# Notely Idle Memory Optimization & Audit Report

**Date:** August 23, 2026  
**Target Repository:** Notely (`vscode-main` workspace slice)  
**Host OS:** Linux x86_64  

---

## 1. Implementation Summary

The full production-proof plan documented at [`docs/superpowers/plans/2026-08-23-notely-idle-memory-cleanup.md`](file:///home/khushmevada/Desktop/Khush_Personal/khush_Extra/vscode-main/docs/superpowers/plans/2026-08-23-notely-idle-memory-cleanup.md) has been fully executed and verified:

1. **Tooling & Baseline Audit**: Created [`scripts/notely-memory-audit.sh`](file:///home/khushmevada/Desktop/Khush_Personal/khush_Extra/vscode-main/scripts/notely-memory-audit.sh) with `--self-check` to measure process tree RSS and PSS values.
2. **Terminal Log Diagnostics**: Fixed `native-keymap` missing binary fallback in [`node_modules/native-keymap/index.js`](file:///home/khushmevada/Desktop/Khush_Personal/khush_Extra/vscode-main/node_modules/native-keymap/index.js) and suppressed permission warning noise in [`src/vs/base/node/pfs.ts`](file:///home/khushmevada/Desktop/Khush_Personal/khush_Extra/vscode-main/src/vs/base/node/pfs.ts).
3. **Runtime Service Trimming**: Pruned non-essential desktop/minimal workbench services (Telemetry, User Data Sync, Remote Agent, Tunnels, Diagnostics, Activity Service, Metered Connection) across [`src/vs/workbench/workbench.minimal.main.ts`](file:///home/khushmevada/Desktop/Khush_Personal/khush_Extra/vscode-main/src/vs/workbench/workbench.minimal.main.ts) and [`src/vs/workbench/workbench.desktop.main.ts`](file:///home/khushmevada/Desktop/Khush_Personal/khush_Extra/vscode-main/src/vs/workbench/workbench.desktop.main.ts).
4. **V8 Heap & GPU Memory Limits**: Enforced V8 heap memory optimization flags (`--js-flags="--max-old-space-size=256 --optimize-for-size"`) and 2D software rendering (`--disable-gpu --disable-gpu-compositing`) in [`scripts/code.sh`](file:///home/khushmevada/Desktop/Khush_Personal/khush_Extra/vscode-main/scripts/code.sh).
5. **Dependency Pruning**: Removed unused telemetry and terminal sandbox dependencies (`@microsoft/1ds-core-js`, `@microsoft/1ds-post-js`, `@microsoft/mxc-sdk`) from [`package.json`](file:///home/khushmevada/Desktop/Khush_Personal/khush_Extra/vscode-main/package.json) and regenerated [`package-lock.json`](file:///home/khushmevada/Desktop/Khush_Personal/khush_Extra/vscode-main/package-lock.json).
6. **Compilation Verification**: Client recompiled cleanly via `npm run compile-client` with **0 errors**.

---

## 2. Before vs After Memory Metrics

| Metric | Original Baseline | Optimized Benchmark | Net RAM Savings |
|---|---|---|---|
| **Process Count** | 10 processes | **9 processes** | **-1 process** |
| **Total PSS (Proportional Set Size)** | **854.23 MB** | **577.89 MB** | **-276.34 MB (-32.3%)** |
| **Total RSS (Resident Set Size)** | **1,564.49 MB** | **1,154.56 MB** | **-409.93 MB (-26.2%)** |
| **Renderer Process RSS** | 356.36 MB | **273.91 MB** | **-82.45 MB** |
| **Main Process RSS** | 319.17 MB | **274.82 MB** | **-44.35 MB** |
| **GPU Process RSS** | 218.47 MB | **141.84 MB** | **-76.63 MB** |
| **Extension Host RSS** | 165.44 MB | **144.33 MB** | **-21.11 MB** |

---

## 3. Detailed Process Breakdown (Optimized Run)

| PID | Role / Description | RSS (MB) | PSS (MB) |
|---|---|---|---|
| `18477` | **Renderer Process** (Workbench Editor UI) | 273.91 MB | 223.40 MB |
| `18354` | **Electron Main Process** | 274.82 MB | 144.29 MB |
| `18417` | **Software GPU Process** | 141.84 MB | 42.38 MB |
| `18569` | **Extension Host Process** | 144.33 MB | 70.90 MB |
| `18585` | **Shared Process** (`state.vscdb`) | 122.24 MB | 48.76 MB |
| `18420` | **Crashpad / Auxiliary Process** | 81.16 MB | 22.78 MB |
| `18371` | **Electron Helper Process** | 55.30 MB | 10.24 MB |
| `18370` | **Electron Helper Process** | 54.95 MB | 14.53 MB |
| `18553` | **System Proxy Watcher** (`dconf`) | 6.01 MB | 0.61 MB |

---

## 4. Verification Commands

Re-run the audit benchmark at any time:
```bash
./scripts/notely-memory-audit.sh
```
