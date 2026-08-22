# Task List: Minimal Editor Implementation

## Overview

This task list breaks down the transformation of VS Code into a minimal, lightweight notepad application. Tasks are organized in dependency order and sized for 1-2 day completion cycles.

**Total Estimated Effort:** 15-20 days
**Priority:** Execute in order listed
**Testing:** Each task includes verification steps

---

## Phase 1: Project Setup & Build Infrastructure (Days 1-2)

### Task 1: Create Minimal Build Configuration

**Goal:** Set up a new build pipeline for the minimal editor separate from VS Code's build system.

**Dependencies:** None

**Files:**
- Create: `build/minimal.config.js`
- Create: `build/gulpfile.minimal.ts`
- Create: `package-minimal.json`
- Modify: `.gitignore`

**Steps:**

1. **Create minimal build configuration file**
   ```javascript
   // build/minimal.config.js
   module.exports = {
     entryPoints: {
       main: 'src/minimal-main.ts',
       renderer: 'src/minimal-renderer.ts',
       preload: 'src/minimal-preload.ts'
     },
     output: {
       dir: 'out-minimal',
       format: 'cjs'
     },
     external: ['electron', 'fs', 'path', 'crypto', 'os']
   };
   ```

2. **Create simplified package.json for minimal editor**
   - Remove all VS Code specific dependencies
   - Keep only: electron, monaco-editor, onigasm, monaco-textmate, vscode-textmate
   - Add build scripts: clean, compile-minimal, bundle-monaco, package-minimal

3. **Create gulp task for minimal build**
   - Define clean task
   - Define TypeScript compilation task
   - Define resource copying task
   - Define packaging task

4. **Update .gitignore**
   - Add `out-minimal/`
   - Add `dist-minimal/`
   - Add `node_modules-minimal/`

**Verification:**
- [x] Run `npm run clean` - no errors
- [x] Build configuration file validates
- [-] package-minimal.json has ~20 dependencies (vs 300+ in original)

**Estimated Time:** 4 hours

---

### Task 2: Set Up Minimal Dependencies

**Goal:** Create a minimal dependency tree with only essential packages.

**Dependencies:** Task 1

**Files:**
- Create: `package-minimal.json` (complete dependency list)
- Create: `.npmrc` (for minimal install)

**Steps:**

1. **Define minimal dependencies in package-minimal.json**
   ```json
   {
     "dependencies": {
       "electron": "^28.0.0",
       "monaco-editor": "^0.45.0",
       "onigasm": "^2.2.5",
       "monaco-textmate": "^3.0.1",
       "vscode-textmate": "^9.0.0"
     },
     "devDependencies": {
       "typescript": "^5.3.0",
       "electron-builder": "^24.0.0",
       "esbuild": "^0.19.0",
       "rimraf": "^5.0.0",
       "npm-run-all": "^4.1.5"
     }
   }
   ```

2. **Install minimal dependencies**
   - Run `npm install` with package-minimal.json
   - Verify installation completes
   - Check node_modules size (~150MB target)

3. **Create npm scripts for minimal build**
   - `clean`: Remove out-minimal directory
   - `compile-minimal`: TypeScript compilation
   - `bundle-monaco`: Bundle Monaco editor
   - `copy-resources`: Copy themes and grammars
   - `package-minimal`: Package with Electron
   - `build-minimal`: Run all steps

**Verification:**
- [~] npm install completes successfully
- [~] node_modules size < 200MB
- [~] All scripts execute without errors
- [~] Dependency count ~15-20 packages

**Estimated Time:** 2 hours

---

## Phase 2: Main Process Implementation (Days 3-4)

### Task 3: Create Minimal Main Process Entry Point

**Goal:** Implement simplified Electron main process bootstrap.

**Dependencies:** Task 2

**Files:**
- Create: `src/minimal-main.ts`
- Create: `src/minimal-preload.ts`
- Create: `src/minimal-config.ts`

**Steps:**

1. **Create minimal-main.ts**
   ```typescript
   import { app, BrowserWindow } from 'electron';
   import * as path from 'path';

   let mainWindow: BrowserWindow | null = null;

   app.on('ready', () => {
     createWindow();
     createMenu();
   });

   function createWindow() {
     mainWindow = new BrowserWindow({
       width: 1200,
       height: 800,
       webPreferences: {
         nodeIntegration: false,
         contextIsolation: true,
         preload: path.join(__dirname, 'minimal-preload.js')
       }
     });
     mainWindow.loadFile('index.html');
   }
   ```

2. **Create minimal-preload.ts**
   - Expose safe IPC APIs to renderer
   - Define electronAPI interface
   - Implement contextBridge

3. **Create minimal-config.ts**
   - Define configuration interface
   - Implement loadConfig() function
   - Implement saveConfig() function
   - Use JSON file storage in user data directory

**Verification:**
- [~] Application window opens successfully
- [~] Window has correct dimensions (1200x800)
- [~] Preload script loads without errors
- [~] Config file is created in user data directory

**Estimated Time:** 4 hours

---

### Task 4: Implement File Operations IPC Handlers

**Goal:** Add IPC handlers for file open, save, and save as operations.

**Dependencies:** Task 3

**Files:**
- Modify: `src/minimal-main.ts`
- Create: `src/minimal-file-service.ts`

**Steps:**

1. **Create file service module**
   ```typescript
   export async function openFile(): Promise<FileData | null> {
     const result = await dialog.showOpenDialog({
       properties: ['openFile'],
       filters: [{ name: 'All Files', extensions: ['*'] }]
     });
     if (result.canceled) return null;
     const content = await fs.promises.readFile(result.filePaths[0], 'utf8');
     return { path: result.filePaths[0], content };
   }
   ```

2. **Register IPC handlers in minimal-main.ts**
   - `ipcMain.handle('file:open', openFile)`
   - `ipcMain.handle('file:save', saveFile)`
   - `ipcMain.handle('file:saveAs', saveFileAs)`

3. **Implement atomic file writes**
   - Write to temporary file
   - Rename to target file
   - Handle errors appropriately

4. **Add file metadata detection**
   - Detect EOL (line endings)
   - Get file stats (mtime, size)
   - Return metadata with file content

**Verification:**
- [~] File open dialog appears
- [~] Selected file content is read correctly
- [~] Save operation writes file successfully
- [~] Save As dialog works correctly
- [~] File metadata is returned accurately

**Estimated Time:** 4 hours

---

### Task 5: Implement Native Menu System

**Goal:** Create platform-specific native menus (File, Edit, View).

**Dependencies:** Task 4

**Files:**
- Create: `src/minimal-menu.ts`
- Modify: `src/minimal-main.ts`

**Steps:**

1. **Create menu template for File menu**
   - New File (Ctrl/Cmd+N)
   - Open File (Ctrl/Cmd+O)
   - Save (Ctrl/Cmd+S)
   - Save As (Ctrl/Cmd+Shift+S)
   - Close Window (Ctrl/Cmd+W)
   - Exit (Ctrl+Q / Alt+F4)

2. **Create Edit menu template**
   - Undo (Ctrl/Cmd+Z)
   - Redo (Ctrl+Y / Cmd+Shift+Z)
   - Cut, Copy, Paste, Select All
   - Find (Ctrl/Cmd+F)
   - Replace (Ctrl+H / Cmd+Alt+F)

3. **Create View menu template**
   - Toggle Word Wrap
   - Toggle Line Numbers
   - Select Theme

4. **Implement platform-specific menu differences**
   - macOS: Application menu with About, Quit
   - Windows/Linux: Standard menu bar
   - Platform-specific keyboard shortcuts

5. **Connect menu items to IPC handlers**
   - Send commands to renderer process
   - Trigger file operations
   - Update window title

**Verification:**
- [~] Menus appear correctly on all platforms
- [~] Keyboard shortcuts work (Ctrl on Win/Linux, Cmd on macOS)
- [~] Menu items trigger correct actions
- [~] macOS shows app menu correctly

**Estimated Time:** 6 hours

---

## Phase 3: Renderer Process & Monaco Editor (Days 5-7)

### Task 6: Create Renderer Process Entry Point

**Goal:** Set up the renderer process with HTML shell and TypeScript entry.

**Dependencies:** Task 5

**Files:**
- Create: `src/minimal-renderer.ts`
- Create: `resources/index.html`
- Create: `resources/styles.css`

**Steps:**

1. **Create index.html shell**
   ```html
   <!DOCTYPE html>
   <html>
   <head>
     <meta charset="UTF-8">
     <title>Minimal Editor</title>
     <link rel="stylesheet" href="styles.css">
   </head>
   <body>
     <div id="container"></div>
     <script src="minimal-renderer.js"></script>
   </body>
   </html>
   ```

2. **Create minimal CSS**
   - Reset margins and padding
   - Full viewport height/width for editor
   - Hide scrollbars on body

3. **Create minimal-renderer.ts skeleton**
   - Import statements
   - Initialize editor placeholder
   - Setup IPC listeners
   - Export main function

4. **Setup IPC communication from renderer**
   - Use contextBridge API from preload
   - Define type-safe IPC methods
   - Handle file content updates

**Verification:**
- [~] HTML loads in Electron window
- [~] Container div is present
- [~] CSS applies correctly
- [~] Renderer script loads without errors
- [~] IPC communication works

**Estimated Time:** 3 hours

---

### Task 7: Integrate Monaco Editor

**Goal:** Initialize Monaco editor in the renderer process.

**Dependencies:** Task 6

**Files:**
- Modify: `src/minimal-renderer.ts`
- Create: `src/monaco-config.ts`

**Steps:**

1. **Configure Monaco environment**
   ```typescript
   self.MonacoEnvironment = {
     getWorkerUrl: function (moduleId, label) {
       if (label === 'json') return './json.worker.js';
       if (label === 'css') return './css.worker.js';
       if (label === 'html') return './html.worker.js';
       if (label === 'typescript') return './ts.worker.js';
       return './editor.worker.js';
     }
   };
   ```

2. **Initialize Monaco editor instance**
   ```typescript
   const editor = monaco.editor.create(container, {
     value: '',
     language: 'plaintext',
     theme: 'vs-dark',
     automaticLayout: true,
     minimap: { enabled: false },
     scrollBeyondLastLine: false,
     fontSize: 14,
     lineNumbers: 'on',
     wordWrap: 'off'
   });
   ```

3. **Bundle Monaco editor workers**
   - Copy worker files to output directory
   - Configure webpack/esbuild for Monaco
   - Ensure workers load correctly

4. **Setup editor event listeners**
   - onChange: Track dirty state
   - onDidChangeCursorPosition: Update status
   - onDidChangeModelContent: Mark as modified

**Verification:**
- [~] Monaco editor appears in window
- [~] Can type in the editor
- [~] Line numbers display
- [~] Cursor is visible and responsive
- [~] Workers load without errors

**Estimated Time:** 4 hours

---

### Task 8: Implement File Loading in Editor

**Goal:** Load file content into Monaco editor when file is opened.

**Dependencies:** Task 7

**Files:**
- Modify: `src/minimal-renderer.ts`
- Create: `src/language-detection.ts`

**Steps:**

1. **Implement language detection from file extension**
   ```typescript
   function detectLanguage(filename: string): string {
     const ext = filename.split('.').pop()?.toLowerCase();
     const map = {
       'js': 'javascript',
       'ts': 'typescript',
       'py': 'python',
       'java': 'java',
       // ... add all supported languages
     };
     return map[ext] || 'plaintext';
   }
   ```

2. **Handle file open from IPC**
   - Listen for file:opened event
   - Update editor value
   - Set language mode
   - Update window title
   - Reset dirty state

3. **Implement window title updates**
   - Show filename in title
   - Add asterisk (*) for unsaved changes
   - Clear title on new file

4. **Track current file state**
   - Store current file path
   - Track dirty flag
   - Store original content for comparison

**Verification:**
- [~] Opening a file displays content in editor
- [~] Correct language mode is set (e.g., JavaScript for .js files)
- [~] Window title shows filename
- [~] Dirty state tracks correctly when typing

**Estimated Time:** 3 hours

---

### Task 9: Implement File Saving from Editor

**Goal:** Save editor content to disk when save is triggered.

**Dependencies:** Task 8

**Files:**
- Modify: `src/minimal-renderer.ts`
- Modify: `src/minimal-main.ts`

**Steps:**

1. **Implement save operation**
   - Get current editor content
   - Check if file path exists
   - If no path, trigger Save As
   - Send save request via IPC

2. **Handle save response**
   - Update file metadata (mtime, size)
   - Clear dirty flag
   - Update window title (remove *)
   - Show success feedback

3. **Implement Save As operation**
   - Trigger save dialog via IPC
   - Get new file path from dialog
   - Save content to new path
   - Update current file reference

4. **Add keyboard shortcut handlers**
   - Ctrl/Cmd+S: Save
   - Ctrl/Cmd+Shift+S: Save As
   - Connect to menu actions

**Verification:**
- [~] Save writes file to disk correctly
- [~] Dirty flag clears after save
- [~] Window title updates (removes *)
- [~] Save As prompts for new location
- [~] Keyboard shortcuts trigger save operations

**Estimated Time:** 3 hours

---

## Phase 4: Theme System (Days 8-9)

### Task 10: Extract and Bundle VS Code Themes

**Goal:** Copy theme JSON files from VS Code extensions and prepare for bundling.

**Dependencies:** Task 2

**Files:**
- Create: `resources/themes/` directory
- Create: `scripts/extract-themes.js`
- Modify: `build/gulpfile.minimal.ts`

**Steps:**

1. **Create theme extraction script**
   - Scan `extensions/theme-*/themes/*.json`
   - Copy theme files to `resources/themes/`
   - Preserve theme metadata

2. **Add theme extraction to build pipeline**
   - Run extraction during build
   - Validate theme JSON structure
   - Report missing themes

3. **Create theme registry**
   - List all available themes
   - Map theme IDs to file paths
   - Include theme metadata (name, type)

4. **Bundle themes with application**
   - Copy to output directory
   - Ensure themes are accessible at runtime

**Verification:**
- [~] Theme extraction script runs successfully
- [~] All VS Code themes are copied
- [~] Theme JSON files are valid
- [~] Themes are bundled in output directory
- [~] At least 15 themes available (Light, Dark, HC, Monokai, Solarized, etc.)

**Estimated Time:** 3 hours

---

### Task 11: Implement Theme Service

**Goal:** Create theme loading and application service.

**Dependencies:** Task 10

**Files:**
- Create: `src/theme-service.ts`
- Create: `src/theme-converter.ts`

**Steps:**

1. **Implement theme loader**
   ```typescript
   async function loadThemes(): Promise<IThemeDefinition[]> {
     const themes = [];
     const themeFiles = await fs.promises.readdir('resources/themes');
     for (const file of themeFiles) {
       const content = await fs.promises.readFile(`resources/themes/${file}`);
       themes.push(JSON.parse(content));
     }
     return themes;
   }
   ```

2. **Create VS Code to Monaco theme converter**
   - Convert tokenColors to Monaco rules
   - Map color IDs to Monaco format
   - Handle theme inheritance

3. **Implement theme application**
   ```typescript
   function applyTheme(themeId: string) {
     const theme = getTheme(themeId);
     const monacoTheme = convertToMonacoTheme(theme);
     monaco.editor.defineTheme(themeId, monacoTheme);
     monaco.editor.setTheme(themeId);
   }
   ```

4. **Add theme persistence**
   - Save selected theme to config
   - Load theme on startup
   - Default to 'vs-dark' if not set

**Verification:**
- [~] Themes load successfully at startup
- [~] Theme converter produces valid Monaco themes
- [~] Applying theme changes editor appearance
- [~] Theme selection persists across restarts

**Estimated Time:** 4 hours

---

### Task 12: Add Theme Selection UI

**Goal:** Create UI for users to select themes.

**Dependencies:** Task 11

**Files:**
- Modify: `src/minimal-renderer.ts`
- Create: `src/theme-selector.ts`
- Create: `resources/theme-selector.html`
- Create: `resources/theme-selector.css`

**Steps:**

1. **Create theme selector modal**
   - Simple overlay with theme list
   - Show theme name and preview
   - Close on selection or Escape

2. **Implement theme list rendering**
   ```typescript
   function renderThemeList(themes: IThemeDefinition[]) {
     return themes.map(theme => `
       <div class="theme-item" data-id="${theme.id}">
         <span class="theme-name">${theme.label}</span>
         <span class="theme-type">${theme.uiTheme}</span>
       </div>
     `).join('');
   }
   ```

3. **Add theme selection handler**
   - Click on theme item
   - Apply selected theme
   - Close selector
   - Update config

4. **Connect to View menu**
   - "Select Theme" menu item
   - Opens theme selector
   - No keyboard shortcut (keep simple)

**Verification:**
- [~] Theme selector opens from View menu
- [~] All themes display in list
- [~] Clicking theme applies it immediately
- [~] Selector closes after selection
- [~] Selected theme persists

**Estimated Time:** 4 hours

---

## Phase 5: Syntax Highlighting (Days 10-11)

### Task 13: Extract TextMate Grammars

**Goal:** Copy grammar files from VS Code extensions.

**Dependencies:** Task 2

**Files:**
- Create: `resources/grammars/` directory
- Create: `scripts/extract-grammars.js`
- Modify: `build/gulpfile.minimal.ts`

**Steps:**

1. **Create grammar extraction script**
   - Scan `extensions/*/syntaxes/*.tmLanguage.json`
   - Copy grammar files to `resources/grammars/`
   - Maintain scopeName mapping

2. **Extract grammars for supported languages**
   - JavaScript, TypeScript, Python, Java
   - C, C++, Rust, Go
   - HTML, CSS, JSON, XML
   - Markdown, YAML, SQL, Shell
   - PHP, Ruby, Swift, Kotlin

3. **Create language-to-grammar mapping**
   ```typescript
   const languageMap = {
     'javascript': 'source.js',
     'typescript': 'source.ts',
     'python': 'source.python',
     // ... all supported languages
   };
   ```

4. **Bundle grammars with application**
   - Copy to output directory
   - Ensure grammars are accessible at runtime

**Verification:**
- [~] Grammar extraction runs successfully
- [~] All required grammars are copied (20+ languages)
- [~] Grammar files are valid JSON
- [~] Language mapping is complete

**Estimated Time:** 3 hours

---

### Task 14: Integrate TextMate Grammar Support

**Goal:** Wire TextMate grammars to Monaco editor for syntax highlighting.

**Dependencies:** Task 13

**Files:**
- Create: `src/grammar-service.ts`
- Modify: `src/minimal-renderer.ts`
- Add: `onigasm` WASM file

**Steps:**

1. **Load onigasm WASM module**
   ```typescript
   import { loadWASM } from 'onigasm';
   await loadWASM('/path/to/onigasm.wasm');
   ```

2. **Create TextMate registry**
   ```typescript
   const registry = new Registry({
     async getGrammarDefinition(scopeName) {
       const response = await fetch(`/grammars/${scopeName}.json`);
       return {
         format: 'json',
         content: await response.text()
       };
     }
   });
   ```

3. **Wire grammars to Monaco**
   ```typescript
   import { wireTmGrammars } from 'monaco-editor-textmate';
   await wireTmGrammars(monaco, registry, languageToScopeMap);
   ```

4. **Test syntax highlighting for all languages**
   - Create test files for each language
   - Verify highlighting works
   - Check theme color application

**Verification:**
- [~] Onigasm WASM loads successfully
- [~] Grammars are registered with Monaco
- [~] JavaScript syntax highlighting works
- [~] Python syntax highlighting works
- [~] All 20+ languages have working highlighting
- [~] Theme colors apply to syntax tokens

**Estimated Time:** 5 hours

---

## Phase 6: Find/Replace & Editor Features (Day 12)

### Task 15: Enable Monaco Find/Replace Widget

**Goal:** Activate and configure Monaco's built-in find/replace functionality.

**Dependencies:** Task 7

**Files:**
- Modify: `src/minimal-renderer.ts`
- Modify: `src/minimal-menu.ts`

**Steps:**

1. **Enable find controller in Monaco**
   ```typescript
   editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
     editor.getAction('actions.find').run();
   });
   ```

2. **Connect Find menu item**
   - Trigger find action from Edit menu
   - Ctrl/Cmd+F keyboard shortcut
   - Focus find input when opened

3. **Connect Replace menu item**
   - Trigger replace action from Edit menu
   - Ctrl+H / Cmd+Alt+F keyboard shortcut
   - Show both find and replace inputs

4. **Verify find/replace features**
   - Case sensitive toggle
   - Whole word toggle
   - Regular expression support
   - Navigate between matches
   - Replace single / Replace all

**Verification:**
- [~] Find widget opens with Ctrl/Cmd+F
- [~] Search highlights matches
- [~] Can navigate between matches
- [~] Replace widget opens with Ctrl+H
- [~] Replace operations work correctly
- [~] Regex search works

**Estimated Time:** 2 hours

---

### Task 16: Implement Editor Preferences

**Goal:** Add word wrap and line numbers toggle functionality.

**Dependencies:** Task 11

**Files:**
- Modify: `src/minimal-renderer.ts`
- Modify: `src/minimal-config.ts`
- Modify: `src/minimal-menu.ts`

**Steps:**

1. **Implement word wrap toggle**
   ```typescript
   function toggleWordWrap() {
     const current = editor.getOption(monaco.editor.EditorOption.wordWrap);
     const newValue = current === 'off' ? 'on' : 'off';
     editor.updateOptions({ wordWrap: newValue });
     saveConfig({ wordWrap: newValue });
   }
   ```

2. **Implement line numbers toggle**
   ```typescript
   function toggleLineNumbers() {
     const current = editor.getOption(monaco.editor.EditorOption.lineNumbers);
     const newValue = current === 'off' ? 'on' : 'off';
     editor.updateOptions({ lineNumbers: newValue });
     saveConfig({ lineNumbers: newValue });
   }
   ```

3. **Connect to View menu**
   - "Toggle Word Wrap" menu item
   - "Toggle Line Numbers" menu item
   - No keyboard shortcuts (keep simple)

4. **Load preferences on startup**
   - Read config file
   - Apply saved preferences to editor
   - Use defaults if not set

**Verification:**
- [~] Word wrap toggles on/off
- [~] Line numbers toggle on/off
- [~] Preferences persist across restarts
- [~] Menu items trigger toggles
- [~] Editor updates immediately

**Estimated Time:** 2 hours

---

## Phase 7: Polish & Error Handling (Day 13)

### Task 17: Implement Unsaved Changes Protection

**Goal:** Prompt user before closing window with unsaved changes.

**Dependencies:** Task 9

**Files:**
- Modify: `src/minimal-main.ts`
- Modify: `src/minimal-renderer.ts`

**Steps:**

1. **Track dirty state in renderer**
   ```typescript
   let isDirty = false;
   editor.onDidChangeModelContent(() => {
     isDirty = true;
     updateWindowTitle();
   });
   ```

2. **Send dirty state to main process**
   - IPC message when state changes
   - Store dirty flag in main process

3. **Intercept window close event**
   ```typescript
   mainWindow.on('close', (event) => {
     if (isDirty) {
       event.preventDefault();
       showUnsavedDialog();
     }
   });
   ```

4. **Show unsaved changes dialog**
   - Three options: Save, Discard, Cancel
   - Save: Trigger save then close
   - Discard: Close without saving
   - Cancel: Keep window open

**Verification:**
- [~] Closing window with unsaved changes shows dialog
- [~] Save button saves and closes
- [~] Discard button closes without saving
- [~] Cancel keeps window open
- [~] No dialog shown if no changes

**Estimated Time:** 3 hours

---

### Task 18: Add Error Handling

**Goal:** Handle file operation errors gracefully.

**Dependencies:** Task 4

**Files:**
- Modify: `src/minimal-file-service.ts`
- Create: `src/error-handler.ts`

**Steps:**

1. **Create error handling utility**
   ```typescript
   function handleFileError(error: NodeJS.ErrnoException, filePath: string) {
     if (error.code === 'ENOENT') {
       return showError(`File not found: ${filePath}`);
     }
     if (error.code === 'EACCES') {
       return showError(`Permission denied: ${filePath}`);
     }
     return showError(`Error: ${error.message}`);
   }
   ```

2. **Add try-catch to file operations**
   - Wrap all fs operations in try-catch
   - Show appropriate error dialogs
   - Log errors to console

3. **Handle theme loading errors**
   - Fall back to default theme
   - Show warning if theme fails to load
   - Continue with plain editor

4. **Handle grammar loading errors**
   - Fall back to plain text mode
   - Show warning
   - Continue editing without syntax highlighting

5. **Handle configuration errors**
   - Use default configuration
   - Show warning about corrupted config
   - Create new config file if needed

**Verification:**
- [~] Opening non-existent file shows error
- [~] Permission denied shows appropriate message
- [~] Corrupted theme falls back to default
- [~] Missing grammar falls back to plain text
- [~] App continues to work after errors

**Estimated Time:** 4 hours

---

### Task 19: Implement Window State Persistence

**Goal:** Save and restore window position and size.

**Dependencies:** Task 3

**Files:**
- Modify: `src/minimal-config.ts`
- Modify: `src/minimal-main.ts`

**Steps:**

1. **Save window bounds on close**
   ```typescript
   mainWindow.on('close', () => {
     const bounds = mainWindow.getBounds();
     const isMaximized = mainWindow.isMaximized();
     saveConfig({ windowBounds: bounds, isMaximized });
   });
   ```

2. **Restore window bounds on startup**
   ```typescript
   const config = loadConfig();
   const bounds = config.windowBounds || { x: 100, y: 100, width: 1200, height: 800 };
   mainWindow = new BrowserWindow(bounds);
   if (config.isMaximized) {
     mainWindow.maximize();
   }
   ```

3. **Handle edge cases**
   - Window off-screen (reset to center)
   - Invalid bounds (use defaults)
   - Multi-monitor setups

**Verification:**
- [~] Window position persists across restarts
- [~] Window size persists across restarts
- [~] Maximized state persists
- [~] Off-screen window resets to visible area

**Estimated Time:** 2 hours

---

## Phase 8: Packaging & Distribution (Days 14-15)

### Task 20: Create Electron Packaging Configuration

**Goal:** Configure electron-builder for Windows, macOS, and Linux.

**Dependencies:** All previous tasks

**Files:**
- Create: `electron-builder.json`
- Create: `resources/icon.icns` (macOS)
- Create: `resources/icon.ico` (Windows)
- Create: `resources/icon.png` (Linux)

**Steps:**

1. **Create electron-builder configuration**
   ```json
   {
     "appId": "com.minimal.editor",
     "productName": "Minimal Editor",
     "directories": {
       "output": "dist-minimal"
     },
     "files": [
       "out-minimal/**/*",
       "resources/**/*",
       "package.json"
     ],
     "mac": {
       "category": "public.app-category.developer-tools",
       "target": ["dmg", "zip"]
     },
     "win": {
       "target": ["nsis", "portable"]
     },
     "linux": {
       "target": ["AppImage", "deb", "rpm"],
       "category": "Development"
     }
   }
   ```

2. **Create application icons**
   - Design simple editor icon
   - Export in required formats
   - Place in resources directory

3. **Configure packaging scripts**
   - `npm run package:win` - Windows build
   - `npm run package:mac` - macOS build
   - `npm run package:linux` - Linux build
   - `npm run package:all` - All platforms

4. **Test packaging on each platform**
   - Build installer
   - Install application
   - Verify it runs
   - Check file size

**Verification:**
- [~] Windows installer builds successfully
- [~] macOS DMG builds successfully
- [~] Linux AppImage builds successfully
- [~] Installed app runs on each platform
- [~] Application size < 160MB (with Electron)
- [~] App bundle size ~30-40MB (without Electron runtime)

**Estimated Time:** 6 hours

---

### Task 21: Optimize Bundle Size

**Goal:** Reduce application bundle size to meet 20-40MB target (excluding Electron).

**Dependencies:** Task 20

**Files:**
- Modify: `build/minimal.config.js`
- Modify: `webpack.config.js` or `esbuild config`

**Steps:**

1. **Enable tree-shaking**
   - Configure webpack/esbuild for tree-shaking
   - Mark side-effect-free modules
   - Remove unused exports

2. **Minify JavaScript**
   - Enable minification in production
   - Use terser or esbuild minifier
   - Remove console.log statements

3. **Compress resources**
   - Minify JSON theme files
   - Compress grammar files
   - Remove unnecessary metadata

4. **Bundle only used grammars**
   - Skip grammars for unsupported languages
   - Lazy-load grammars on demand
   - Keep only essential 20+ languages

5. **Remove source maps in production**
   - Disable source map generation
   - Keep only for development builds

6. **Analyze bundle size**
   - Use webpack-bundle-analyzer or similar
   - Identify large dependencies
   - Remove or replace heavy modules

**Verification:**
- [~] Bundle size without Electron: 20-40MB
- [~] Full app size with Electron: 120-160MB
- [~] Startup time < 1 second
- [~] Memory usage < 100MB (empty file)
- [~] All features still work after optimization

**Estimated Time:** 6 hours

---

## Phase 9: Testing & Documentation (Days 16-17)

### Task 22: Write Unit Tests

**Goal:** Create unit tests for core functionality.

**Dependencies:** All implementation tasks

**Files:**
- Create: `test/unit/language-detection.test.ts`
- Create: `test/unit/theme-converter.test.ts`
- Create: `test/unit/config.test.ts`
- Create: `test/unit/file-service.test.ts`

**Steps:**

1. **Set up test framework**
   - Install Mocha and Chai
   - Configure TypeScript for tests
   - Add test script to package.json

2. **Write language detection tests**
   ```typescript
   describe('Language Detection', () => {
     it('should detect JavaScript', () => {
       expect(detectLanguage('app.js')).to.equal('javascript');
     });
     // Add tests for all 20+ languages
   });
   ```

3. **Write theme converter tests**
   - Test VS Code to Monaco conversion
   - Test color mapping
   - Test token rules conversion

4. **Write configuration tests**
   - Test config loading
   - Test config saving
   - Test default values
   - Test corrupted config handling

5. **Write file service tests**
   - Test file reading
   - Test file writing
   - Test error handling
   - Mock fs operations

**Verification:**
- [~] All unit tests pass
- [~] Test coverage > 70%
- [~] Tests run in < 5 seconds
- [~] Tests can run in CI/CD

**Estimated Time:** 6 hours

---

### Task 23: Perform Integration Testing

**Goal:** Test complete workflows end-to-end.

**Dependencies:** Task 22

**Files:**
- Create: `test/integration/file-operations.test.ts`
- Create: `test/integration/theme-switching.test.ts`
- Create: `test/integration/editor-features.test.ts`

**Steps:**

1. **Set up integration test environment**
   - Use Spectron or Playwright for Electron
   - Configure test fixtures
   - Set up test data files

2. **Test file operations workflow**
   - Launch app
   - Open file via menu
   - Modify content
   - Save file
   - Verify file updated on disk
   - Close app

3. **Test theme switching workflow**
   - Launch app
   - Open theme selector
   - Switch theme
   - Verify theme applied
   - Restart app
   - Verify theme persists

4. **Test editor features workflow**
   - Open file with syntax highlighting
   - Use find/replace
   - Toggle word wrap
   - Toggle line numbers
   - Verify all features work

5. **Test error scenarios**
   - Try to open non-existent file
   - Try to save to read-only location
   - Verify error messages shown

**Verification:**
- [~] All integration tests pass
- [~] Complete workflows function correctly
- [~] Tests cover happy path and error cases
- [~] Tests run reliably

**Estimated Time:** 6 hours

---

### Task 24: Create User Documentation

**Goal:** Write user-facing documentation and README.

**Dependencies:** Task 23

**Files:**
- Create: `README-MINIMAL.md`
- Create: `docs/user-guide.md`
- Create: `docs/keyboard-shortcuts.md`

**Steps:**

1. **Write README**
   - Project description
   - Features list
   - Installation instructions
   - Quick start guide
   - Build instructions
   - License information

2. **Write user guide**
   - How to open files
   - How to save files
   - How to use find/replace
   - How to switch themes
   - How to toggle preferences
   - Supported file types

3. **Document keyboard shortcuts**
   - List all keyboard shortcuts
   - Platform-specific differences (Ctrl vs Cmd)
   - Create quick reference table

4. **Write developer documentation**
   - Architecture overview
   - Build system
   - How to add new features
   - Testing guidelines

**Verification:**
- [~] README is clear and complete
- [~] User guide covers all features
- [~] Keyboard shortcuts are documented
- [~] Developer docs help contributors

**Estimated Time:** 4 hours

---

## Phase 10: Final Testing & Release (Days 18-20)

### Task 25: Cross-Platform Testing

**Goal:** Test application on Windows, macOS, and Linux.

**Dependencies:** Task 24

**Test Matrix:**
- Windows 10, Windows 11
- macOS Catalina, Big Sur, Monterey
- Ubuntu 20.04, Ubuntu 22.04, Fedora 36

**Steps:**

1. **Test on Windows**
   - Install from NSIS installer
   - Test all features
   - Verify keyboard shortcuts
   - Check native dialogs
   - Test with different file types
   - Measure startup time and memory

2. **Test on macOS**
   - Install from DMG
   - Test all features
   - Verify Cmd shortcuts
   - Check app menu
   - Test with different file types
   - Verify window controls

3. **Test on Linux**
   - Install from AppImage/deb/rpm
   - Test all features
   - Verify keyboard shortcuts
   - Check native dialogs
   - Test with different file types
   - Verify system integration

4. **Create test report**
   - Document any platform-specific issues
   - Create issue list
   - Prioritize bug fixes

**Verification:**
- [~] Application works on Windows 10/11
- [~] Application works on macOS 10.15+
- [~] Application works on Ubuntu 20.04+
- [~] All features work on all platforms
- [~] Performance meets targets on all platforms
- [~] No critical bugs

**Estimated Time:** 8 hours

---

### Task 26: Performance Testing & Optimization

**Goal:** Verify performance targets are met and optimize if needed.

**Dependencies:** Task 25

**Metrics to Test:**
- Startup time (target: < 1000ms)
- Memory usage empty file (target: < 100MB)
- Memory usage 10K lines (target: < 200MB)
- File open time 1MB (target: < 200ms)
- File save time (target: < 100ms)
- Theme switch time (target: < 100ms)

**Steps:**

1. **Measure startup performance**
   - Time from launch to editor interactive
   - Identify slow initialization steps
   - Profile with DevTools

2. **Measure memory usage**
   - Use Chrome DevTools memory profiler
   - Check for memory leaks
   - Identify large object allocations

3. **Measure file operation performance**
   - Test with various file sizes
   - Profile read/write operations
   - Check for bottlenecks

4. **Optimize if targets not met**
   - Lazy-load heavy modules
   - Defer non-critical initialization
   - Optimize theme/grammar loading
   - Reduce bundle size further

5. **Create performance report**
   - Document baseline metrics
   - Document optimizations applied
   - Final performance numbers

**Verification:**
- [~] Startup time < 1000ms
- [~] Memory usage (empty) < 100MB
- [~] Memory usage (10K lines) < 200MB
- [~] File operations meet targets
- [~] Performance report complete

**Estimated Time:** 6 hours

---

### Task 27: Create Release Build

**Goal:** Create final release builds for all platforms.

**Dependencies:** Task 26

**Files:**
- Create: `CHANGELOG.md`
- Create: `VERSION`
- Modify: `package.json` (set version)

**Steps:**

1. **Update version numbers**
   - Set version in package.json (e.g., 1.0.0)
   - Create VERSION file
   - Update any version references

2. **Create changelog**
   - List all features
   - Document known limitations
   - Credit contributors

3. **Build release packages**
   - Clean all output directories
   - Run full build for Windows
   - Run full build for macOS
   - Run full build for Linux

4. **Sign binaries (if applicable)**
   - Code sign macOS app
   - Sign Windows installer
   - Generate checksums for Linux

5. **Create release assets**
   - Zip/tar source code
   - Create release notes
   - Upload to release location

**Verification:**
- [~] All platform builds complete successfully
- [~] Version numbers are consistent
- [~] Checksums are generated
- [~] Release notes are complete
- [~] All assets are ready for distribution

**Estimated Time:** 4 hours

---

## Summary

### Total Tasks: 27
### Estimated Total Time: 15-20 days

### Task Dependencies Graph

```
Phase 1 (Setup):
  Task 1 → Task 2

Phase 2 (Main Process):
  Task 2 → Task 3 → Task 4 → Task 5

Phase 3 (Renderer):
  Task 5 → Task 6 → Task 7 → Task 8 → Task 9

Phase 4 (Themes):
  Task 2 → Task 10 → Task 11 → Task 12

Phase 5 (Syntax):
  Task 2 → Task 13 → Task 14

Phase 6 (Features):
  Task 7 → Task 15
  Task 11 → Task 16

Phase 7 (Polish):
  Task 9 → Task 17
  Task 4 → Task 18
  Task 3 → Task 19

Phase 8 (Package):
  All prev → Task 20 → Task 21

Phase 9 (Test):
  All impl → Task 22 → Task 23 → Task 24

Phase 10 (Release):
  Task 24 → Task 25 → Task 26 → Task 27
```

### Deliverables Checklist

**Build Artifacts:**
- [~] Windows installer (.exe)
- [~] Windows portable (.zip)
- [~] macOS DMG
- [~] macOS zip
- [~] Linux AppImage
- [~] Linux .deb package
- [~] Linux .rpm package

**Documentation:**
- [~] README-MINIMAL.md
- [~] User guide
- [~] Keyboard shortcuts reference
- [~] Developer documentation
- [~] CHANGELOG.md

**Testing:**
- [~] Unit test suite
- [~] Integration test suite
- [~] Performance test results
- [~] Cross-platform test report

**Size & Performance Targets:**
- [~] App bundle size: 20-40MB (without Electron)
- [~] Full install size: 120-160MB (with Electron)
- [~] Startup time: < 1000ms
- [~] Memory usage (empty): < 100MB
- [~] Memory usage (10K lines): < 200MB

### Risk Mitigation

**High-Risk Areas:**
1. **TextMate grammar integration** - Complex, may need debugging
   - Mitigation: Allocate extra time for Task 14
   - Fallback: Start with fewer languages, add more later

2. **Theme conversion** - VS Code themes may not map perfectly to Monaco
   - Mitigation: Test with multiple themes early
   - Fallback: Provide basic themes only

3. **Cross-platform issues** - Behavior may differ across OS
   - Mitigation: Test early and often on all platforms
   - Fallback: Document platform-specific limitations

4. **Performance targets** - May be hard to achieve
   - Mitigation: Profile early, optimize continuously
   - Fallback: Relax targets slightly if necessary

### Next Steps After Implementation

**Post-1.0 Enhancements (Optional):**
1. Multi-tab support
2. Recent files list
3. Auto-save
4. Custom font selection
5. Export to PDF
6. Print functionality
7. Drag-and-drop file opening
8. Command-line interface

**Maintenance:**
1. Update Electron regularly
2. Update Monaco editor
3. Add new TextMate grammars as needed
4. Bug fixes and improvements
5. Security updates

---

## Task Execution Guidelines

### Before Starting Each Task:
1. ✅ Verify dependencies are complete
2. ✅ Review design document section
3. ✅ Check requirements alignment
4. ✅ Prepare test data if needed

### During Task Execution:
1. 💻 Follow the step-by-step instructions
2. 🧪 Test incrementally as you build
3. 📝 Document any deviations from plan
4. 🐛 Log issues encountered

### After Completing Each Task:
1. ✅ Run verification checklist
2. ✅ Test thoroughly
3. ✅ Commit code with descriptive message
4. ✅ Update task status
5. ✅ Note actual time taken vs. estimate

### Commit Message Convention:
```
[Task N] Brief description

- Detailed change 1
- Detailed change 2

Verification:
- All checks pass
- Performance: X ms startup, Y MB memory
```

### Testing Standards:
- **Unit tests:** Test individual functions
- **Integration tests:** Test workflows end-to-end
- **Manual tests:** Verify UI and UX
- **Performance tests:** Measure against targets
- **Cross-platform tests:** Test on all target OS

### Code Quality Standards:
- TypeScript strict mode enabled
- No `any` types without justification
- ESLint rules followed
- Consistent formatting
- Comments for complex logic
- Error handling for all async operations

---

## Appendix: Additional Resources

### Reference Documentation:
- Monaco Editor API: https://microsoft.github.io/monaco-editor/api/
- Electron API: https://www.electronjs.org/docs/latest/api/app
- TextMate Grammar: https://macromates.com/manual/en/language_grammars
- electron-builder: https://www.electron.build/

### Useful VS Code Files to Reference:
- `src/vs/editor/standalone/browser/standaloneCodeEditor.ts` - Standalone editor
- `src/vs/platform/theme/common/themeService.ts` - Theme service
- `src/vs/editor/common/languages/` - Language definitions
- `extensions/theme-*/themes/*.json` - Theme examples

### Testing Tools:
- Mocha: Test framework
- Chai: Assertion library
- Spectron/Playwright: E2E testing for Electron
- Chrome DevTools: Performance profiling

### Build Tools:
- esbuild: Fast JavaScript bundler
- electron-builder: Electron packaging
- TypeScript: Compilation
- npm-run-all: Script runner

---

**End of Task List**
