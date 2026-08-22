import './electron-api.d.ts';

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

function initMinimalEditor(): void {
	const container = document.getElementById('container');
	if (!container) {
		throw new Error('Missing #container');
	}
	container.textContent = 'Renderer ready';
	setupIpcListeners();
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
