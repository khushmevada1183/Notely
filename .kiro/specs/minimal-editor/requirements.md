# Requirements Document

## Introduction

This document defines the requirements for transforming VS Code into a minimal, fast, lightweight notepad application. The goal is to strip down VS Code to its essential text editing capabilities while preserving cross-platform support and maintaining the Monaco editor core. The resulting application should start in under 1 second, consume less than 100MB of memory, and provide a clean, distraction-free text editing experience.

## Glossary

- **Minimal_Editor**: The stripped-down text editor application derived from VS Code
- **Monaco_Editor**: The core text editor component that powers the editing experience
- **File_Manager**: The component responsible for file operations (open, save, save as)
- **Theme_Engine**: The component that handles visual themes and color schemes
- **Syntax_Highlighter**: The component that provides syntax highlighting for different file types
- **Extension_System**: The VS Code extension infrastructure (to be removed)
- **Language_Server**: Language intelligence services (to be removed)
- **Status_Bar**: The bottom bar showing file information
- **Activity_Bar**: The left sidebar with icons (to be removed)
- **Side_Panel**: Any panel on the left or right side of the editor (to be removed)
- **Command_Palette**: The command search interface (mostly to be removed)
- **Find_Replace**: The in-file search and replace functionality
- **Desktop_Application**: The Electron-based native application for Windows, macOS, and Linux

## Requirements

### Requirement 1: Core Editor Functionality

**User Story:** As a user, I want to edit text files with syntax highlighting, so that I can write and read code comfortably.

#### Acceptance Criteria

1. THE Minimal_Editor SHALL display the Monaco_Editor as the primary interface component
2. THE Syntax_Highlighter SHALL provide syntax highlighting for all currently supported file extensions (c, js, md, txt, json, html, css, py, java, cpp, rs, go, ts, jsx, tsx, xml, yaml, sql, sh, bat, php, rb, swift, kt)
3. WHEN a user types in the editor, THE Monaco_Editor SHALL respond within 16ms for smooth interaction
4. THE Monaco_Editor SHALL support line numbers display
5. THE Monaco_Editor SHALL support word wrap toggle functionality
6. THE Monaco_Editor SHALL support basic text selection, cut, copy, and paste operations
7. THE Monaco_Editor SHALL support undo and redo operations

### Requirement 2: File Operations

**User Story:** As a user, I want to open, edit, and save files locally, so that I can manage my text documents.

#### Acceptance Criteria

1. WHEN a user selects "New File", THE File_Manager SHALL create a new empty editor buffer
2. WHEN a user selects "Open File", THE File_Manager SHALL display a native file picker dialog
3. WHEN a user selects a file in the file picker, THE File_Manager SHALL load the file contents into the Monaco_Editor within 200ms for files under 10MB
4. WHEN a user selects "Save", THE File_Manager SHALL write the current buffer contents to the existing file path
5. WHEN a user selects "Save As", THE File_Manager SHALL display a native file save dialog and write contents to the selected path
6. THE File_Manager SHALL support local file system operations only (no remote file systems)
7. WHEN a file is modified, THE Minimal_Editor SHALL display an indicator showing unsaved changes
8. WHEN a user attempts to close a file with unsaved changes, THE Minimal_Editor SHALL prompt the user to save, discard, or cancel

### Requirement 3: File Type Detection

**User Story:** As a user, I want the editor to automatically detect file types, so that appropriate syntax highlighting is applied.

#### Acceptance Criteria

1. WHEN a file is opened, THE File_Manager SHALL detect the file type based on file extension
2. WHEN a file type is detected, THE Syntax_Highlighter SHALL apply the appropriate syntax highlighting rules
3. THE Minimal_Editor SHALL support file type detection for all extensions listed in Requirement 1

### Requirement 4: Theme Support

**User Story:** As a user, I want to select from pre-installed themes, so that I can customize the editor appearance to my preference.

#### Acceptance Criteria

1. THE Theme_Engine SHALL include all pre-installed VS Code themes
2. WHEN a user accesses theme selection, THE Minimal_Editor SHALL display a list of available themes
3. WHEN a user selects a theme, THE Theme_Engine SHALL apply the selected theme within 100ms
4. THE Theme_Engine SHALL persist the selected theme across application restarts
5. THE Minimal_Editor SHALL provide a minimal interface for theme selection (simplified command palette or menu item)

### Requirement 5: Find and Replace Within File

**User Story:** As a user, I want to search and replace text within the current file, so that I can quickly modify content.

#### Acceptance Criteria

1. WHEN a user activates find, THE Find_Replace SHALL display a find input field
2. WHEN a user enters a search term, THE Find_Replace SHALL highlight all matches in the Monaco_Editor
3. WHEN a user navigates matches, THE Find_Replace SHALL scroll to and select each match
4. THE Find_Replace SHALL support case-sensitive and case-insensitive search modes
5. THE Find_Replace SHALL support regular expression search patterns
6. WHEN a user activates replace, THE Find_Replace SHALL display both find and replace input fields
7. WHEN a user replaces text, THE Find_Replace SHALL replace the current match or all matches based on user selection
8. THE Find_Replace SHALL operate only within the currently active file

### Requirement 6: Menu System

**User Story:** As a user, I want basic menu options for common operations, so that I can access essential features easily.

#### Acceptance Criteria

1. THE Minimal_Editor SHALL provide a File menu with options: New, Open, Save, Save As, Exit
2. THE Minimal_Editor SHALL provide an Edit menu with options: Undo, Redo, Cut, Copy, Paste, Select All, Find, Replace
3. THE Minimal_Editor SHALL provide a View menu with options: Toggle Word Wrap, Toggle Line Numbers, Select Theme
4. THE Minimal_Editor SHALL use native menu bars on each platform (Windows, macOS, Linux)
5. WHEN a user selects a menu item, THE Minimal_Editor SHALL execute the corresponding action within 50ms

### Requirement 7: Performance Requirements

**User Story:** As a user, I want the editor to start quickly and use minimal resources, so that I can begin working immediately without system slowdown.

#### Acceptance Criteria

1. THE Minimal_Editor SHALL start and display the editor window within 1000ms on a standard system (quad-core processor, 8GB RAM, SSD)
2. THE Minimal_Editor SHALL consume less than 100MB of memory when displaying a single empty file
3. THE Minimal_Editor SHALL consume less than 200MB of memory when displaying a file with 10,000 lines
4. WHEN opening a file under 1MB, THE Minimal_Editor SHALL load and display the file within 200ms
5. THE Minimal_Editor SHALL not include any telemetry or analytics collection mechanisms

### Requirement 8: Removal of Complex Features

**User Story:** As a developer, I want to remove unnecessary VS Code features, so that the application remains minimal and fast.

#### Acceptance Criteria

1. THE Minimal_Editor SHALL NOT include the Extension_System or extension marketplace
2. THE Minimal_Editor SHALL NOT include Git integration features
3. THE Minimal_Editor SHALL NOT include the integrated terminal
4. THE Minimal_Editor SHALL NOT include debugger functionality
5. THE Minimal_Editor SHALL NOT include search across multiple files
6. THE Minimal_Editor SHALL NOT include the Command_Palette except for theme selection
7. THE Minimal_Editor SHALL NOT include settings UI (use minimal configuration file if needed)
8. THE Minimal_Editor SHALL NOT include workspace or multi-root workspace features
9. THE Minimal_Editor SHALL NOT include remote development features
10. THE Minimal_Editor SHALL NOT include Live Share functionality
11. THE Minimal_Editor SHALL NOT include Jupyter notebook support
12. THE Minimal_Editor SHALL NOT include the source control panel
13. THE Minimal_Editor SHALL NOT include problems, output, or debug console panels
14. THE Minimal_Editor SHALL NOT include the Side_Panel, Activity_Bar, or full Status_Bar
15. THE Minimal_Editor SHALL NOT include webview support
16. THE Minimal_Editor SHALL NOT include Language_Server protocol features
17. THE Minimal_Editor SHALL NOT include IntelliSense beyond basic syntax highlighting
18. THE Minimal_Editor SHALL NOT include code actions or refactoring tools

### Requirement 9: Cross-Platform Desktop Support

**User Story:** As a user, I want to use the editor on Windows, macOS, and Linux, so that I have a consistent experience across platforms.

#### Acceptance Criteria

1. THE Desktop_Application SHALL run on Windows 10 and later versions
2. THE Desktop_Application SHALL run on macOS 10.15 (Catalina) and later versions
3. THE Desktop_Application SHALL run on Linux distributions with glibc 2.28 or later
4. THE Desktop_Application SHALL provide native window controls (minimize, maximize, close) on all platforms
5. THE Desktop_Application SHALL use native file dialogs on all platforms
6. THE Desktop_Application SHALL support platform-specific keyboard shortcuts (Ctrl on Windows/Linux, Cmd on macOS)

### Requirement 10: User Interface Simplification

**User Story:** As a user, I want a clean, minimal interface, so that I can focus on writing without distractions.

#### Acceptance Criteria

1. THE Minimal_Editor SHALL display only the menu bar and editor area by default
2. THE Minimal_Editor SHALL NOT display the Activity_Bar
3. THE Minimal_Editor SHALL NOT display side panels by default
4. WHERE the Status_Bar is included, THE Minimal_Editor SHALL display only essential information (file type, line/column position, encoding)
5. THE Minimal_Editor SHALL use a simple window title showing the filename and application name
6. THE Minimal_Editor SHALL provide a clean, distraction-free editing experience with minimal UI chrome

### Requirement 11: Basic Formatting Support

**User Story:** As a user, I want basic text formatting capabilities, so that I can maintain code structure.

#### Acceptance Criteria

1. THE Monaco_Editor SHALL support automatic indentation based on file type
2. THE Monaco_Editor SHALL support tab and space indentation
3. THE Monaco_Editor SHALL support comment toggling for supported languages
4. THE Monaco_Editor SHALL preserve existing file formatting when opening files

### Requirement 12: Window Management

**User Story:** As a user, I want to manage editor windows, so that I can work with the application effectively.

#### Acceptance Criteria

1. THE Minimal_Editor SHALL support opening a single file per window
2. THE Minimal_Editor SHALL allow opening multiple windows for different files
3. WHEN a user closes the application window, THE Minimal_Editor SHALL terminate the application instance
4. THE Minimal_Editor SHALL restore window size and position from the previous session

