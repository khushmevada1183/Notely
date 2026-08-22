import * as monaco from 'monaco-editor';
import './electron-api.d.ts';
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
let isDirty = false;

function updateWindowTitle(): void {
	document.title = isDirty ? 'Minimal Editor *' : 'Minimal Editor';
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
		console.log('file opened', data);
	});

	for (const channel of EDITOR_CHANNELS) {
		window.electronAPI.on(channel, () => {
			console.log(channel);
		});
	}
}

document.addEventListener('DOMContentLoaded', initMinimalEditor);
