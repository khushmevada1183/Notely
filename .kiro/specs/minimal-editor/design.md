# Technical Design Document: Minimal Editor

## 1. System Overview

### 1.1 High-Level Architecture

The Minimal Editor is a stripped-down version of VS Code that retains only the core text editing functionality powered by the Monaco editor. The transformation removes approximately 95% of VS Code features, reducing the codebase from ~300+ dependencies to ~20 core packages, and shrinking the application size from ~300MB to 20-40MB.

```
┌─────────────────────────────────────────────────────────────────┐
│                        Minimal Editor                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────────┐         ┌──────────────────────┐         │
│  │   Main Process   │◄───────►│  Renderer Process    │         │
│  │   (Electron)     │  IPC    │   (Browser Window)   │         │
│  └──────────────────┘         └──────────────────────┘         │
│         │                               │                        │
│         │                               │                        │
│    ┌────▼──────┐                   ┌───▼─────────────┐         │
│    │  Window   │                   │  Monaco Editor  │         │
│    │ Management│                   │    Standalone   │         │
│    │  Menu     │                   │                 │         │
│    │  Dialog   │                   ├─────────────────┤         │
│    └───────────┘                   │ Minimal UI Shell│         │
│                                     │  - Find/Replace │         │
│    ┌───────────┐                   │  - Theme        │         │
│    │  File     │                   │  - Status Info  │         │
│    │  System   │◄──────────────────┤                 │         │
│    │  Access   │                   └─────────────────┘         │
│    └───────────┘                                                │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 Component Flow

```
User Action ──► Native Menu ──► Main Process ──► IPC Message ──► Renderer
                                      │
                                      ▼
                              File System API
                                      │
                                      ▼
                            Local File Operations
                                      │
                                      ▼
                              Send to Renderer ──► Monaco Editor Updates
```


### 1.3 Data Flow Between Components

```
┌────────────┐     File Open Request      ┌──────────────┐
│   Native   │──────────────────────────►│ Main Process │
│   Dialog   │                            └──────┬───────┘
└────────────┘                                   │
                                                 │ Read File
                                                 ▼
                                          ┌─────────────┐
                                          │   Node.js   │
                                          │ File System │
                                          └──────┬──────┘
                                                 │
                                                 │ File Content
                                                 ▼
                                          ┌─────────────┐
     ┌────────────────────────────────────│    IPC      │
     │                                    └─────────────┘
     │ File Data
     ▼
┌──────────────┐                          ┌──────────────┐
│   Renderer   │                          │    Monaco    │
│   Process    │─────Model Update────────►│    Editor    │
└──────────────┘                          └──────────────┘
```

## 2. Component Architecture

### 2.1 Main Process (Electron)


**Purpose:** Manages application lifecycle, window creation, native menu integration, and file system access.

**Key Responsibilities:**
- Application bootstrap and initialization
- Window creation and management
- Native menu bar setup (File, Edit, View)
- File system operations (open, save, save as)
- Native dialog invocation (file picker, save dialog)
- IPC message routing to renderer

**Simplified Bootstrap (`src/minimal-main.ts`):**
```typescript
import { app, BrowserWindow, Menu, dialog } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// Simplified bootstrap - remove most startup complexity
app.on('ready', () => {
  createWindow();
  createMenus();
});

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  });

  mainWindow.loadFile('index.html');
}
```

**Dependencies:**
- Electron (app, BrowserWindow, Menu, dialog, ipcMain)
- Node.js fs module (file operations)
- Node.js path module (path manipulation)


### 2.2 Renderer Process

**Purpose:** Hosts Monaco editor and minimal UI, handles user interactions, manages editor state.

**Key Responsibilities:**
- Monaco editor initialization and configuration
- Document model management
- Find/Replace widget display
- Theme application
- IPC communication with main process
- Keyboard shortcut handling
- Unsaved changes tracking

**Entry Point (`src/minimal-renderer.ts`):**
```typescript
import * as monaco from 'monaco-editor';

// Initialize Monaco editor
const editor = monaco.editor.create(document.getElementById('container'), {
  value: '',
  language: 'plaintext',
  theme: 'vs-dark',
  automaticLayout: true
});

// Setup IPC listeners for file operations
window.electronAPI.onFileOpen((content, filePath) => {
  editor.setValue(content);
  // Update language based on file extension
});
```

**Dependencies:**
- Monaco editor standalone bundle
- Electron IPC renderer
- Theme definitions (from VS Code)
- TextMate grammar files (for syntax highlighting)


### 2.3 Platform Services (Minimal Set)

The platform services layer is drastically simplified, keeping only essential services:

#### 2.3.1 File Service (Local Only)

**Location:** `src/vs/platform/files/electron-main/fileService.ts` (simplified)

**Purpose:** Handle file system operations for local files only.

**Interface:**
```typescript
interface IMinimalFileService {
  readFile(path: string): Promise<Uint8Array>;
  writeFile(path: string, content: Uint8Array): Promise<void>;
  exists(path: string): Promise<boolean>;
  stat(path: string): Promise<{ mtime: number; size: number }>;
}
```

**Removed:**
- Remote file system providers
- Virtual file systems
- File watching (except for current file)
- Multi-root workspace support
- File system provider registration

#### 2.3.2 Theme Service

**Location:** `src/vs/platform/theme/electron-main/themeService.ts` (simplified)

**Purpose:** Load and apply color themes to Monaco editor.

**Interface:**
```typescript
interface IMinimalThemeService {
  getThemes(): IThemeDefinition[];
  setTheme(themeId: string): void;
  getCurrentTheme(): IThemeDefinition;
}
```

**Theme Loading:**
- Pre-bundle all VS Code themes
- Load from `extensions/theme-*/themes/*.json`
- Convert to Monaco theme format
- Apply via `monaco.editor.defineTheme()`


#### 2.3.3 Dialog Service

**Location:** `src/vs/platform/dialogs/electron-main/dialogService.ts` (simplified)

**Purpose:** Show native file picker and confirmation dialogs.

**Interface:**
```typescript
interface IMinimalDialogService {
  showOpenDialog(options: { filters?: FileFilter[] }): Promise<string | undefined>;
  showSaveDialog(options: { defaultPath?: string; filters?: FileFilter[] }): Promise<string | undefined>;
  showMessageBox(options: { message: string; buttons: string[] }): Promise<number>;
}
```

**Implementation:**
- Direct Electron dialog API calls
- No custom dialog rendering
- Platform-native appearance

#### 2.3.4 Keybinding Service (Minimal)

**Location:** `src/vs/platform/keybinding/electron-main/keybindingService.ts` (simplified)

**Purpose:** Handle keyboard shortcuts for basic operations.

**Default Keybindings:**
```typescript
const keybindings = {
  'Ctrl+N': 'newFile',
  'Ctrl+O': 'openFile',
  'Ctrl+S': 'saveFile',
  'Ctrl+Shift+S': 'saveFileAs',
  'Ctrl+F': 'find',
  'Ctrl+H': 'replace',
  'Ctrl+W': 'closeFile',
  'Ctrl+Z': 'undo',
  'Ctrl+Y': 'redo',
  // macOS: Cmd instead of Ctrl
};
```

**Removed:**
- Custom keybinding editor
- Keybinding persistence
- When clauses and contexts
- Command palette


#### 2.3.5 Configuration Service (Minimal)

**Location:** `src/vs/platform/configuration/electron-main/configurationService.ts` (simplified)

**Purpose:** Store minimal editor preferences.

**Stored Settings:**
```typescript
interface IMinimalConfiguration {
  theme: string;                    // Current theme ID
  wordWrap: 'on' | 'off';          // Word wrap setting
  lineNumbers: 'on' | 'off';       // Line numbers display
  fontSize: number;                 // Editor font size
  tabSize: number;                  // Tab size
  insertSpaces: boolean;            // Use spaces for tabs
  windowBounds: {                   // Window position/size
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
```

**Storage:**
- JSON file in user data directory: `~/.minimal-editor/config.json`
- Load on startup, save on change
- No workspace-specific settings

#### 2.3.6 Command Service (Minimal)

**Location:** `src/vs/platform/commands/electron-main/commandService.ts` (simplified)

**Purpose:** Execute basic file and editor commands.

**Supported Commands:**
```typescript
type CommandId =
  | 'newFile'
  | 'openFile'
  | 'saveFile'
  | 'saveFileAs'
  | 'closeWindow'
  | 'find'
  | 'replace'
  | 'toggleWordWrap'
  | 'toggleLineNumbers'
  | 'selectTheme';
```

**Removed:**
- Command palette UI
- Command history
- Command contributions
- Dynamic command registration


### 2.4 Editor Core

#### 2.4.1 Monaco Editor Integration

**Base:** Use `src/vs/editor/editor.main.ts` as starting point but strip out workbench dependencies.

**Integration Pattern:**
```typescript
// Import only standalone Monaco editor
import 'monaco-editor/esm/vs/editor/editor.all.js';
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api.js';

// Register TextMate grammars for syntax highlighting
import { wireTmGrammars } from 'monaco-editor-textmate';
import { Registry } from 'monaco-textmate';
import { loadWASM } from 'onigasm';
```

**Features Retained:**
- Text editing with Monaco CodeEditor
- Syntax highlighting via TextMate grammars
- Find/Replace widget (built into Monaco)
- Undo/Redo
- Selection, Cut, Copy, Paste
- Line numbers
- Word wrap
- Basic indentation

**Features Removed:**
- IntelliSense / Auto-completion
- Code actions and refactoring
- Diagnostics and problem markers
- Diff editor
- Peek definitions
- Symbol navigation
- Multi-cursor editing (optional: can keep if Monaco supports)
- Minimap
- Breadcrumbs
- Code folding


#### 2.4.2 Syntax Highlighting (TextMate)

**Source:** `src/vs/editor/common/languages/` and TextMate grammar files

**Grammar Loading:**
```typescript
// Load TextMate grammars from bundled JSON files
const registry = new Registry({
  async getGrammarDefinition(scopeName) {
    const grammarPath = `./grammars/${scopeName}.json`;
    const response = await fetch(grammarPath);
    return {
      format: 'json',
      content: await response.text()
    };
  }
});

// Wire grammars to Monaco
await wireTmGrammars(monaco, registry, languageIdToScopeNameMap);
```

**Supported Languages (from requirements):**
c, js, md, txt, json, html, css, py, java, cpp, rs, go, ts, jsx, tsx, xml, yaml, sql, sh, bat, php, rb, swift, kt

**Grammar Files Location:**
- Keep: `extensions/*/syntaxes/*.tmLanguage.json`
- Bundle these into the application
- Load dynamically based on file extension

#### 2.4.3 Find/Replace Widget

**Source:** `src/vs/editor/contrib/find/browser/findWidget.ts`

**Integration:**
- Use Monaco's built-in find controller
- Trigger via Ctrl+F / Cmd+F
- No custom UI overlay needed

**Features:**
- Text search within current document
- Case-sensitive toggle
- Whole word toggle
- Regular expression support
- Replace and Replace All
- Navigate between matches


#### 2.4.4 Theme Application

**Source:** `src/vs/editor/standalone/browser/standaloneThemeService.ts`

**Theme Definition Format:**
```typescript
interface IThemeDefinition {
  id: string;
  label: string;
  uiTheme: 'vs' | 'vs-dark' | 'hc-black' | 'hc-light';
  colors: { [colorId: string]: string };
  tokenColors: ITokenColor[];
}
```

**Theme Application:**
```typescript
monaco.editor.defineTheme('my-theme', {
  base: 'vs-dark',
  inherit: true,
  rules: themeDefinition.tokenColors,
  colors: themeDefinition.colors
});

monaco.editor.setTheme('my-theme');
```

**Pre-installed Themes:**
- Light (Default Light+)
- Dark (Default Dark+)
- High Contrast
- All built-in VS Code themes from `extensions/theme-*`

## 3. Data Models

### 3.1 File Metadata

```typescript
interface IFileMetadata {
  path: string;              // Absolute file path
  name: string;              // File name with extension
  language: string;          // Language ID (js, ts, py, etc.)
  encoding: string;          // File encoding (utf-8, etc.)
  mtime: number;             // Last modified time
  size: number;              // File size in bytes
  isDirty: boolean;          // Has unsaved changes
  eol: '\n' | '\r\n';       // End of line sequence
}
```


### 3.2 Theme Configuration

```typescript
interface IThemeConfiguration {
  currentTheme: string;      // Active theme ID
  availableThemes: IThemeDefinition[];
  customizations?: {
    fontSize?: number;
    fontFamily?: string;
  };
}
```

### 3.3 Editor State

```typescript
interface IEditorState {
  currentFile: IFileMetadata | null;
  editorValue: string;       // Current document content
  cursorPosition: {          // Cursor location
    line: number;
    column: number;
  };
  selection: {               // Current selection
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
  } | null;
  viewState: {               // Scroll position, folding, etc.
    scrollTop: number;
    scrollLeft: number;
  };
  isDirty: boolean;          // Has unsaved changes
}
```

### 3.4 Window State

```typescript
interface IWindowState {
  bounds: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  isMaximized: boolean;
  recentFiles: string[];     // Recently opened files (max 10)
}
```


## 4. Entry Points

### 4.1 Main Process Entry Point

**File:** `src/minimal-main.ts`

**Purpose:** Electron main process bootstrap, replaces `src/main.ts`

**Responsibilities:**
1. Initialize Electron app
2. Create application window
3. Setup native menus
4. Register IPC handlers
5. Handle file system operations
6. Manage window state persistence

**Startup Sequence:**
```
1. app.on('ready')
2. Load window state from config
3. Create BrowserWindow
4. Register IPC handlers (file-open, file-save, etc.)
5. Setup native menu
6. Load renderer (index.html)
7. Restore window position/size
```

**Key Differences from `src/main.ts`:**
- No NLS (localization) loading
- No extension activation
- No remote/server support
- No crash reporter
- Simplified command line argument parsing
- Direct Electron API usage (no abstraction layers)


### 4.2 Renderer Entry Point

**File:** `src/minimal-renderer.ts`

**Purpose:** Browser window entry, replaces `src/vs/workbench/electron-browser/desktop.main.ts`

**Responsibilities:**
1. Initialize Monaco editor
2. Setup IPC communication
3. Register TextMate grammars
4. Apply theme
5. Handle file content updates
6. Track document changes (dirty state)

**Startup Sequence:**
```
1. DOM Content Loaded
2. Initialize Monaco editor in #container element
3. Load theme from config
4. Register TextMate grammars for syntax highlighting
5. Setup IPC listeners (onFileOpen, onFileContent, etc.)
6. Setup editor event listeners (onChange, onCursorMove)
7. Apply initial configuration (wordWrap, lineNumbers, etc.)
8. Signal ready to main process
```

**HTML Shell (`index.html`):**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Minimal Editor</title>
  <style>
    body { margin: 0; padding: 0; overflow: hidden; }
    #container { width: 100vw; height: 100vh; }
  </style>
</head>
<body>
  <div id="container"></div>
  <script src="minimal-renderer.js"></script>
</body>
</html>
```


### 4.3 Editor Initialization

**Monaco Standalone Setup:**
```typescript
// Configure Monaco environment
self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    if (label === 'json') {
      return './json.worker.js';
    }
    if (label === 'css' || label === 'scss' || label === 'less') {
      return './css.worker.js';
    }
    if (label === 'html' || label === 'handlebars' || label === 'razor') {
      return './html.worker.js';
    }
    if (label === 'typescript' || label === 'javascript') {
      return './ts.worker.js';
    }
    return './editor.worker.js';
  }
};

// Create editor instance
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

## 5. Removal Strategy

### 5.1 Directories to Remove

**Complete Removal (100%):**
```
src/vs/workbench/contrib/            # All feature contributions
  ├── debug/                          # Debugger
  ├── extensions/                     # Extension management
  ├── terminal/                       # Integrated terminal
  ├── scm/                           # Source control
  ├── search/                        # Multi-file search
  ├── tasks/                         # Task runner
  ├── testing/                       # Test explorer
  ├── notebook/                      # Notebooks
  ├── webview/                       # Webview panel
  └── ... (90+ other features)
```


```
src/vs/workbench/services/            # Most workbench services
  ├── extensions/                     # Extension host
  ├── remote/                        # Remote development
  ├── userDataSync/                  # Settings sync
  ├── userDataProfile/               # Profiles
  ├── languageDetection/             # Language detection
  ├── aiRelatedInformation/          # AI features
  ├── chat/                          # Chat/Copilot
  └── ... (50+ services)

src/vs/workbench/browser/             # Workbench UI framework
  ├── parts/                         # Activity bar, panel, sidebar
  └── layout.ts                      # Complex layout system

src/vs/code/browser/                  # Browser-based VS Code
src/vs/code/electron-sandbox/         # Sandbox utilities
src/vs/server/                        # Server implementation

extensions/                           # Remove most extensions
  ├── git/                           # Git integration
  ├── typescript-language-features/  # TypeScript/JavaScript
  ├── markdown-language-features/    # Markdown
  ├── emmet/                         # Emmet
  └── ... (keep only theme-* folders)
```

**Partial Removal:**
```
src/vs/platform/                      # Keep minimal services only
  ├── files/                         # Keep: Simplify to local only
  ├── theme/                         # Keep: Simplify theme loading
  ├── keybinding/                    # Keep: Basic keybindings
  ├── configuration/                 # Keep: Minimal config
  ├── dialogs/                       # Keep: Native dialogs
  ├── commands/                      # Keep: Basic commands
  ├── ipc/                           # Keep: IPC communication
  └── [REMOVE 40+ other services]

src/vs/base/                          # Keep utilities, remove complex parts
  ├── common/                        # Keep: Core utilities
  ├── browser/                       # Keep: DOM utilities
  ├── node/                          # Keep: Node utilities
  └── parts/                         # Remove: Complex UI components
```


### 5.2 Services to Strip Out

**Remove Entirely:**
- Extension host and extension API (`src/vs/workbench/api/`)
- Language server protocol client (`src/vs/workbench/services/languageServer/`)
- Debug adapter protocol (`src/vs/workbench/contrib/debug/`)
- Task system (`src/vs/workbench/contrib/tasks/`)
- Terminal service (`src/vs/workbench/contrib/terminal/`)
- Search service (multi-file) (`src/vs/workbench/services/search/`)
- SCM service (`src/vs/workbench/contrib/scm/`)
- Remote development (`src/vs/workbench/services/remote/`)
- User data sync (`src/vs/workbench/services/userDataSync/`)
- Telemetry (`src/vs/platform/telemetry/`)
- Update service (`src/vs/platform/update/`)
- Crash reporter (`src/vs/platform/crashReporter/`)
- Lifecycle service (complex) (`src/vs/workbench/services/lifecycle/`)
- Authentication providers (`src/vs/workbench/services/authentication/`)
- Webview service (`src/vs/workbench/contrib/webview/`)
- Notebook service (`src/vs/workbench/contrib/notebook/`)
- AI/Copilot services (`src/vs/workbench/contrib/chat/`)

**Simplify to Minimal:**
- File service → Local file system only
- Configuration service → Single JSON file
- Theme service → Pre-bundled themes only
- Keybinding service → Hardcoded shortcuts
- Command service → Fixed command set
- Dialog service → Native dialogs only
- Instantiation service → Remove DI, use direct instantiation
- Context key service → Remove entirely


### 5.3 Build Targets to Eliminate

**Remove from `build/gulpfile.vscode.ts`:**

```typescript
// Remove these build targets:
- vscode-reh (Remote Extension Host)
- vscode-reh-web (Remote Extension Host Web)
- vscode-web (Browser-based VS Code)
- Extension building tasks
- Translation/localization tasks
- Webview packaging
- Node module rebuilding (reduce to minimal set)

// Keep only:
- Core TypeScript compilation
- Monaco editor bundling
- Electron packaging for desktop
- Theme bundling
- Grammar file bundling
```

**Simplified Build Pipeline:**
```
1. Compile TypeScript → JavaScript (minimal set)
2. Bundle Monaco editor standalone
3. Copy theme JSON files
4. Copy TextMate grammar files
5. Package with Electron
6. Create native installers (Windows, macOS, Linux)
```

**Build Time Reduction:**
- Current VS Code build: 5-10 minutes
- Minimal Editor build: 30-60 seconds


## 6. Build & Packaging

### 6.1 Simplified Build Pipeline

**Build Configuration (`build/minimal.config.js`):**
```javascript
module.exports = {
  entryPoints: {
    main: 'src/minimal-main.ts',
    renderer: 'src/minimal-renderer.ts',
    preload: 'src/minimal-preload.ts'
  },
  output: {
    dir: 'out-minimal',
    format: 'cjs'  // CommonJS for Electron
  },
  external: [
    'electron',
    'fs',
    'path',
    'crypto',
    'os'
  ],
  bundle: {
    monaco: true,  // Bundle Monaco editor
    themes: true,  // Include theme definitions
    grammars: true // Include TextMate grammars
  }
};
```

**Build Steps:**
```bash
# 1. Clean output
npm run clean

# 2. Compile TypeScript (minimal set)
npm run compile-minimal

# 3. Bundle Monaco editor
npm run bundle-monaco

# 4. Copy resources (themes, grammars)
npm run copy-resources

# 5. Package with Electron
npm run package-minimal

# 6. Create installers
npm run create-installer
```


### 6.2 Dependency Tree Reduction

**Current VS Code Dependencies (~300+):**
```json
{
  "dependencies": {
    // Extension system
    "@vscode/vsce", "@vscode/extension-telemetry",
    // Language servers
    "vscode-languageclient", "vscode-languageserver",
    // Remote development
    "@vscode/proxy-agent", "@vscode/spdlog",
    // Git integration
    "dugite", "git-diff",
    // Terminal
    "node-pty", "xterm",
    // ... 280+ more packages
  }
}
```

**Minimal Editor Dependencies (~20):**
```json
{
  "dependencies": {
    "electron": "^28.0.0",           // Desktop framework
    "monaco-editor": "^0.45.0",      // Editor core
    "onigasm": "^2.2.5",             // TextMate regex engine (WASM)
    "monaco-textmate": "^3.0.1",     // TextMate grammar support
    "vscode-textmate": "^9.0.0"      // TextMate grammar parsing
  },
  "devDependencies": {
    "typescript": "^5.3.0",          // TypeScript compiler
    "electron-builder": "^24.0.0",   // Packaging
    "esbuild": "^0.19.0",            // Bundler
    "rimraf": "^5.0.0",              // Clean utility
    "npm-run-all": "^4.1.5"          // Script runner
  }
}
```

**Size Comparison:**
- VS Code node_modules: ~2GB
- Minimal Editor node_modules: ~150MB


### 6.3 Output Size Target

**Component Breakdown:**

| Component | Size |
|-----------|------|
| Electron runtime | 80-120 MB |
| Monaco editor bundle | 8-12 MB |
| TextMate grammars | 5-8 MB |
| Theme definitions | 2-3 MB |
| Application code | 3-5 MB |
| Node modules | 5-8 MB |
| **Total** | **103-156 MB** |

**Optimization Target: 20-40MB** (excluding Electron runtime)

**Size Reduction Strategies:**
1. Tree-shake unused Monaco features
2. Compress theme JSON files
3. Bundle only essential grammars
4. Minify JavaScript
5. Remove source maps from production
6. Use brotli compression for resources

**Comparison:**
- VS Code installed: ~300-400 MB
- Minimal Editor installed: ~120-160 MB (including Electron)
- Minimal Editor app only: ~20-40 MB

### 6.4 Electron Packaging Configuration

**electron-builder.json:**
```json
{
  "appId": "com.minimal.editor",
  "productName": "Minimal Editor",
  "directories": {
    "output": "dist"
  },
  "files": [
    "out-minimal/**/*",
    "package.json"
  ],
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
    "target": ["AppImage", "deb", "rpm"],
    "category": "Development"
  }
}
```


## 7. File Operations Flow

### 7.1 Open File Sequence

```
┌─────────┐
│  User   │
│ Action  │
└────┬────┘
     │ 1. Click "File > Open" or Ctrl+O
     ▼
┌─────────────┐
│ Native Menu │
└──────┬──────┘
       │ 2. Trigger 'openFile' command
       ▼
┌──────────────┐
│ Main Process │
│   Handler    │
└──────┬───────┘
       │ 3. Show native file picker (dialog.showOpenDialog)
       ▼
┌──────────────┐
│ User Selects │
│     File     │
└──────┬───────┘
       │ 4. Return file path
       ▼
┌──────────────┐
│  Read File   │
│  (fs.readFile)│
└──────┬───────┘
       │ 5. File content as Buffer
       ▼
┌──────────────┐
│ Detect EOL & │
│   Encoding   │
└──────┬───────┘
       │ 6. Convert to string
       ▼
┌──────────────┐
│  Send via    │
│     IPC      │
└──────┬───────┘
       │ 7. ipcRenderer.send('file:content', data)
       ▼
┌──────────────┐
│  Renderer    │
│   Process    │
└──────┬───────┘
       │ 8. Update Monaco model
       ▼
┌──────────────┐
│ Detect Lang  │
│ from ext     │
└──────┬───────┘
       │ 9. Set language mode
       ▼
┌──────────────┐
│   Monaco     │
│   Editor     │
└──────────────┘
   10. Display file with syntax highlighting
```


**Implementation (Main Process):**
```typescript
ipcMain.handle('file:open', async () => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
      { name: 'All Files', extensions: ['*'] },
      { name: 'Text Files', extensions: ['txt', 'md'] },
      { name: 'Code Files', extensions: ['js', 'ts', 'py', 'java'] }
    ]
  });

  if (result.canceled || !result.filePaths[0]) {
    return null;
  }

  const filePath = result.filePaths[0];
  const content = await fs.promises.readFile(filePath, 'utf8');
  const stat = await fs.promises.stat(filePath);

  return {
    path: filePath,
    name: path.basename(filePath),
    content: content,
    mtime: stat.mtime.getTime(),
    size: stat.size,
    encoding: 'utf-8',
    eol: detectEOL(content)
  };
});
```

**Implementation (Renderer):**
```typescript
async function openFile() {
  const fileData = await window.electronAPI.openFile();
  if (!fileData) return;

  // Update editor content
  editor.setValue(fileData.content);

  // Set language based on file extension
  const language = detectLanguage(fileData.name);
  monaco.editor.setModelLanguage(editor.getModel(), language);

  // Update state
  currentFile = fileData;
  isDirty = false;
  updateTitle();
}
```


### 7.2 Save File Sequence

```
┌─────────┐
│  User   │
│ Action  │
└────┬────┘
     │ 1. Click "File > Save" or Ctrl+S
     ▼
┌─────────────┐
│  Renderer   │
│   Process   │
└──────┬──────┘
       │ 2. Get current editor content
       ▼
┌──────────────┐
│ Check if new │
│ file or saved│
└──────┬───────┘
       │ 3. If no path, show Save As dialog
       │    If has path, save directly
       ▼
┌──────────────┐
│  Send via    │
│     IPC      │
└──────┬───────┘
       │ 4. ipc.invoke('file:save', { path, content })
       ▼
┌──────────────┐
│ Main Process │
│   Handler    │
└──────┬───────┘
       │ 5. Write file (fs.writeFile)
       ▼
┌──────────────┐
│ Atomic Write │
│ (temp + rename)│
└──────┬───────┘
       │ 6. Success response
       ▼
┌──────────────┐
│  Renderer    │
│   Process    │
└──────┬───────┘
       │ 7. Update file metadata
       ▼
┌──────────────┐
│ Set isDirty  │
│ = false      │
└──────────────┘
   8. Update title (remove *)
```


**Implementation (Main Process):**
```typescript
ipcMain.handle('file:save', async (event, { path: filePath, content }) => {
  // Atomic write: write to temp file then rename
  const tempPath = filePath + '.tmp';
  await fs.promises.writeFile(tempPath, content, 'utf8');
  await fs.promises.rename(tempPath, filePath);

  const stat = await fs.promises.stat(filePath);
  return {
    success: true,
    mtime: stat.mtime.getTime(),
    size: stat.size
  };
});

ipcMain.handle('file:saveAs', async (event, { content }) => {
  const result = await dialog.showSaveDialog({
    filters: [
      { name: 'All Files', extensions: ['*'] }
    ]
  });

  if (result.canceled || !result.filePath) {
    return null;
  }

  await fs.promises.writeFile(result.filePath, content, 'utf8');
  const stat = await fs.promises.stat(result.filePath);

  return {
    path: result.filePath,
    name: path.basename(result.filePath),
    mtime: stat.mtime.getTime(),
    size: stat.size
  };
});
```



### 7.3 File Type Detection

**Language Detection Flow:**
```typescript
function detectLanguage(filename: string): string {
  const extensionToLanguage: Record<string, string> = {
    'js': 'javascript',
    'ts': 'typescript',
    'jsx': 'javascriptreact',
    'tsx': 'typescriptreact',
    'py': 'python',
    'java': 'java',
    'cpp': 'cpp',
    'c': 'c',
    'rs': 'rust',
    'go': 'go',
    'html': 'html',
    'css': 'css',
    'json': 'json',
    'md': 'markdown',
    'xml': 'xml',
    'yaml': 'yaml',
    'yml': 'yaml',
    'sql': 'sql',
    'sh': 'shell',
    'bat': 'bat',
    'php': 'php',
    'rb': 'ruby',
    'swift': 'swift',
    'kt': 'kotlin',
    'txt': 'plaintext'
  };

  const ext = filename.split('.').pop()?.toLowerCase();
  return extensionToLanguage[ext || ''] || 'plaintext';
}
```

## 8. Theme System

### 8.1 Theme Loading Mechanism

**Theme Discovery:**
```typescript
// On startup, scan for theme files
async function loadThemes(): Promise<IThemeDefinition[]> {
  const themes: IThemeDefinition[] = [];
  const themeExtensions = await fs.promises.readdir('extensions');

  for (const ext of themeExtensions) {
    if (!ext.startsWith('theme-')) continue;

    const themesDir = path.join('extensions', ext, 'themes');
    if (!fs.existsSync(themesDir)) continue;

    const themeFiles = await fs.promises.readdir(themesDir);
    for (const file of themeFiles) {
      if (!file.endsWith('.json')) continue;

      const themePath = path.join(themesDir, file);
      const themeContent = await fs.promises.readFile(themePath, 'utf8');
      const theme = JSON.parse(themeContent);

      themes.push({
        id: `${ext}-${path.basename(file, '.json')}`,
        label: theme.name || file,
        uiTheme: theme.type || 'vs-dark',
        colors: theme.colors || {},
        tokenColors: theme.tokenColors || []
      });
    }
  }

  return themes;
}
```

### 8.2 Theme Switching

**Switch Theme Flow:**
```
User selects theme ──► Theme Service ──► Convert to Monaco format ──► Apply theme ──► Update config
```

**Implementation:**
```typescript
function applyTheme(themeId: string) {
  const theme = availableThemes.find(t => t.id === themeId);
  if (!theme) return;

  // Convert VS Code theme to Monaco theme
  const monacoTheme = {
    base: theme.uiTheme,
    inherit: true,
    rules: theme.tokenColors.map(tc => ({
      token: tc.scope,
      foreground: tc.settings.foreground,
      background: tc.settings.background,
      fontStyle: tc.settings.fontStyle
    })),
    colors: theme.colors
  };

  // Register and apply theme
  monaco.editor.defineTheme(themeId, monacoTheme);
  monaco.editor.setTheme(themeId);

  // Persist selection
  saveConfig({ theme: themeId });
}
```

### 8.3 Pre-installed Themes List

**Built-in Themes (from VS Code):**
- Visual Studio Light (vs)
- Visual Studio Dark (vs-dark)
- High Contrast Black (hc-black)
- High Contrast Light (hc-light)
- Dark+ (Default Dark+)
- Light+ (Default Light+)
- Monokai
- Monokai Dimmed
- Solarized Dark
- Solarized Light
- Quiet Light
- Red
- Abyss
- Kimbie Dark
- Tomorrow Night Blue

**Theme Package Structure:**
```
extensions/
  ├── theme-defaults/
  │   └── themes/
  │       ├── dark_plus.json
  │       └── light_plus.json
  ├── theme-monokai/
  │   └── themes/
  │       └── monokai-color-theme.json
  └── theme-solarized/
      └── themes/
          ├── solarized-dark-color-theme.json
          └── solarized-light-color-theme.json
```

## 9. Performance Optimizations

### 9.1 Startup Sequence Optimization

**Optimization Strategies:**

| Optimization | Technique | Impact |
|--------------|-----------|--------|
| Lazy loading | Load Monaco workers on-demand | -200ms |
| Code splitting | Separate main/renderer bundles | -150ms |
| Theme caching | Cache compiled themes | -100ms |
| Remove DI | Direct instantiation vs dependency injection | -300ms |
| Minimal services | Remove 90% of platform services | -400ms |
| No extension host | Remove extension process | -500ms |
| Simplified bootstrap | Direct Electron API usage | -200ms |
| **Total Reduction** | | **~1.8 seconds** |

**Optimized Startup Sequence:**
```
0ms    App ready event
+50ms  Load config (window bounds, theme)
+100ms Create window
+150ms Load HTML shell
+200ms Initialize Monaco editor
+350ms Load active theme
+400ms Register TextMate grammars (lazy)
+500ms Editor ready
```

**Target: <1000ms from launch to interactive editor**

### 9.2 Memory Footprint Reduction

**Memory Usage Breakdown:**

| Component | VS Code | Minimal Editor |
|-----------|---------|----------------|
| Electron runtime | 70 MB | 70 MB |
| Monaco editor | 30 MB | 30 MB |
| Extension host | 80 MB | 0 MB (removed) |
| Language servers | 100 MB | 0 MB (removed) |
| Terminal | 40 MB | 0 MB (removed) |
| Workbench services | 150 MB | 10 MB (minimal) |
| **Total** | **470 MB** | **110 MB** |

**Memory Optimization Techniques:**
1. Remove unused Monaco features (diff editor, minimap)
2. Lazy-load TextMate grammars
3. Single-file model (no multi-file workspace)
4. Minimal theme cache (one active theme)
5. No search index
6. No file watchers (except current file)

### 9.3 Bundle Size Reduction

**Webpack/ESBuild Configuration:**
```javascript
module.exports = {
  mode: 'production',
  optimization: {
    minimize: true,
    usedExports: true,  // Tree shaking
    sideEffects: false,
    moduleIds: 'deterministic'
  },
  resolve: {
    alias: {
      // Replace heavy modules with stubs
      'vscode': false,
      'vscode-languageclient': false
    }
  },
  externals: {
    'electron': 'commonjs2 electron',
    'fs': 'commonjs2 fs',
    'path': 'commonjs2 path'
  }
};
```

**Size Reduction Checklist:**
- ✅ Tree-shake unused Monaco features
- ✅ Remove source maps in production
- ✅ Minify JavaScript
- ✅ Compress JSON theme files
- ✅ Bundle only used grammars
- ✅ Remove test files
- ✅ Remove localization files (English only)
- ✅ Remove markdown/documentation files

## 10. Cross-Platform Considerations

### 10.1 Platform-Specific Code Paths

**Conditional Logic:**
```typescript
const isMac = process.platform === 'darwin';
const isWindows = process.platform === 'win32';
const isLinux = process.platform === 'linux';

// Platform-specific menu accelerators
const commandKey = isMac ? 'Cmd' : 'Ctrl';

// Platform-specific paths
const configDir = isMac
  ? path.join(os.homedir(), 'Library', 'Application Support', 'MinimalEditor')
  : isWindows
    ? path.join(os.homedir(), 'AppData', 'Roaming', 'MinimalEditor')
    : path.join(os.homedir(), '.config', 'minimal-editor');
```

### 10.2 Native Integrations

**Menu Bar:**
- **macOS**: Application menu with standard items (About, Preferences, Quit)
- **Windows/Linux**: Window menu bar (File, Edit, View)

**File Dialogs:**
```typescript
// Use native dialogs on all platforms
dialog.showOpenDialog({
  properties: ['openFile'],
  // macOS: Shows native sheet
  // Windows: Shows native file picker
  // Linux: Shows GTK/KDE native dialog
});
```

**Window Controls:**
- **macOS**: Traffic lights (top-left)
- **Windows**: Minimize/Maximize/Close buttons (top-right)
- **Linux**: Desktop environment default

### 10.3 Keyboard Shortcuts

**Platform-Specific Keybindings:**

| Action | macOS | Windows/Linux |
|--------|-------|---------------|
| New File | Cmd+N | Ctrl+N |
| Open File | Cmd+O | Ctrl+O |
| Save | Cmd+S | Ctrl+S |
| Save As | Cmd+Shift+S | Ctrl+Shift+S |
| Find | Cmd+F | Ctrl+F |
| Replace | Cmd+Alt+F | Ctrl+H |
| Undo | Cmd+Z | Ctrl+Z |
| Redo | Cmd+Shift+Z | Ctrl+Y |
| Close Window | Cmd+W | Ctrl+W |
| Quit | Cmd+Q | Alt+F4 |

**Menu Template:**
```typescript
function createMenu() {
  const template = [
    ...(isMac ? [{
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'quit' }
      ]
    }] : []),
    {
      label: 'File',
      submenu: [
        { label: 'New File', accelerator: `${commandKey}+N`, click: () => newFile() },
        { label: 'Open File', accelerator: `${commandKey}+O`, click: () => openFile() },
        { type: 'separator' },
        { label: 'Save', accelerator: `${commandKey}+S`, click: () => saveFile() },
        { label: 'Save As', accelerator: `${commandKey}+Shift+S`, click: () => saveFileAs() },
        { type: 'separator' },
        { label: 'Close Window', accelerator: `${commandKey}+W`, role: 'close' },
        ...(!isMac ? [{ label: 'Exit', role: 'quit' }] : [])
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { label: 'Undo', accelerator: `${commandKey}+Z`, click: () => sendToRenderer('undo') },
        { label: 'Redo', accelerator: isMac ? 'Cmd+Shift+Z' : 'Ctrl+Y', click: () => sendToRenderer('redo') },
        { type: 'separator' },
        { label: 'Cut', accelerator: `${commandKey}+X`, role: 'cut' },
        { label: 'Copy', accelerator: `${commandKey}+C`, role: 'copy' },
        { label: 'Paste', accelerator: `${commandKey}+V`, role: 'paste' },
        { label: 'Select All', accelerator: `${commandKey}+A`, click: () => sendToRenderer('selectAll') },
        { type: 'separator' },
        { label: 'Find', accelerator: `${commandKey}+F`, click: () => sendToRenderer('find') },
        { label: 'Replace', accelerator: isMac ? 'Cmd+Alt+F' : 'Ctrl+H', click: () => sendToRenderer('replace') }
      ]
    },
    {
      label: 'View',
      submenu: [
        { label: 'Toggle Word Wrap', click: () => sendToRenderer('toggleWordWrap') },
        { label: 'Toggle Line Numbers', click: () => sendToRenderer('toggleLineNumbers') },
        { type: 'separator' },
        { label: 'Select Theme', click: () => sendToRenderer('selectTheme') }
      ]
    }
  ];

  return Menu.buildFromTemplate(template);
}
```

## 11. Error Handling

### 11.1 File Operation Errors

**Error Scenarios:**

| Error Type | Cause | Handling Strategy |
|------------|-------|-------------------|
| ENOENT | File not found | Show error dialog, offer to create new file |
| EACCES | Permission denied | Show error dialog, suggest checking permissions |
| ENOSPC | Disk full | Show error dialog, suggest freeing space |
| EISDIR | Path is directory | Show error dialog, ask user to select a file |
| Encoding errors | Invalid UTF-8 | Attempt fallback encoding, warn user |

**Implementation:**
```typescript
async function handleFileOpen(filePath: string) {
  try {
    const content = await fs.promises.readFile(filePath, 'utf8');
    return { success: true, content };
  } catch (error) {
    if (error.code === 'ENOENT') {
      await dialog.showMessageBox({
        type: 'error',
        title: 'File Not Found',
        message: `Could not find file: ${filePath}`,
        buttons: ['OK']
      });
    } else if (error.code === 'EACCES') {
      await dialog.showMessageBox({
        type: 'error',
        title: 'Permission Denied',
        message: `You do not have permission to open this file: ${filePath}`,
        buttons: ['OK']
      });
    } else {
      await dialog.showMessageBox({
        type: 'error',
        title: 'Error Opening File',
        message: `An error occurred: ${error.message}`,
        buttons: ['OK']
      });
    }
    return { success: false, error: error.message };
  }
}
```

### 11.2 Editor State Errors

**Error Handling:**
- Model creation failure → Show empty editor with error message
- Theme loading failure → Fall back to default theme
- Grammar loading failure → Fall back to plain text
- Configuration file corruption → Use default configuration

```typescript
function safeLoadConfig(): IMinimalConfiguration {
  try {
    const configPath = path.join(getConfigDir(), 'config.json');
    const content = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.warn('Failed to load config, using defaults:', error);
    return getDefaultConfig();
  }
}
```

### 11.3 Unsaved Changes Protection

**Before Close Flow:**
```
User closes window ──► Check isDirty ──► If dirty, show dialog ──► Save/Discard/Cancel
```

**Implementation:**
```typescript
mainWindow.on('close', (event) => {
  if (editorState.isDirty) {
    event.preventDefault();

    dialog.showMessageBox(mainWindow, {
      type: 'question',
      buttons: ['Save', 'Discard', 'Cancel'],
      defaultId: 0,
      title: 'Unsaved Changes',
      message: 'Do you want to save the changes you made?',
      detail: 'Your changes will be lost if you don't save them.'
    }).then(result => {
      if (result.response === 0) {
        // Save
        saveFile().then(() => mainWindow.destroy());
      } else if (result.response === 1) {
        // Discard
        mainWindow.destroy();
      }
      // Cancel: do nothing
    });
  }
});
```

## 12. Testing Strategy

### 12.1 Unit Tests

**Test Framework:** Mocha + Chai

**Test Coverage Areas:**
1. File operations (read, write, detect language)
2. Theme loading and conversion
3. Configuration management
4. Language detection
5. EOL detection

**Example Test:**
```typescript
describe('Language Detection', () => {
  it('should detect JavaScript from .js extension', () => {
    expect(detectLanguage('app.js')).to.equal('javascript');
  });

  it('should detect TypeScript from .ts extension', () => {
    expect(detectLanguage('app.ts')).to.equal('typescript');
  });

  it('should default to plaintext for unknown extensions', () => {
    expect(detectLanguage('unknown.xyz')).to.equal('plaintext');
  });
});
```

### 12.2 Integration Tests

**Test Scenarios:**
1. **Application Startup**
   - Verify window opens within 1 second
   - Verify editor is interactive
   - Verify theme is applied

2. **File Operations**
   - Open a file and verify content is displayed
   - Modify content and save, verify file is updated
   - Open new file, save as, verify new file is created

3. **Theme Switching**
   - Load all available themes
   - Switch themes and verify application
   - Verify theme persists across restarts

4. **Find/Replace**
   - Find text and verify matches are highlighted
   - Replace single occurrence
   - Replace all occurrences

### 12.3 Performance Tests

**Metrics to Track:**

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Startup time | < 1000ms | Time from app.ready to editor interactive |
| Memory usage (empty file) | < 100MB | Process memory after opening empty file |
| Memory usage (10K lines) | < 200MB | Process memory after opening 10K line file |
| File open time (1MB) | < 200ms | Time from dialog select to editor display |
| File save time | < 100ms | Time from save command to file written |
| Theme switch time | < 100ms | Time from theme select to application |

**Performance Test:**
```typescript
describe('Performance', () => {
  it('should start in under 1 second', async () => {
    const startTime = Date.now();
    await launchApp();
    await waitForEditorReady();
    const duration = Date.now() - startTime;
    expect(duration).to.be.lessThan(1000);
  });

  it('should open 1MB file in under 200ms', async () => {
    const startTime = Date.now();
    await openFile('test-files/1mb.txt');
    const duration = Date.now() - startTime;
    expect(duration).to.be.lessThan(200);
  });
});
```

### 12.4 Manual Testing Checklist

**Cross-Platform Testing:**
- [ ] Verify application runs on Windows 10/11
- [ ] Verify application runs on macOS Catalina+
- [ ] Verify application runs on Ubuntu 20.04+
- [ ] Test native file dialogs on each platform
- [ ] Test keyboard shortcuts on each platform
- [ ] Test window controls on each platform

**Feature Testing:**
- [ ] Open various file types (js, ts, py, md, json, etc.)
- [ ] Verify syntax highlighting works for all supported languages
- [ ] Test find/replace functionality
- [ ] Switch between all available themes
- [ ] Test word wrap toggle
- [ ] Test line numbers toggle
- [ ] Test unsaved changes prompt
- [ ] Test save and save as functionality
- [ ] Test new file creation

**Edge Cases:**
- [ ] Open very large file (>10MB)
- [ ] Open binary file
- [ ] Open file with special characters in name
- [ ] Save to read-only location (expect error)
- [ ] Open non-existent file (expect error)
- [ ] Test with corrupted configuration file

## 13. Migration Path

### 13.1 Transitioning from VS Code

**User Impact:**
- All extensions will stop working
- Git integration will be removed
- Terminal will be unavailable
- Debug configurations will be ignored
- Workspaces will not be supported

**Migration Guide for Users:**
```markdown
# Migrating from VS Code to Minimal Editor

## What's Removed
- Extensions and extension marketplace
- Integrated terminal
- Git integration
- Debugger
- Multi-root workspaces
- Remote development

## What's Kept
- Core text editing with Monaco
- Syntax highlighting for all languages
- Themes (all built-in themes preserved)
- Find/Replace within file
- Basic file operations

## Recommended Alternatives
- Use system terminal instead of integrated terminal
- Use standalone Git client (GitHub Desktop, SourceTree, GitKraken)
- Use dedicated debugger (VS Code, Chrome DevTools, etc.)
```

### 13.2 Settings Migration

**Minimal Editor will only preserve:**
```json
{
  "editor.theme": "vs-dark",
  "editor.wordWrap": "off",
  "editor.lineNumbers": "on",
  "editor.fontSize": 14,
  "editor.tabSize": 4,
  "editor.insertSpaces": true
}
```

**All other VS Code settings will be ignored.**

### 13.3 Coexistence

**Install Alongside VS Code:**
- Minimal Editor uses different application ID (`com.minimal.editor`)
- Separate configuration directory (`~/.minimal-editor/`)
- Different executable name (`minimal-editor` vs `code`)
- No conflicts with VS Code installation

## 14. Future Considerations

### 14.1 Potential Enhancements

**Phase 2 Features (if needed):**
- Multi-tab support (open multiple files in one window)
- Recent files menu
- Basic auto-save
- Custom keyboard shortcuts (JSON config)
- Font size adjustment menu
- Export/Print functionality

### 14.2 Explicitly Out of Scope

**Will Never Be Added:**
- Extension system
- Language servers / IntelliSense
- Git integration
- Terminal
- Debugger
- Remote development
- Workspace concept
- Settings UI
- Command palette
- Multi-root support

### 14.3 Performance Monitoring

**Telemetry (Optional, Opt-in Only):**
- Startup time
- Memory usage
- File open performance
- Crash reports

**If implemented, must be:**
- Completely opt-in
- Easily disabled
- Minimal data collection
- Privacy-focused
