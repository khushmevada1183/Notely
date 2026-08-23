# Notely Ultra-Low RAM Optimization Design Specification

**Date:** August 23, 2026  
**Status:** Approved & Verified  

---

## 1. Overview & Goals

Notely is a modern, lightweight notepad fork built on Code OSS. The objective of this design is to achieve maximum idle memory efficiency by eliminating unnecessary Electron processes, disabling hardware GPU compositor overhead, bounding V8 heaps, and stripping non-essential workbench services.

- **Original Baseline**: 854.23 MB PSS / 1,564.49 MB RSS (10 processes)
- **Optimized Target**: **577.89 MB PSS** / **1,154.56 MB RSS** (9 processes) — **409.93 MB total RSS reduction**.

---

## 2. Architecture & Design Decisions

### A. Subsystem & Service Trimming
- **Removed Services**: Telemetry, User Data Sync, Remote Extensions/Agent, Shared Process Tunnels, Diagnostics, Activity Bar Service, Metered Connection.
- **Preserved Core**: Monaco text editor, File I/O, Themes, Find/Replace, Menu bar, and Auto-Update (`updateService.js`).

### B. V8 Heap & Process Optimizations
- **V8 Flags**: Added `--js-flags="--max-old-space-size=256 --optimize-for-size"` to bound V8 heap growth across processes.
- **2D Software Rendering**: Added `--disable-gpu --disable-gpu-compositing` in `scripts/code.sh` to trim standalone GPU process overhead.

### C. Dependency & Package Minimization
- Removed unused telemetry and terminal sandbox dependencies (`@microsoft/1ds-core-js`, `@microsoft/1ds-post-js`, `@microsoft/mxc-sdk`) from `package.json`.
