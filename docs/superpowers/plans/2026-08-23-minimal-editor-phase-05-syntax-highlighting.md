# Minimal Editor Phase 5: Syntax Highlighting — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** TextMate grammar extraction, onigasm WASM loading, wire grammars to Monaco for all required file extensions.

**Architecture:** Build extracts grammars to `resources/grammars/`; `grammar-service.ts` creates Registry + wireTmGrammars on editor init.

**Tech Stack:** onigasm, monaco-textmate, vscode-textmate, Monaco.

## Global Constraints

(Same as master plan — supported extensions list, no LSP/IntelliSense.)

**Prerequisite:** Phase 3 Task 7 (Monaco running), Phase 1 deps installed.

---

### Task 13: Extract TextMate Grammars

**Files:**
- Create: `scripts/extract-grammars.js`
- Create: `resources/grammars/manifest.json`
- Modify: `build/gulpfile.minimal.ts`

**Interfaces:**
- Produces: `resources/grammars/<scope>.json`; manifest `{ languageId, scopeName, file }`

- [ ] **Step 1: Define language-to-scope map**

Create `src/language-scope-map.ts`:

```typescript
export const LANGUAGE_TO_SCOPE: Record<string, string> = {
	javascript: 'source.js', typescript: 'source.ts', javascriptreact: 'source.js.jsx',
	typescriptreact: 'source.tsx', python: 'source.python', java: 'source.java',
	c: 'source.c', cpp: 'source.cpp', rust: 'source.rust', go: 'source.go',
	html: 'text.html.basic', css: 'source.css', json: 'source.json',
	markdown: 'text.html.markdown', xml: 'text.xml', yaml: 'source.yaml',
	sql: 'source.sql', shell: 'source.shell', bat: 'source.batchfile',
	php: 'source.php', ruby: 'source.ruby', swift: 'source.swift',
	kotlin: 'source.kotlin', plaintext: 'text.plain',
};
```

- [ ] **Step 2: Write extract-grammars.js**

Scan `extensions/*/package.json` for `contributes.grammars`, copy referenced `.json` grammar files to `resources/grammars/`, build manifest for scopes in `LANGUAGE_TO_SCOPE`.

- [ ] **Step 3: Run extraction**

Run: `node scripts/extract-grammars.js`
Expected: 20+ grammar files, manifest lists all required scopes

- [ ] **Step 4: Copy onigasm.wasm to resources**

```bash
cp node_modules/onigasm/lib/onigasm.wasm resources/grammars/onigasm.wasm
```

- [ ] **Step 5: Commit**

```bash
git add scripts/extract-grammars.js resources/grammars/ src/language-scope-map.ts
git commit -m "feat(minimal): extract TextMate grammars"
```

---

### Task 14: Integrate TextMate Grammar Support

**Files:**
- Create: `src/grammar-service.ts`
- Modify: `src/minimal-renderer.ts`

**Interfaces:**
- Produces: `initSyntaxHighlighting(editor: monaco.editor.IStandaloneCodeEditor): Promise<void>`

- [ ] **Step 1: Implement grammar-service.ts**

```typescript
import * as monaco from 'monaco-editor';
import { Registry } from 'monaco-textmate';
import { wireTmGrammars } from 'monaco-editor-textmate';
import { loadWASM } from 'onigasm';
import { LANGUAGE_TO_SCOPE } from './language-scope-map';

let wasmLoaded = false;

export async function initSyntaxHighlighting(): Promise<void> {
	if (!wasmLoaded) {
		const resp = await fetch('./resources/grammars/onigasm.wasm');
		const wasmBinary = await resp.arrayBuffer();
		await loadWASM(wasmBinary);
		wasmLoaded = true;
	}

	const manifestResp = await fetch('./resources/grammars/manifest.json');
	const manifest = await manifestResp.json() as Array<{ scopeName: string; file: string }>;

	const registry = new Registry({
		getGrammarDefinition: async (scopeName: string) => {
			const entry = manifest.find(m => m.scopeName === scopeName);
			if (!entry) return { format: 'json' as const, content: '{}' };
			const grammarResp = await fetch(`./resources/grammars/${entry.file}`);
			return { format: 'json' as const, content: await grammarResp.text() };
		},
	});

	await wireTmGrammars(monaco, registry, LANGUAGE_TO_SCOPE);
}
```

Note: verify exact API for installed `monaco-textmate` / `monaco-editor-textmate` versions — adjust import paths if package exports differ.

- [ ] **Step 2: Call on renderer init (lazy after first paint)**

```typescript
async function initMinimalEditor(): void {
	// ... create editor ...
	void initSyntaxHighlighting(); // non-blocking for startup perf
}
```

- [ ] **Step 3: Manual verification**

Open `test-samples/sample.js`, `sample.py`, `sample.rs` — verify token colors

- [ ] **Step 4: Commit**

```bash
git add src/grammar-service.ts src/minimal-renderer.ts
git commit -m "feat(minimal): wire TextMate grammars to Monaco"
```

---

**Next:** [Phase 6 — Editor Features](./2026-08-23-minimal-editor-phase-06-editor-features.md)
