# Notely

Notely is a **VS Code workbench slice**: a trimmed fork of Code OSS that keeps the real workbench editor, file I/O, themes, and find/replace — without the full VS Code feature surface (SCM, terminal, chat, extensions marketplace, etc.).

User data on Linux: `~/.config/notely`

## Requirements

- **Node.js 24.18.0** (see `.nvmrc`)
- Linux build deps: `build-essential`, `libx11-dev`, `libxkbfile-dev`, `libsecret-1-dev`, `libkrb5-dev`

```bash
export PATH="/home/khushmevada/.local/node/node-v24.18.0-linux-x64/bin:$PATH"
node -v   # v24.18.0
```

## Build

```bash
./scripts/notely-setup.sh
```

Or manually:
npm install --ignore-scripts
# Install built-in extension dependencies (grammar extensions under extensions/)
for d in extensions/*/; do (cd "$d" && npm install --ignore-scripts 2>/dev/null) || true; done
npm run compile-client
node build/lib/preLaunch.ts
```

`compile-client` compiles the workbench; `preLaunch.ts` downloads Electron and prepares `.build/electron/`.

## Run (development)

```bash
# Symlink Electron binary if product name differs from download folder
APP=$(node -p "require('./product.json').applicationName")
[[ -e .build/electron/$APP ]] || ln -sf code-oss .build/electron/$APP

./scripts/code.sh --no-sandbox
```

Optional flags: `--user-data-dir /tmp/notely-dev` for an isolated profile.

## Menus (Req 6)

| Menu | Items |
|------|-------|
| **File** | New, Open, Save, Save As, Exit |
| **Edit** | Undo, Redo, Cut, Copy, Paste, Select All, Find, Replace |
| **View** | Toggle Word Wrap, Toggle Line Numbers, Select Theme |

Implemented in `src/vs/workbench/contrib/minimalEditor/browser/minimalEditorMenus.contribution.ts`.

## Performance

Best-effort startup benchmark (Linux; uses `xvfb-run` when no `DISPLAY`):

```bash
chmod +x scripts/notely-perf-startup.sh
./scripts/notely-perf-startup.sh
```

Target: cold start to interactive editor **< 1000 ms** (Req 7). Headless timing is approximate.

## Packaging notes

- Product identity: `product.json` (`applicationName`: `notely`, `dataFolderName`: `.notely`)
- Workbench entry: `workbench.minimal.main.ts` (imported from `workbench.desktop.main.ts`)
- Built-in extensions list is empty in `product.json`; syntax grammars come from the `extensions/` folder at compile time
- Prior standalone Monaco/Electron-builder output under `dist-minimal/` is legacy; the workbench build is the supported path
- For installable packages, use VS Code's native gulp packaging targets once `out/` is produced

## Branch

Development branch: `feat/minimal-editor-workbench`
