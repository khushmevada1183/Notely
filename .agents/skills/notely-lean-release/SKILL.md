---
name: notely-lean-release
description: Use when Notely CI or GitHub release builds run longer than ~30 minutes, when agents propose full VS Code gulp packaging for a minimal editor fork, or when choosing dev compile vs production installers for Notely.
---

# Notely Lean Release

## Overview

Notely's **runtime** is a minimal notepad workbench; its **build tree** is still a VS Code fork. Slow releases usually mean an agent ran the wrong pipeline at the wrong layer — not that the app "needs" every dependency.

## Build Layers

| Layer | Command | Use for |
|-------|---------|---------|
| **Dev** | `npm run compile-client` + `./scripts/notely-run.sh` | Daily work, `notely-ci.yml` |
| **Release (lean)** | `npm run gulp notely-<platform>-<arch>` | Linux `.deb` on tags (mac/win commented out in CI) |
| **Release (full)** | `npm run gulp vscode-<platform>-<arch>` | Debugging only — compiles all 109 extensions |

**Do not** use `compile-build-with-mangling` in CI — use esbuild path inside gulp tasks (default).

## Why Releases Are Slow

1. **`npm ci`** — full VS Code lockfile (~1.7 GB `node_modules`).
2. **`gulp vscode-*`** — compiles **109 extensions** + native git/auth + extension media.
3. **Three OS jobs** — each repeats the full pipeline.
4. **`notely-linux-x64`** cuts extension compile to ~49 folders (themes + grammars from allowlist).

Runtime uses `workbench.minimal.main.ts` via `workbench.desktop.main.ts`. Electron + core bundle size is unchanged; extension packaging is where lean releases win.

## CI Policy

| Workflow | Trigger | Build command |
|----------|---------|---------------|
| `notely-ci.yml` | push/PR `main` | `compile-client` |
| `notely-release.yml` | `v*` tags | **Linux only** — `notely-linux-x64` → `.deb` (mac/win jobs commented out) |

Upstream workflows stay in `.github/upstream-workflows/` — do not re-enable.

## Allowlist

Edit `build/minimal-extensions.allowlist.json`:

- **themes:** `theme-*` (12 built-in themes)
- **grammars:** bat, cpp, css, html, javascript, json, markdown-basics, python, rust, typescript, yaml, …
- **exclude:** git, emmet, `*-language-features`, terminal, debug, copilot

Loader: `build/lib/notelyExtensions.ts` → `compileNotelyExtensionsBuildTask` in `gulpfile.extensions.ts`.

## Quick Reference

| Symptom | Fix |
|---------|-----|
| Release > 2 hours | Already lean via allowlist; 3 jobs run in parallel not serial |
| Missing syntax colors | Add grammar folder to allowlist |
| Missing theme | Ensure `theme-*` pattern covers it |
| Copilot SDK error | `includeCopilotInBuild` false in `gulpfile.vscode.ts` |
| Linux `.deb` fails on `code-tunnel-oss` | Notely skips tunnel CLI — deb deps only scan it if present |

## Release Commands (Linux)

```bash
npm run gulp notely-linux-x64
npm run gulp vscode-linux-x64-prepare-deb
npm run gulp vscode-linux-x64-build-deb
```

Output: `../VSCode-linux-x64/` → `.build/linux/deb/amd64/` → `notely-*-linux-amd64.deb`

## Common Mistakes

- Using **`vscode-*-x64` on tags** — compiles all 109 extensions; use `notely-*` targets.
- Requiring **all three OS jobs** before publish — Linux failure blocked by macOS.
- **`compile-client` as installer** — dev-only; not packaged.
- **Deleting npm packages** at root — breaks fork; trim via allowlist instead.

## Future Cuts

- Custom esbuild entry dropping sessions/terminal workers (smaller core bundle)
- Skip `npm ci` subfolders for excluded extensions (harder; allowlist is the practical win)
