# Minimal Editor

A lightweight, cross-platform text editor (Monaco + Electron). **This repository is the Minimal Editor app only** — the full VS Code workbench, extension tree, and server entrypoints have been removed. What remains is the minimal source under `src/minimal-*.ts`, vendored themes/grammars in `resources/`, and the `minimal:*` / `package-minimal:*` build scripts.

No extensions, Git, terminal, debugger, or workspace complexity.

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

```bash
npm install
npm run build
```

Production build (minified):

```bash
npm run build:prod
```

## Run

```bash
npm start
```

## Package

```bash
npm run package:linux   # AppImage on Linux
npm run package:win     # NSIS installer on Windows
npm run package:mac     # DMG on macOS
```

Output lands in `dist-minimal/`.

## Test

```bash
npm test
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
