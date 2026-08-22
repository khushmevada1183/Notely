# Minimal Editor Build Configuration

## Overview

The `minimal.config.cjs` file defines the build configuration for the Minimal Editor - a stripped-down version of VS Code focused on lightweight text editing.

## Configuration Structure

### Entry Points

The configuration defines three entry points for the Electron application:

- **main** (`src/minimal-main.ts`): Electron main process that handles application lifecycle, window management, and native OS integration
- **renderer** (`src/minimal-renderer.ts`): Renderer process that hosts the Monaco editor and minimal UI
- **preload** (`src/minimal-preload.ts`): Preload script that safely exposes IPC APIs to the renderer

### Output Settings

- **Directory**: `out-minimal` - All compiled files are output to this directory
- **Format**: `cjs` (CommonJS) - Required for Electron compatibility

### External Dependencies

The following dependencies are marked as external (not bundled):

- `electron` - Electron framework
- `fs` - Node.js file system module
- `path` - Node.js path utilities
- `crypto` - Node.js cryptography
- `os` - Node.js operating system utilities

### Bundle Configuration

- **Monaco Editor**: Enabled - Monaco editor standalone bundle will be included
- **Themes**: Enabled - VS Code theme definitions will be bundled
- **Grammars**: Enabled - TextMate grammar files for syntax highlighting will be bundled

## Dependencies

Minimal Editor uses a separate dependency manifest at the repo root: `package-minimal.json` (5 runtime + 5 dev dependencies, 10 total).

### Isolated install (Option B — preferred)

To avoid polluting VS Code's large root `node_modules`, install on demand into `node_modules-minimal/`:

```bash
bash scripts/install-minimal-deps.sh
```

This copies `package-minimal.json` into `node_modules-minimal/package.json` and runs `npm install --prefix node_modules-minimal`. The directory is gitignored.

Runtime deps: `electron`, `monaco-editor`, `monaco-textmate`, `onigasm`, `vscode-textmate`.

Dev/build deps: `electron-builder`, `esbuild`, `npm-run-all2`, `rimraf`, `typescript`.

**Note:** Root VS Code gulp tasks (`minimal:compile`, etc.) still require the main repo's `node_modules` (gulp, build tooling). The isolated tree supplies Monaco/Electron packages for packaging and runtime; wire `NODE_PATH=node_modules-minimal/node_modules` when running the minimal app outside the full VS Code dev environment.

## Validation

To validate the configuration:

```bash
node build/validate-minimal-config.cjs
```

To run comprehensive tests:

```bash
node build/test-minimal-config.cjs
npm run minimal:deps-test
```

## File Location

The configuration file is located at:
```
/home/khushmevada/Downloads/vscode-main/build/minimal.config.cjs
```

Note: The `.cjs` extension is required because the build directory uses ES modules by default (specified in `build/package.json`).

## Task Verification

This configuration satisfies all requirements from Task 1 of the Minimal Editor implementation:

✓ Build configuration file is valid and loads without errors
✓ Correct entry points are specified (main, renderer, preload)
✓ Output directory and format settings are defined
✓ External dependencies are properly specified
