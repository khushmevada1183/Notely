import { app, BrowserWindow } from 'electron';
import * as path from 'path';
import { loadConfig, saveConfig } from './minimal-config';

let mainWindow: BrowserWindow | null = null;

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

	mainWindow.on('close', () => {
		if (!mainWindow) {
			return;
		}
		const bounds = mainWindow.getBounds();
		saveConfig({
			windowBounds: bounds,
			isMaximized: mainWindow.isMaximized(),
		});
	});

	mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => { if (process.platform !== 'darwin') { app.quit(); } });
app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) { createWindow(); } });
