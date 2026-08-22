# Minimal Editor Workbench Pivot — Phase 7: Performance

> Parent: [workbench-pivot-index.md](./2026-08-23-minimal-editor-workbench-pivot-index.md) · Prerequisite: [Phase 6](./2026-08-23-minimal-editor-workbench-pivot-phase-06-menus-and-commands.md)

**Goal:** Meet Req 7 startup and memory targets on workbench build — measure before further deletion.

---

### Task 1: Startup benchmark

**Files:**
- Adapt: `scripts/perf-minimal-startup.cjs` for workbench launch

- [ ] **Step 1: Measure cold start to interactive editor**

Target: **< 1000ms**

- [ ] **Step 2: If over target**, profile before deleting code:
  - Lazy-load removed contribs (already not imported)
  - Reduce built-in extensions further
  - Electron args / V8 snapshots (advanced)

---

### Task 2: Memory benchmark

- [ ] Empty file: **< 100MB**
- [ ] 10K-line file: **< 200MB**

---

### Task 3: File open latency

- [ ] < 200ms for < 1MB file (Req 7.4)

---

### Task 4: Document tradeoffs

If workbench cannot hit 100MB without losing visuals, document in README:
- Actual numbers
- What was trimmed vs full VS Code
- User decision: accept slightly higher memory for visual parity

**Do not** revert to standalone Monaco to hit memory number.

---

## Exit Criteria

- [ ] Benchmarks recorded in progress doc
- [ ] Best-effort optimization applied
- [ ] Tradeoffs documented if targets missed

## Next

→ [Phase 8: Packaging and Release](./2026-08-23-minimal-editor-workbench-pivot-phase-08-packaging-release.md)
