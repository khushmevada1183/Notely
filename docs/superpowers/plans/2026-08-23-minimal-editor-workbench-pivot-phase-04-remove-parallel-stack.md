# Minimal Editor Workbench Pivot — Phase 4: Remove Parallel Stack

> Parent: [workbench-pivot-index.md](./2026-08-23-minimal-editor-workbench-pivot-index.md) · Prerequisite: [Phase 3](./2026-08-23-minimal-editor-workbench-pivot-phase-03-layout-defaults.md)

**Goal:** Delete the standalone Monaco app — only one entry path remains (real workbench).

**Do not start until Visual Acceptance Checklist passes.**

---

### Task 1: Delete parallel source files

**Files:**
- Delete: `src/minimal-*.ts`, `src/theme-service.ts`, `src/theme-converter.ts`, `src/grammar-service.ts`, `src/minimal-config.ts`
- Delete: `resources/index.html`, `resources/themes/` (if duplicated — themes come from extensions)
- Delete: `build/minimal-build.cjs`, `build/minimal.config.cjs`, `build/gulpfile.minimal.ts`, `build/validate-minimal-config.cjs`
- Delete: `_deprecated-minimal-standalone/` if created in Phase 0

- [ ] **Step 1: Remove files**

- [ ] **Step 2: `npm run compile` — must pass**

- [ ] **Step 3: Launch workbench — must pass**

- [ ] **Step 4: Commit**

```bash
git commit -am "$(cat <<'EOF'
remove: standalone Monaco parallel app stack

Workbench is the sole UI path. Themes/grammars via VS Code extensions.

EOF
)"
```

---

### Task 2: Clean package.json scripts

**Files:**
- Modify: root `package.json`

- [ ] **Step 1: Remove** `monaco-editor` npm dependency if added for standalone

- [ ] **Step 2: Remove scripts:** `minimal:*`, standalone `build`/`start` pointing to `out-minimal/`

- [ ] **Step 3: Restore standard VS Code scripts** from master if overwritten

- [ ] **Step 4: Commit**

---

### Task 3: Retire prune script

**Files:**
- Delete or archive: `scripts/prune-vscode-bulk.sh`

- [ ] **Step 1: Add README note** in script or delete with commit message explaining workbench-slice replaces bulk delete

---

## Exit Criteria

- [ ] No `src/minimal-*.ts` in repo
- [ ] No `monaco-editor` in package.json dependencies
- [ ] Single launch path: `./scripts/code.sh` (or product equivalent)

## Next

→ [Phase 5: Extensions Build Slice](./2026-08-23-minimal-editor-workbench-pivot-phase-05-extensions-build-slice.md)
