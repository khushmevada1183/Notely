import { app, BrowserWindow, dialog, ipcMain, screen } from 'electron';
import * as path from 'path';
import { loadConfig, normalizeWindowBounds, saveConfig } from './minimal-config';
import * as fileService from './minimal-file-service';
import { createApplicationMenu } from './minimal-menu';

let mainWindow: BrowserWindow | null = null;
let isDirty = false;

async function handleOpenFile(): Promise<void> {
	const data = await fileService.openFile();
	if (data && mainWindow) {
		mainWindow.webContents.send('file:opened', data);
	}
}

function createWindow(): void {
	const config = loadConfig();
	const { x, y, width, height } = config.windowBounds;

	mainWindow = new BrowserWindow({
		x, y, width, height,
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: path.join(__dirname, 'minimal-preload.js'),
		},
	});

	if (config.isMaximized) {
		mainWindow.maximize();
	}

	mainWindow.loadFile(path.join(__dirname, 'resources', 'index.html'));

	mainWindow.on('close', (event) => {
		if (!mainWindow) {
			return;
		}
		if (isDirty) {
			event.preventDefault();
			dialog.showMessageBox(mainWindow, {
				type: 'question',
				buttons: ['Save', 'Discard', 'Cancel'],
				defaultId: 0,
				cancelId: 2,
				title: 'Unsaved Changes',
				message: 'Do you want to save the changes you made?',
			}).then(async (result) => {
				if (result.response === 2) {
					return;
				}
				if (result.response === 1) {
					isDirty = false;
					mainWindow?.destroy();
					return;
				}
				mainWindow?.webContents.send('editor:saveAndClose');
			});
			return;
		}
		const bounds = mainWindow.getBounds();
		saveConfig({
			windowBounds: bounds,
			isMaximized: mainWindow.isMaximized(),
		});
	});

	mainWindow.on('closed', () => { mainWindow = null; });

	createApplicationMenu(mainWindow, () => { void handleOpenFile(); });
}

app.whenReady().then(() => {
	ipcMain.on('editor:dirty', (_e, dirty: boolean) => {
		isDirty = dirty;
	});
	ipcMain.on('window:force-close', () => {
		isDirty = false;
		mainWindow?.destroy();
	});
	ipcMain.handle('file:open', () => fileService.openFile());
	ipcMain.handle('file:save', (_e, { path: filePath, content }: { path: string; content: string }) => fileService.saveFile(filePath, content));
	ipcMain.handle('file:saveAs', (_e, { content }: { content: string }) => fileService.saveFileAs(content));
	ipcMain.handle('config:load', () => loadConfig());
	ipcMain.handle('config:save', (_e, partial: Partial<ReturnType<typeof loadConfig>>) => saveConfig(partial));
	ipcMain.on('editor:openFile', () => { void handleOpenFile(); });
	createWindow();
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') { app.quit(); } });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) { createWindow(); } });
