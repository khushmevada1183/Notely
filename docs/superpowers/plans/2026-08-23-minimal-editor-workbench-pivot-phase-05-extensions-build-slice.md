# Minimal Editor Workbench Pivot — Phase 5: Extensions Build Slice

> Parent: [workbench-pivot-index.md](./2026-08-23-minimal-editor-workbench-pivot-index.md) · Prerequisite: [Phase 4](./2026-08-23-minimal-editor-workbench-pivot-phase-04-remove-parallel-stack.md)

**Goal:** Package only theme + grammar extensions — not git, JS/TS language features, emmet, etc.

---

### Task 1: Define allowlist

**Files:**
- Create: `build/minimal-extensions.allowlist.json`

- [ ] **Step 1: Allowlist themes**

All `extensions/theme-*` (Dark+, Light+, Monokai, etc.)

- [ ] **Step 2: Allowlist grammars**

Map Req 1 extensions to grammar extensions:
- `javascript`, `typescript`, `json`, `html`, `css`, `markdown`, `python`, `java`, `cpp`, `rust`, `go`, `xml`, `yaml`, `sql`, `shellscript`, `php`, `ruby`, `swift`, `kotlin`, etc.

- [ ] **Step 3: Explicitly exclude**

`git`, `npm`, `terminal`, `debug-*`, `emmet`, `typescript-language-features`, `json-language-features`, etc.

---

### Task 2: Wire build to allowlist

**Files:**
- Modify: `build/gulpfile.extensions.ts` or product `builtInExtensions` list

- [ ] **Step 1: Filter extension compile task**

Only compile allowlisted extension folders.

- [ ] **Step 2: Verify syntax highlighting** for sample `.py`, `.ts`, `.md` files

- [ ] **Step 3: Verify all built-in themes appear in picker**

- [ ] **Step 4: Commit**

---

### Task 3: Measure install size

- [ ] **Step 1: Run packaging dry-run**

- [ ] **Step 2: Record size in progress doc** — target 20–40MB stretch goal

---

## Exit Criteria

- [ ] Themes + grammars work
- [ ] No git/terminal/language-server extensions in output
- [ ] Install size documented

## Next

→ [Phase 6: Menus and Commands](./2026-08-23-minimal-editor-workbench-pivot-phase-06-menus-and-commands.md)
