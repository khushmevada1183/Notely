# Minimal Editor Workbench Pivot — Phase 6: Menus and Commands

> Parent: [workbench-pivot-index.md](./2026-08-23-minimal-editor-workbench-pivot-index.md) · Prerequisite: [Phase 5](./2026-08-23-minimal-editor-workbench-pivot-phase-05-extensions-build-slice.md)

**Goal:** Menus match Req 6 exactly — File, Edit, View with specified items only.

---

### Task 1: File menu (Req 6.1)

- [ ] New, Open, Save, Save As, Exit — map to existing workbench commands
- [ ] Remove: Open Folder, Open Workspace, Recent (multi-root)

---

### Task 2: Edit menu (Req 6.2)

- [ ] Undo, Redo, Cut, Copy, Paste, Select All, Find, Replace
- [ ] Remove: Command Palette entry if present

---

### Task 3: View menu (Req 6.3)

- [ ] Toggle Word Wrap → `editor.action.toggleWordWrap`
- [ ] Toggle Line Numbers → `editor.action.toggleLineNumbers` (verify command id)
- [ ] Select Theme → theme picker command (minimal UI — submenu or quick pick)

- [ ] Remove: Explorer, Terminal, Appearance submenus beyond essentials

---

### Task 4: Native menu bar (Req 6.4)

**Files:**
- `services/menubar/electron-browser/menubarService.js`

- [ ] Confirm native menubar on Linux/Win/macOS
- [ ] Menu action latency < 50ms (Req 6.5) — spot check

---

## Exit Criteria

- [ ] Three menus only with specified items
- [ ] No stray VS Code menu entries (Run, Terminal, Help bloat trimmed)

## Next

→ [Phase 7: Performance](./2026-08-23-minimal-editor-workbench-pivot-phase-07-performance.md)
