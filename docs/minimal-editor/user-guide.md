# Notely — User Guide

Notely is a fast, distraction-free text editor for local files. This guide covers everyday workflows.

## Getting Started

1. Build and launch the app (see [README-MINIMAL.md](../../README-MINIMAL.md)).
2. A blank editor opens with the Dark+ theme by default.
3. Use the **File** menu or keyboard shortcuts to create or open files.

## File Operations

### New File

Creates an empty untitled buffer. The window title shows **Untitled** until you save.

- Menu: **File → New File**
- Shortcut: `Ctrl+N` (Windows/Linux) or `Cmd+N` (macOS)

### Open File

Opens a single file from disk using the native file picker.

- Menu: **File → Open File**
- Shortcut: `Ctrl+O` / `Cmd+O`

Supported local files up to 10 MB open with automatic language detection based on file extension.

### Save

Writes the current buffer to its existing path. If the file has never been saved, Save behaves like Save As.

- Menu: **File → Save**
- Shortcut: `Ctrl+S` / `Cmd+S`

### Save As

Prompts for a destination path and writes the buffer there.

- Menu: **File → Save As**
- Shortcut: `Ctrl+Shift+S` / `Cmd+Shift+S`

### Unsaved Changes

When you edit a file, an asterisk appears in the window title (for example, `* notes.txt - Notely`). Closing the window with unsaved changes shows a prompt to **Save**, **Discard**, or **Cancel**.

## Find and Replace

Search and replace operate on the **current file only**.

| Action | Windows/Linux | macOS |
|--------|---------------|-------|
| Find | `Ctrl+F` | `Cmd+F` |
| Replace | `Ctrl+H` | `Cmd+Alt+F` |

Use the find widget controls to match case, whole words, or use regular expressions.

## Themes

Notely ships with built-in VS Code themes.

- Menu: **View → Select Theme**
- Choose a theme from the overlay list; the selection is saved automatically and restored on next launch.

Theme changes apply within 100 ms under normal conditions.

## Editor Options

### Word Wrap

Toggle soft wrapping for long lines.

- Menu: **View → Toggle Word Wrap**

### Line Numbers

Show or hide the gutter line numbers.

- Menu: **View → Toggle Line Numbers**

Both settings persist across sessions in your config file.

## Supported File Types

Syntax highlighting is applied automatically from the file extension:

| Extension | Language |
|-----------|----------|
| `.js`, `.jsx` | JavaScript |
| `.ts`, `.tsx` | TypeScript |
| `.py` | Python |
| `.java` | Java |
| `.c`, `.cpp` | C / C++ |
| `.rs` | Rust |
| `.go` | Go |
| `.html` | HTML |
| `.css` | CSS |
| `.json` | JSON |
| `.md` | Markdown |
| `.xml` | XML |
| `.yaml`, `.yml` | YAML |
| `.sql` | SQL |
| `.sh` | Shell |
| `.bat` | Batch |
| `.php` | PHP |
| `.rb` | Ruby |
| `.swift` | Swift |
| `.kt` | Kotlin |
| `.txt` and unknown | Plain text |

## Editing Basics

Standard text editing shortcuts work through the **Edit** menu:

- Undo / Redo
- Cut, Copy, Paste
- Select All

See [keyboard-shortcuts.md](./keyboard-shortcuts.md) for the full shortcut table.

## Tips

- Notely edits **one file at a time** — there are no editor tabs.
- There is no integrated terminal or Git; use your system tools alongside the editor.
- Configuration is stored as JSON; there is no graphical settings panel.

## Troubleshooting

| Issue | Suggestion |
|-------|------------|
| App won't start | Run `npm run minimal:build` then `npm run minimal:start` |
| No syntax colors | Confirm the file extension is in the supported list above |
| Theme not saved | Check write permissions for your config directory |
| Save fails | Verify disk space and file permissions for the target path |
