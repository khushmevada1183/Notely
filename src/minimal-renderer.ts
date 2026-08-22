import * as monaco from 'monaco-editor';
import './electron-api.d.ts';
import type { FileData } from './minimal-file-service';
import { detectLanguage } from './language-detection';
import { configureMonacoEnvironment, getDefaultEditorOptions } from './monaco-config';

const EDITOR_CHANNELS = [
	'editor:newFile',
	'editor:openFile',
	'editor:saveFile',
	'editor:saveFileAs',
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

function initMinimalEditor(): void {
	const container = document.getElementById('container');
	if (!container) {
		throw new Error('Missing #container');
	}
	loadMonacoStylesheet();
	configureMonacoEnvironment('..');
	editor = monaco.editor.create(container, getDefaultEditorOptions());
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

function setupIpcListeners(): void {
	window.electronAPI.on('file:opened', (data) => {
		const file = data as FileData;
		currentFile = file;
		editor.setValue(file.content);
		monaco.editor.setModelLanguage(editor.getModel()!, detectLanguage(file.name));
		isDirty = false;
		updateWindowTitle();
	});

	for (const channel of EDITOR_CHANNELS) {
		window.electronAPI.on(channel, () => {
			console.log(channel);
		});
	}
}

document.addEventListener('DOMContentLoaded', initMinimalEditor);
