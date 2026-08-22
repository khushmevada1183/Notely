import * as monaco from 'monaco-editor';
import './electron-api.d.ts';
import type { FileData } from './minimal-file-service';
import { detectLanguage } from './language-detection';
import { configureMonacoEnvironment, getDefaultEditorOptions } from './monaco-config';
import { initSyntaxHighlighting } from './grammar-service';
import { applySavedTheme, applyTheme } from './theme-service';
import { showThemeSelector } from './theme-selector';

const EDITOR_PREFERENCE_CHANNELS = [
	'editor:toggleWordWrap',
	'editor:toggleLineNumbers',
] as const;

let editor: monaco.editor.IStandaloneCodeEditor;
let currentFile: FileData | null = null;
let isDirty = false;

function updateWindowTitle(): void {
	const name = currentFile?.name ?? 'Untitled';
	document.title = `${isDirty ? '* ' : ''}${name} - Minimal Editor`;
}

function loadMonacoStylesheet(): void {
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = '../vs/editor/editor.main.css';
	document.head.appendChild(link);
}

function loadThemeSelectorStylesheet(): void {
	const link = document.createElement('link');
	link.rel = 'stylesheet';
	link.href = 'theme-selector.css';
	document.head.appendChild(link);
}

function runEditorAction(actionId: string): void {
	editor.getAction(actionId)?.run();
}

function setupEditorKeybindings(): void {
	editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => runEditorAction('actions.find'));
	if (window.electronAPI.platform === 'darwin') {
		editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => runEditorAction('editor.action.startFindReplaceAction'));
	} else {
		editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyH, () => runEditorAction('editor.action.startFindReplaceAction'));
	}
}

async function initMinimalEditor(): Promise<void> {
	const container = document.getElementById('container');
	if (!container) {
		throw new Error('Missing #container');
	}
	loadMonacoStylesheet();
	loadThemeSelectorStylesheet();
	configureMonacoEnvironment('..');
	editor = monaco.editor.create(container, getDefaultEditorOptions());
	setupEditorKeybindings();
	await applySavedTheme();
	setupIpcListeners();
	setupEditorListeners();
	void initSyntaxHighlighting(editor);
}

function setupEditorListeners(): void {
	editor.onDidChangeModelContent(() => {
		isDirty = true;
		updateWindowTitle();
		window.electronAPI.send('editor:dirty', isDirty);
	});
}

async function saveFile(): Promise<void> {
	const content = editor.getValue();
	if (!currentFile?.path) {
		await saveFileAs();
		return;
	}
	const result = await window.electronAPI.invoke('file:save', { path: currentFile.path, content }) as { success: boolean; mtime: number; size: number };
	if (result.success) {
		currentFile.mtime = result.mtime;
		currentFile.size = result.size;
		isDirty = false;
		updateWindowTitle();
		window.electronAPI.send('editor:dirty', false);
	}
}

async function saveFileAs(): Promise<void> {
	const content = editor.getValue();
	const data = await window.electronAPI.invoke('file:saveAs', { content }) as FileData | null;
	if (!data) {
		return;
	}
	currentFile = data;
	isDirty = false;
	updateWindowTitle();
}

function newFile(): void {
	currentFile = null;
	editor.setValue('');
	monaco.editor.setModelLanguage(editor.getModel()!, 'plaintext');
	isDirty = false;
	updateWindowTitle();
}

function setupIpcListeners(): void {
	window.electronAPI.on('file:opened', (data) => {
		const file = data as FileData;
		currentFile = file;
		editor.setValue(file.content);
		monaco.editor.setModelLanguage(editor.getModel()!, detectLanguage(file.name));
		isDirty = false;
		updateWindowTitle();
	});

	window.electronAPI.on('editor:saveFile', () => { void saveFile(); });
	window.electronAPI.on('editor:saveFileAs', () => { void saveFileAs(); });
	window.electronAPI.on('editor:newFile', () => newFile());
	window.electronAPI.on('editor:selectTheme', () => {
		showThemeSelector((id) => applyTheme(id));
	});

	window.electronAPI.on('editor:find', () => runEditorAction('actions.find'));
	window.electronAPI.on('editor:replace', () => runEditorAction('editor.action.startFindReplaceAction'));
	window.electronAPI.on('editor:undo', () => runEditorAction('undo'));
	window.electronAPI.on('editor:redo', () => runEditorAction('redo'));
	window.electronAPI.on('editor:selectAll', () => runEditorAction('editor.action.selectAll'));

	for (const channel of EDITOR_PREFERENCE_CHANNELS) {
		window.electronAPI.on(channel, () => {
			console.log(channel);
		});
	}
}

document.addEventListener('DOMContentLoaded', () => { void initMinimalEditor(); });
