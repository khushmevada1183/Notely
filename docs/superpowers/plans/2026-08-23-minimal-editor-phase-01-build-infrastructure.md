# Minimal Editor Phase 1: Build Infrastructure — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the minimal-editor build pipeline separate from VS Code's gulp compile — config validation, esbuild bundling, npm scripts, minimal dependency tree.

**Architecture:** `build/minimal.config.cjs` drives esbuild entry points; `build/gulpfile.minimal.ts` exposes gulp tasks callable from root `package.json` scripts; `package-minimal.json` holds ~20 deps installed to `node_modules-minimal/` or merged via script alias.

**Tech Stack:** esbuild (already in build/), rimraf, npm-run-all2, TypeScript, Node CJS test scripts.

## Global Constraints

- Startup window visible and editor interactive within **1000ms** (quad-core, 8GB RAM, SSD)
- Memory: **< 100MB** empty file, **< 200MB** for 10K-line file
- File open (< 1MB): **< 200ms**; theme switch: **< 100ms**
- **No** telemetry, extension system, Git, terminal, debugger, multi-file search, LSP/IntelliSense, settings UI, workspace/multi-root, remote dev, webviews, activity bar, side panels
- Supported extensions for syntax: `c, js, md, txt, json, html, css, py, java, cpp, rs, go, ts, jsx, tsx, xml, yaml, sql, sh, bat, php, rb, swift, kt`
- Config dir: `~/.config/minimal-editor/` (Linux), `%APPDATA%/MinimalEditor` (Win), `~/Library/Application Support/MinimalEditor` (macOS)
- App ID: `com.minimal.editor`; output: `out-minimal/`, dist: `dist-minimal/`
- Native menus (File/Edit/View), native file dialogs, platform shortcuts (Ctrl vs Cmd)

**Prerequisite:** `build/minimal.config.cjs`, `validate-minimal-config.cjs`, `test-minimal-config.cjs` already exist and pass.

---

### Task 1: Complete Minimal Build Configuration

**Files:**
- Create: `build/gulpfile.minimal.ts`
- Create: `package-minimal.json`
- Modify: `package.json` (add minimal build scripts only)
- Modify: `.gitignore` (add `dist-minimal/`, `node_modules-minimal/` if used)
- Test: `build/test-minimal-config.cjs` (exists)

**Interfaces:**
- Consumes: `build/minimal.config.cjs` exports `{ entryPoints, output, external, bundle }`
- Produces: gulp tasks `clean-minimal`, `compile-minimal`, `copy-minimal-resources`, `build-minimal`; npm scripts at repo root

- [ ] **Step 1: Write failing gulp task test**

Add to `build/test-minimal-config.cjs` after existing tests:

```javascript
const { execSync } = require('child_process');

console.log('\n5. Gulp Tasks:');
test('  gulpfile.minimal.ts exists', () => fs.existsSync(path.join(__dirname, 'gulpfile.minimal.ts')));
test('  package-minimal.json exists', () => fs.existsSync(path.join(__dirname, '..', 'package-minimal.json')));
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node build/test-minimal-config.cjs`
Expected: FAIL — gulpfile.minimal.ts / package-minimal.json missing

- [ ] **Step 3: Create package-minimal.json**

```json
{
  "name": "minimal-editor",
  "version": "0.1.0",
  "private": true,
  "main": "out-minimal/minimal-main.js",
  "dependencies": {
    "electron": "^28.3.3",
    "monaco-editor": "^0.45.0",
    "monaco-textmate": "^3.0.1",
    "onigasm": "^2.2.5",
    "vscode-textmate": "^9.2.0"
  },
  "devDependencies": {
    "electron-builder": "^24.13.3",
    "esbuild": "^0.19.12",
    "npm-run-all2": "^6.2.0",
    "rimraf": "^5.0.10",
    "typescript": "^5.3.3"
  },
  "scripts": {
    "clean": "rimraf out-minimal dist-minimal",
    "compile-minimal": "node build/run-gulp-minimal.cjs compile-minimal",
    "copy-resources": "node build/run-gulp-minimal.cjs copy-minimal-resources",
    "build-minimal": "npm-run-all2 clean compile-minimal copy-resources",
    "start-minimal": "electron out-minimal/minimal-main.js",
    "package-minimal": "electron-builder --config electron-builder.json"
  }
}
```

- [ ] **Step 4: Create build/gulpfile.minimal.ts**

```typescript
import { gulp } from './lib/gulp/facade.ts';
import * as esbuild from 'esbuild';
import * as fs from 'fs';
import * as path from 'path';
import * as task from './lib/gulp/task.ts';
import { rimraf } from 'rimraf';

const root = path.dirname(import.meta.dirname);
const config = require('./minimal.config.cjs');

const outDir = path.join(root, config.output.dir);

const compileMinimalTask = task.define('compile-minimal', async () => {
	const entryPoints = Object.entries(config.entryPoints as Record<string, string>);
	await Promise.all(entryPoints.map(async ([name, entry]) => {
		await esbuild.build({
			entryPoints: [path.join(root, entry as string)],
			outfile: path.join(outDir, `${name === 'main' ? 'minimal-main' : name === 'renderer' ? 'minimal-renderer' : 'minimal-preload'}.js`),
			bundle: true,
			platform: name === 'main' || name === 'preload' ? 'node' : 'browser',
			format: 'cjs',
			external: config.external,
			sourcemap: true,
			logLevel: 'info',
		});
	}));
});

const copyMinimalResourcesTask = task.define('copy-minimal-resources', () => {
	const resourcesSrc = path.join(root, 'resources');
	const resourcesDest = path.join(outDir, 'resources');
	if (fs.existsSync(resourcesSrc)) {
		fs.cpSync(resourcesSrc, resourcesDest, { recursive: true });
	}
	// Copy monaco workers when renderer exists
	const monacoWorkers = path.join(root, 'node_modules', 'monaco-editor', 'min', 'vs');
	if (fs.existsSync(monacoWorkers)) {
		fs.cpSync(monacoWorkers, path.join(outDir, 'vs'), { recursive: true });
	}
});

const cleanMinimalTask = task.define('clean-minimal', async () => {
	await rimraf(outDir);
});

gulp.task(compileMinimalTask);
gulp.task(copyMinimalResourcesTask);
gulp.task(cleanMinimalTask);
gulp.task(task.define('build-minimal', task.series(cleanMinimalTask, compileMinimalTask, copyMinimalResourcesTask)));
```

- [ ] **Step 5: Create build/run-gulp-minimal.cjs helper**

```javascript
#!/usr/bin/env node
const { spawnSync } = require('child_process');
const task = process.argv[2];
const result = spawnSync('npx', ['tsx', 'build/gulpfile.minimal.ts', task], {
	stdio: 'inherit',
	cwd: require('path').join(__dirname, '..'),
	shell: true,
});
process.exit(result.status ?? 1);
```

Note: wire gulp task execution to match existing repo pattern — check `build/gulpfile.ts` for how tasks are invoked; adjust runner if repo uses `npm run gulp -- compile-minimal` instead.

- [ ] **Step 6: Add root package.json scripts**

Add to root `package.json` `"scripts"`:

```json
"minimal:validate": "node build/validate-minimal-config.cjs",
"minimal:test-config": "node build/test-minimal-config.cjs",
"minimal:build": "npm --prefix . run build-minimal --prefix-path-as-cwd || npm run --prefix ./package-minimal.json build-minimal",
"minimal:start": "electron out-minimal/minimal-main.js"
```

Prefer: copy minimal scripts into root `package.json` directly to avoid dual-package confusion:

```json
"minimal:clean": "rimraf out-minimal dist-minimal",
"minimal:compile": "node build/run-gulp-minimal.cjs compile-minimal",
"minimal:copy-resources": "node build/run-gulp-minimal.cjs copy-minimal-resources",
"minimal:build": "npm-run-all2 minimal:clean minimal:compile minimal:copy-resources"
```

- [ ] **Step 7: Update .gitignore**

Append:

```
dist-minimal/
node_modules-minimal/
```

(`/out*/` already ignores `out-minimal/`)

- [ ] **Step 8: Run tests to verify they pass**

Run: `node build/test-minimal-config.cjs`
Expected: PASS (all tests including new gulp/package checks)

Run: `node build/validate-minimal-config.cjs`
Expected: exit 0

- [ ] **Step 9: Commit**

```bash
git add build/gulpfile.minimal.ts build/run-gulp-minimal.cjs package-minimal.json package.json .gitignore build/test-minimal-config.cjs
git commit -m "feat(minimal): complete build pipeline scaffolding

- Add gulpfile.minimal.ts with esbuild compile tasks
- Add package-minimal.json with ~20 dependencies
- Wire npm scripts for minimal build"
```

---

### Task 2: Set Up Minimal Dependencies

**Files:**
- Modify: `package-minimal.json`
- Create: `scripts/install-minimal-deps.sh`
- Test: `build/test-minimal-deps.cjs` (new)

**Interfaces:**
- Consumes: `package-minimal.json`
- Produces: installed deps; `build/test-minimal-deps.cjs` asserting dep count < 25

- [ ] **Step 1: Write failing dependency count test**

Create `build/test-minimal-deps.cjs`:

```javascript
#!/usr/bin/env node
const pkg = require('../package-minimal.json');
const depCount = Object.keys(pkg.dependencies || {}).length;
const devCount = Object.keys(pkg.devDependencies || {}).length;
const total = depCount + devCount;
console.log('Dependency count:', total);
if (total > 25) {
	console.error('FAIL: too many dependencies', total);
	process.exit(1);
}
if (depCount !== 5) {
	console.error('FAIL: expected 5 runtime deps, got', depCount);
	process.exit(1);
}
console.log('PASS');
process.exit(0);
```

- [ ] **Step 2: Run test (should pass on package-minimal.json structure)**

Run: `node build/test-minimal-deps.cjs`
Expected: PASS (validates package file; install not yet verified)

- [ ] **Step 3: Install minimal dependencies**

Option A — install from package-minimal.json into project root (simplest):

```bash
npm install --save-dev --no-save electron@^28.3.3 electron-builder@^24.13.3 esbuild@^0.19.12 rimraf@^5.0.10
npm install --save --no-save monaco-editor@^0.45.0 monaco-textmate@^3.0.1 onigasm@^2.2.5 vscode-textmate@^9.2.0
```

Option B — isolated install:

```bash
mkdir -p node_modules-minimal
npm install --prefix node_modules-minimal --package-lock-only=false --package-json=package-minimal.json
```

Document chosen approach in `build/MINIMAL_CONFIG_README.md`.

- [ ] **Step 4: Verify install size**

Run: `du -sh node_modules/monaco-editor node_modules/electron 2>/dev/null | head -5`
Expected: combined reasonable; full node_modules already large in VS Code repo — minimal *incremental* deps only

- [ ] **Step 5: Smoke-test compile (expect fail on missing src — that's OK)**

Run: `npm run minimal:compile`
Expected: FAIL with "Could not resolve src/minimal-main.ts" — confirms pipeline runs, src files come in Phase 2

- [ ] **Step 6: Add minimal:deps script to package.json**

```json
"minimal:deps-test": "node build/test-minimal-deps.cjs"
```

- [ ] **Step 7: Commit**

```bash
git add package-minimal.json build/test-minimal-deps.cjs build/MINIMAL_CONFIG_README.md package.json scripts/install-minimal-deps.sh
git commit -m "feat(minimal): add minimal dependency set and validation"
```

---

## Phase 1 Verification Checklist

- [ ] `node build/test-minimal-config.cjs` — all pass
- [ ] `node build/test-minimal-deps.cjs` — pass
- [ ] `build/gulpfile.minimal.ts` exists with compile/copy/clean tasks
- [ ] `package-minimal.json` has 5 runtime + 5 dev dependencies
- [ ] Root npm scripts: `minimal:validate`, `minimal:build`, `minimal:compile`

**Next:** [Phase 2 — Main Process](./2026-08-23-minimal-editor-phase-02-main-process.md)
