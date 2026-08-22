# Minimal Editor Phase 8: Packaging & Optimization — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** electron-builder config for Win/macOS/Linux; production bundle optimization for size and startup.

**Architecture:** Package `out-minimal/` + resources; esbuild production mode without sourcemaps; tree-shake Monaco.

**Tech Stack:** electron-builder 24+, esbuild minify.

## Global Constraints

- App bundle (excluding Electron runtime): **20–40MB**
- Full install with Electron: **120–160MB**
- Startup **< 1000ms**; memory empty file **< 100MB**

**Prerequisite:** Phases 1–7 feature-complete.

---

### Task 20: Create Electron Packaging Configuration

**Files:**
- Create: `electron-builder.json`
- Create: `resources/icon.png` (512×512 placeholder)
- Modify: `package-minimal.json`

**Interfaces:**
- Produces: installers in `dist-minimal/`

- [ ] **Step 1: Create electron-builder.json**

```json
{
  "appId": "com.minimal.editor",
  "productName": "Minimal Editor",
  "directories": {
    "output": "dist-minimal",
    "buildResources": "resources"
  },
  "files": [
    "out-minimal/**/*",
    "resources/**/*",
    "package-minimal.json"
  ],
  "extraMetadata": {
    "main": "out-minimal/minimal-main.js"
  },
  "mac": {
    "category": "public.app-category.developer-tools",
    "target": ["dmg", "zip"],
    "icon": "resources/icon.icns"
  },
  "win": {
    "target": ["nsis", "portable"],
    "icon": "resources/icon.ico"
  },
  "linux": {
    "target": ["AppImage", "deb"],
    "category": "Development",
    "icon": "resources/icon.png"
  }
}
```

- [ ] **Step 2: Add placeholder icons**

Use VS Code codicon or generate simple PNG; for macOS/Windows convert with `electron-icon-builder` or copy from `resources/linux/code.png` if license permits.

- [ ] **Step 3: Add package scripts**

```json
"package-minimal:linux": "npm run minimal:build && electron-builder --linux --config electron-builder.json",
"package-minimal:win": "npm run minimal:build && electron-builder --win --config electron-builder.json",
"package-minimal:mac": "npm run minimal:build && electron-builder --mac --config electron-builder.json"
```

- [ ] **Step 4: Build Linux package (on Linux CI or local)**

Run: `npm run package-minimal:linux`
Expected: `dist-minimal/Minimal Editor-0.1.0.AppImage` created

- [ ] **Step 5: Smoke test packaged app**

Run AppImage/binary → open file, save, theme switch

- [ ] **Step 6: Commit**

```bash
git add electron-builder.json resources/icon.* package-minimal.json package.json
git commit -m "feat(minimal): electron-builder packaging configuration"
```

---

### Task 21: Optimize Bundle Size

**Files:**
- Modify: `build/gulpfile.minimal.ts`
- Create: `scripts/analyze-minimal-bundle.js`

**Interfaces:**
- Production build flag: `MINIMAL_PRODUCTION=1`

- [ ] **Step 1: Add production esbuild options**

```typescript
const isProd = process.env.MINIMAL_PRODUCTION === '1';

await esbuild.build({
	// ...
	minify: isProd,
	sourcemap: !isProd,
	treeShaking: true,
	drop: isProd ? ['console'] : [],
});
```

- [ ] **Step 2: Add bundle size script**

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
function dirSize(p) {
	let size = 0;
	for (const f of fs.readdirSync(p, { withFileTypes: true })) {
		const fp = path.join(p, f.name);
		size += f.isDirectory() ? dirSize(fp) : fs.statSync(fp).size;
	}
	return size;
}
const outDir = path.join(__dirname, '..', 'out-minimal');
const mb = (dirSize(outDir) / 1024 / 1024).toFixed(2);
console.log(`out-minimal size: ${mb} MB`);
if (parseFloat(mb) > 40) process.exit(1);
```

- [ ] **Step 3: Production build and measure**

Run: `MINIMAL_PRODUCTION=1 npm run minimal:build && node scripts/analyze-minimal-bundle.js`
Expected: exit 0 if under 40MB app bundle

- [ ] **Step 4: Profile startup**

Run packaged app; measure `app.ready` → editor interactive
Target: < 1000ms

- [ ] **Step 5: Commit**

```bash
git add build/gulpfile.minimal.ts scripts/analyze-minimal-bundle.js package.json
git commit -m "feat(minimal): production minification and bundle size gate"
```

---

**Next:** [Phase 9–10 — Testing & Release](./2026-08-23-minimal-editor-phase-09-10-testing-release.md)
