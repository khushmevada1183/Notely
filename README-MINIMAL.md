# Minimal Editor

A lightweight, cross-platform text editor derived from VS Code. Minimal Editor keeps the Monaco editing experience and syntax highlighting while removing everything else — no extensions, Git, terminal, debugger, or workspace complexity.

## Features

### Included

- Monaco-based text editing with syntax highlighting (20+ languages)
- File New, Open, Save, and Save As with native dialogs
- Find and replace within the current file
- Built-in VS Code themes with persistence
- Word wrap and line numbers toggles
- Undo, redo, cut, copy, paste, and select all
- Cross-platform packaging (Windows, macOS, Linux)

### Removed (vs full VS Code)

- Extension marketplace and extension host
- Git integration and source control UI
- Integrated terminal
- Debugger and launch configurations
- Language Server Protocol / IntelliSense
- Multi-root workspaces
- Settings UI and keybinding editor
- Command palette (beyond basic menu actions)
- Telemetry and online services
- Activity bar, side panels, and webviews

## Build

From the repository root:

```bash
npm run minimal:build
```

Production build (minified bundles):

```bash
npm run minimal:build:prod
```

## Run

Development run (requires a prior build):

```bash
npm run minimal:start
```

## Package

Platform installers are produced with electron-builder:

```bash
npm run package-minimal:linux   # AppImage on Linux
npm run package-minimal:win     # NSIS installer on Windows
npm run package-minimal:mac     # DMG on macOS
```

Output lands in `dist-minimal/`.

## Test

Unit tests:

```bash
npm run minimal:test-unit
```

Integration tests (Playwright + Electron):

```bash
npx playwright test --config test/integration/playwright.config.ts
```

## Configuration

Settings are stored in:

| Platform | Location |
|----------|----------|
| Linux | `~/.config/minimal-editor/config.json` |
| Windows | `%APPDATA%/MinimalEditor/config.json` |
| macOS | `~/Library/Application Support/MinimalEditor/config.json` |

Persisted options include theme, word wrap, line numbers, font size, tab size, insert spaces, and window bounds.

## Documentation

- [User Guide](docs/minimal-editor/user-guide.md)
- [Keyboard Shortcuts](docs/minimal-editor/keyboard-shortcuts.md)

## License

MIT — see the [LICENSE](LICENSE.txt) file in this repository.
