# Minimal Editor Workbench Pivot — Phase 1: Product Identity

> Parent: [workbench-pivot-index.md](./2026-08-23-minimal-editor-workbench-pivot-index.md) · Prerequisite: [Phase 0](./2026-08-23-minimal-editor-workbench-pivot-phase-00-recovery.md)

**Goal:** Rebrand the workbench product as Notely/Minimal Editor with correct data paths and no marketplace — without changing workbench architecture.

---

### Task 1: Update product.json

**Files:**
- Modify: `product.json`

- [ ] **Step 1: Set identity fields**

```json
"nameShort": "Notely",
"nameLong": "Notely",
"applicationName": "notely",
"dataFolderName": ".notely",
"win32AppUserModelId": "Notely.Editor",
"darwinBundleIdentifier": "com.notely.editor",
"linuxIconName": "notely"
```

- [ ] **Step 2: Disable extension marketplace**

Set or add:
```json
"extensionsGallery": null
```
(Or omit gallery URLs — verify VS Code build accepts null/disabled gallery for desktop.)

- [ ] **Step 3: Trim builtInExtensions**

Keep only theme extensions + minimal grammar set needed for Req 1 extensions list. Remove git, emmet-heavy bundles if not required.

- [ ] **Step 4: Commit**

```bash
git commit -am "$(cat <<'EOF'
product: rebrand as Notely and disable extension gallery

EOF
)"
```

---

### Task 2: Window title format

**Files:**
- Modify: `src/vs/workbench/browser/parts/titlebar/windowTitle.ts` (or product contribution)

- [ ] **Step 1: Verify title shows `filename — Notely`**

Launch app, open file, confirm title bar per Req 10.5.

- [ ] **Step 2: Adjust if product.json alone insufficient**

Use `${activeEditorShort}` pattern already in VS Code; ensure `nameShort` drives suffix.

---

### Task 3: Telemetry off

**Files:**
- Modify: `product.json`, verify `src/vs/platform/telemetry/` not loaded in minimal main (Phase 2)

- [ ] **Step 1: Set telemetry flags in product.json if present**

Search master product.json for `enableTelemetry` patterns.

- [ ] **Step 2: Confirm no outbound telemetry in network tab on launch**

---

## Exit Criteria

- [ ] App window title uses Notely branding
- [ ] User data in `~/.config/notely` (Linux) or equivalent
- [ ] No extension marketplace UI reachable

## Next

→ [Phase 2: Workbench Slice](./2026-08-23-minimal-editor-workbench-pivot-phase-02-workbench-slice.md)
