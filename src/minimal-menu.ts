import type { BrowserWindow, MenuItemConstructorOptions } from 'electron';

export function getCommandKey(): string {
	return process.platform === 'darwin' ? 'Cmd' : 'Ctrl';
}

export function createApplicationMenu(mainWindow: BrowserWindow, onOpenFile?: () => void): void {
	const { app, Menu } = require('electron') as typeof import('electron');
	const cmd = getCommandKey();
	const isMac = process.platform === 'darwin';

	const send = (channel: string) => () => {
		mainWindow.webContents.send(channel);
	};

	const template: MenuItemConstructorOptions[] = [
		...(isMac ? [{ label: app.name, submenu: [{ role: 'about' as const }, { type: 'separator' as const }, { role: 'quit' as const }] }] : []),
		{
			label: 'File',
			submenu: [
				{ label: 'New File', accelerator: `${cmd}+N`, click: send('editor:newFile') },
				{ label: 'Open File', accelerator: `${cmd}+O`, click: onOpenFile ?? send('editor:openFile') },
				{ type: 'separator' },
				{ label: 'Save', accelerator: `${cmd}+S`, click: send('editor:saveFile') },
				{ label: 'Save As', accelerator: `${cmd}+Shift+S`, click: send('editor:saveFileAs') },
				{ type: 'separator' },
				{ label: 'Close Window', accelerator: `${cmd}+W`, role: 'close' },
				...(!isMac ? [{ label: 'Exit', role: 'quit' as const }] : []),
			],
		},
		{
			label: 'Edit',
			submenu: [
				{ label: 'Undo', accelerator: `${cmd}+Z`, click: send('editor:undo') },
				{ label: 'Redo', accelerator: isMac ? 'Cmd+Shift+Z' : 'Ctrl+Y', click: send('editor:redo') },
				{ type: 'separator' },
				{ role: 'cut' }, { role: 'copy' }, { role: 'paste' },
				{ label: 'Select All', accelerator: `${cmd}+A`, click: send('editor:selectAll') },
				{ type: 'separator' },
				{ label: 'Find', accelerator: `${cmd}+F`, click: send('editor:find') },
				{ label: 'Replace', accelerator: isMac ? 'Cmd+Alt+F' : 'Ctrl+H', click: send('editor:replace') },
			],
		},
		{
			label: 'View',
			submenu: [
				{ label: 'Toggle Word Wrap', click: send('editor:toggleWordWrap') },
				{ label: 'Toggle Line Numbers', click: send('editor:toggleLineNumbers') },
				{ type: 'separator' },
				{ label: 'Select Theme', click: send('editor:selectTheme') },
			],
		},
	];

	Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
