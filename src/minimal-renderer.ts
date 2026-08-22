import * as monaco from 'monaco-editor';
import './electron-api.d.ts';
import type { FileData } from './minimal-file-service';
import { detectLanguage } from './language-detection';
import { configureMonacoEnvironment, getDefaultEditorOptions } from './monaco-config';
import { applySavedTheme } from './theme-service';

const EDITOR_CHANNELS = [
	'editor:openFile',
	'editor:undo',
	'editor:redo',
	'editor:selectAll',
	'editor:find',
	'editor:replace',
	'editor:toggleWordWrap',
	'editor:toggleLineNumbers',
	'editor:selectTheme',
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

async function initMinimalEditor(): Promise<void> {
	const container = document.getElementById('container');
	if (!container) {
		throw new Error('Missing #container');
	}
	loadMonacoStylesheet();
	configureMonacoEnvironment('..');
	editor = monaco.editor.create(container, getDefaultEditorOptions());
	await applySavedTheme();
	setupIpcListeners();
	setupEditorListeners();
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

	for (const channel of EDITOR_CHANNELS) {
		window.electronAPI.on(channel, () => {
			console.log(channel);
		});
	}
}

document.addEventListener('DOMContentLoaded', () => { void initMinimalEditor(); });
