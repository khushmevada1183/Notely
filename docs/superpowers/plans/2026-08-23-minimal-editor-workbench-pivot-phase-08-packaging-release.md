# Minimal Editor Workbench Pivot — Phase 8: Packaging and Release

> Parent: [workbench-pivot-index.md](./2026-08-23-minimal-editor-workbench-pivot-index.md) · Prerequisite: [Phase 7](./2026-08-23-minimal-editor-workbench-pivot-phase-07-performance.md)

**Goal:** Ship Notely as installable desktop app from workbench build output.

---

### Task 1: Package pipeline

**Files:**
- Modify: `build/gulpfile.vscode.*` or existing VS Code packaging scripts
- Optionally adapt: `electron-builder.json` to point at VS Code `out/` artifacts

- [ ] **Step 1: Linux `.deb` / AppImage**

- [ ] **Step 2: Windows installer**

- [ ] **Step 3: macOS `.dmg`**

Prefer VS Code's native packaging if electron-builder was tied to old `out-minimal/`.

---

### Task 2: User documentation

**Files:**
- Update: `README.md`

- [ ] Install instructions per platform
- [ ] Clarify: VS Code derivative, not extension host
- [ ] Keyboard shortcuts table

---

### Task 3: Release tag

- [ ] Tag: `notely-v1.0.0-workbench`
- [ ] Update `.kiro/specs/minimal-editor/design.md` architecture section to reference workbench pivot (optional doc fix)

---

## Exit Criteria

- [ ] Installable package on at least one platform
- [ ] README accurate for workbench-based app
- [ ] Release tagged

## Done

All requirements from `.kiro/specs/minimal-editor/requirements.md` verified against workbench build.
