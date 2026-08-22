# Minimal Editor Workbench Pivot — Phase 3: Layout Defaults

> Parent: [workbench-pivot-index.md](./2026-08-23-minimal-editor-workbench-pivot-index.md) · Prerequisite: [Phase 2](./2026-08-23-minimal-editor-workbench-pivot-phase-02-workbench-slice.md)

**Goal:** Fresh launch shows **menu bar + editor only** (optional minimal status bar) — Req 10.

---

### Task 1: Default layout configuration

**Files:**
- Create or modify: `product.json` default settings contribution OR `src/vs/workbench/browser/workbench.contribution.ts` defaults

- [ ] **Step 1: Set defaults**

```json
"workbench.activityBar.location": "hidden",
"workbench.sideBar.location": "hidden",
"workbench.panel.defaultLocation": "bottom",
"workbench.panel.opensMaximized": "never"
```

Also consider:
```json
"workbench.statusBar.visible": true,
"workbench.editor.showTabs": "single"
```

Tune to match Req 10 (single-file notepad feel).

- [ ] **Step 2: Hide panel on startup**

```json
"workbench.panel.show": false
```

- [ ] **Step 3: Verify fresh profile launch**

Delete user data dir, relaunch — no activity bar, no sidebar.

---

### Task 2: Minimal status bar (Req 10.4)

**Files:**
- Modify: status bar contribution or hide entries via `workbench.minimal.main.ts`

- [ ] **Step 1: Hide non-essential status items**

Keep: line/col, encoding, language mode (file type).
Remove: git branch, problems count, remote indicator, extension host.

Approach: don't import scm/debug status contributions (Phase 2) + filter remaining entries if needed.

- [ ] **Step 2: Visual verify**

---

### Task 3: Visual acceptance gate

**Files:**
- Checklist in index plan

- [ ] **Step 1: Run full Visual Acceptance Checklist from index**

All items must pass before Phase 4.

- [ ] **Step 2: Screenshot for progress doc**

- [ ] **Step 3: Commit**

```bash
git commit -am "$(cat <<'EOF'
layout: default zen notepad chrome for minimal editor

EOF
)"
```

---

## Exit Criteria

- [ ] Visual Acceptance Checklist passes
- [ ] User confirms "looks like VS Code" (not bare Monaco)

## Next

→ [Phase 4: Remove Parallel Stack](./2026-08-23-minimal-editor-workbench-pivot-phase-04-remove-parallel-stack.md)
