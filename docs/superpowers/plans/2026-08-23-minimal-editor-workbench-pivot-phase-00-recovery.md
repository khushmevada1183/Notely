# Minimal Editor Workbench Pivot — Phase 0: Recovery

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Parent: [workbench-pivot-index.md](./2026-08-23-minimal-editor-workbench-pivot-index.md)

**Goal:** Restore the VS Code source tree from `master` and prove the stock workbench boots — establishing the baseline for all visual/theming work.

**Architecture:** Git restore of deleted paths; no new application code.

---

### Task 1: Create pivot branch from master

**Files:**
- Branch: `feat/minimal-editor-workbench` from `master`

- [ ] **Step 1: Verify master has workbench**

Run:
```bash
git show master:src/vs/workbench/electron-browser/desktop.main.ts | head -5
```
Expected: TypeScript copyright header + imports (not "fatal: path does not exist")

- [ ] **Step 2: Create branch**

Run:
```bash
git checkout master
git checkout -b feat/minimal-editor-workbench
```

- [ ] **Step 3: Cherry-pick docs only from old feature branch (optional)**

Run:
```bash
git checkout feat/minimal-editor -- .kiro/ docs/superpowers/plans/
git add .kiro docs/superpowers/plans
git commit -m "$(cat <<'EOF'
docs: add workbench pivot plans and keep kiro specs

EOF
)"
```

---

### Task 2: Restore deleted VS Code core from master

**Files:**
- Restore: `src/vs/`, `src/main.ts`, `src/bootstrap-*.ts`, `src/vscode-dts/`
- Restore: `extensions/` (full tree — slice comes in Phase 5)
- Restore: original root `package.json`, `package-lock.json` from master

- [ ] **Step 1: Restore paths**

Run:
```bash
git checkout master -- src/vs src/main.ts src/bootstrap-node.ts src/bootstrap-fork.ts src/bootstrap-esm.ts src/bootstrap-cli.ts src/bootstrap-window.ts src/bootstrap-server.ts src/bootstrap-meta.ts src/vscode-dts extensions package.json package-lock.json
```

Adjust bootstrap file list to match what exists on master:
```bash
git ls-tree --name-only master src/ | rg '^src/bootstrap'
```

- [ ] **Step 2: Verify workbench directory size**

Run:
```bash
du -sh src/vs/workbench
```
Expected: tens of MB (not empty)

- [ ] **Step 3: Commit restore**

Run:
```bash
git add -A
git status   # confirm src/vs/ restored, minimal-* may coexist temporarily
git commit -m "$(cat <<'EOF'
restore: VS Code workbench and bootstrap from master

Recovery baseline for workbench-first minimal editor pivot.
Parallel minimal-* stack kept temporarily until Phase 4.

EOF
)"
```

---

### Task 3: Install dependencies and compile

**Files:**
- Uses: root `package.json` from master

- [ ] **Step 1: Install**

Run:
```bash
npm install
```
Expected: completes without error (may take several minutes)

- [ ] **Step 2: Compile**

Run:
```bash
npm run compile
```
Expected: exit 0

If compile fails due to conflict with leftover `src/minimal-*.ts`, move minimal sources aside:
```bash
mkdir -p _deprecated-minimal-standalone
git mv src/minimal-*.ts _deprecated-minimal-standalone/ 2>/dev/null || true
npm run compile
```

- [ ] **Step 3: Commit compile fixes (if any)**

Only if Step 2 required changes beyond moving deprecated files.

---

### Task 4: Boot stock VS Code workbench (smoke test)

**Files:**
- Entry: `src/main.ts` → out build → Electron

- [ ] **Step 1: Launch**

Run:
```bash
./scripts/code.sh --no-sandbox
```
Or on Linux without script:
```bash
node build/lib/electron.js 2>/dev/null || npm run electron
```
Use project's documented launch skill if present: `.agents/skills/launch/SKILL.md`

- [ ] **Step 2: Visual verify**

Confirm:
- Full VS Code UI appears (activity bar, sidebar — expected at this stage)
- Editor opens; Dark+ or default theme applies to **entire window**
- Find (Ctrl+F) shows VS Code find widget

- [ ] **Step 3: Document baseline screenshot path**

Save note in `.superpowers/sdd/progress.md`:
```markdown
## Phase 0 complete
- Date: YYYY-MM-DD
- Branch: feat/minimal-editor-workbench
- Stock workbench boots: yes/no
- Compile time: Xm
```

- [ ] **Step 4: Commit progress doc**

```bash
git add .superpowers/sdd/progress.md
git commit -m "$(cat <<'EOF'
docs: record Phase 0 workbench recovery smoke test

EOF
)"
```

---

### Task 5: Inventory parallel stack for Phase 4 deletion

**Files:**
- Document only — no deletion in Phase 0

- [ ] **Step 1: List parallel minimal files**

Run:
```bash
ls -la src/minimal-*.ts build/minimal-* resources/index.html 2>/dev/null; rg -l "monaco-editor" package.json build/minimal-build.cjs 2>/dev/null
```

- [ ] **Step 2: Add inventory to progress doc**

List files marked `DELETE_IN_PHASE_4` so Phase 4 agent does not miss any.

---

## Phase 0 Exit Criteria

- [ ] `src/vs/workbench/` exists and compiles
- [ ] Stock workbench launches locally
- [ ] Pivot branch created from `master`
- [ ] Parallel minimal stack **not deleted yet** (Phase 4)
- [ ] Ready for Phase 1 (`product.json` branding)

## Next

→ [Phase 1: Product Identity](./2026-08-23-minimal-editor-workbench-pivot-phase-01-product-identity.md)
