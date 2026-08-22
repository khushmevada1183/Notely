# Minimal Editor Workbench Pivot — Phase 2: Workbench Slice

> Parent: [workbench-pivot-index.md](./2026-08-23-minimal-editor-workbench-pivot-index.md) · Prerequisite: [Phase 1](./2026-08-23-minimal-editor-workbench-pivot-phase-01-product-identity.md)

**Goal:** Boot a **subset** of the workbench — editor, files, themes, find — by forking registration imports instead of deleting source folders.

**Architecture:** New `workbench.minimal.main.ts` replaces `workbench.common.main.ts` in the desktop import chain. Source files stay on disk; unused contribs simply aren't imported.

---

### Task 1: Create workbench.minimal.main.ts

**Files:**
- Create: `src/vs/workbench/workbench.minimal.main.ts`
- Modify: `src/vs/workbench/workbench.desktop.main.ts`

- [ ] **Step 1: Copy workbench.common.main.ts as starting point**

```bash
cp src/vs/workbench/workbench.common.main.ts src/vs/workbench/workbench.minimal.main.ts
```

- [ ] **Step 2: Remove forbidden contrib imports**

Delete import lines for (minimum set — expand per index contrib table):
- `contrib/scm`, `contrib/git`, `contrib/terminal`, `contrib/debug`
- `contrib/extensions`, `contrib/chat`, `contrib/inlineChat`, `contrib/mcp`
- `contrib/notebook`, `contrib/webview*`, `contrib/testing`
- `contrib/search/browser/searchView.js` (keep in-file find only)
- `contrib/files/browser/explorerViewlet.js` (explorer sidebar)

- [ ] **Step 3: Remove AI/sync services**

Delete imports for `services/ai*`, `services/userDataSync/*`, `services/remote/*` if compile allows.

- [ ] **Step 4: Point desktop.main at minimal main**

In `workbench.desktop.main.ts`, replace:
```typescript
import './workbench.common.main.js';
```
with:
```typescript
import './workbench.minimal.main.js';
```

- [ ] **Step 5: Compile iteratively**

```bash
npm run compile
```
Fix missing service errors by either keeping required service import or stubbing — prefer keeping smallest dependency chain.

- [ ] **Step 6: Commit**

---

### Task 2: File operations via workbench (Req 2)

**Files:**
- Keep: `contrib/files/browser/fileActions.contribution.js`

- [ ] **Step 1: Verify New / Open / Save / Save As work**

Use menubar File menu (stock until Phase 6 customizes).

- [ ] **Step 2: Verify unsaved indicator on tab**

Per Req 2.7 — workbench editor tabs show dirty dot.

- [ ] **Step 3: Verify close-with-unsaved prompt**

Per Req 2.8.

---

### Task 3: Themes via IWorkbenchThemeService (Req 4)

**Files:**
- Keep: `services/themes/browser/workbenchThemeService.js`
- Keep: built-in theme extensions (Phase 5 packages them)

- [ ] **Step 1: Open theme picker** (Command Palette temporarily OK for test)

- [ ] **Step 2: Switch Dark+ → Light+**

Confirm **full UI** recolors within 100ms, not editor canvas only.

- [ ] **Step 3: Restart app — theme persists**

---

### Task 4: In-file find/replace (Req 5)

**Files:**
- Editor find contrib (bundled with `editor/all`)

- [ ] **Step 1: Ctrl+F opens VS Code find widget**

- [ ] **Step 2: Ctrl+H opens replace**

- [ ] **Step 3: Regex and case-sensitive toggles work**

---

## Exit Criteria

- [ ] App compiles with `workbench.minimal.main.ts`
- [ ] No git/terminal/debug/chat UI registered
- [ ] File open/save, themes, find work through workbench
- [ ] Still may show activity bar until Phase 3

## Next

→ [Phase 3: Layout Defaults](./2026-08-23-minimal-editor-workbench-pivot-phase-03-layout-defaults.md)
