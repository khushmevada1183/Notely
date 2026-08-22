import * as fs from 'fs';
import * as path from 'path';
import { handleFileError } from './error-handler';

export interface FileData {
	path: string;
	name: string;
	content: string;
	mtime: number;
	size: number;
	encoding: string;
	eol: '\n' | '\r\n';
}

export function detectEOL(content: string): '\n' | '\r\n' {
	return content.includes('\r\n') ? '\r\n' : '\n';
}

export async function openFile(): Promise<FileData | null> {
	try {
		const { dialog } = await import('electron');
		const result = await dialog.showOpenDialog({ properties: ['openFile'], filters: [{ name: 'All Files', extensions: ['*'] }] });
		if (result.canceled || !result.filePaths[0]) {
			return null;
		}
		const filePath = result.filePaths[0];
		const content = await fs.promises.readFile(filePath, 'utf8');
		const stat = await fs.promises.stat(filePath);
		return {
			path: filePath,
			name: path.basename(filePath),
			content,
			mtime: stat.mtimeMs,
			size: stat.size,
			encoding: 'utf-8',
			eol: detectEOL(content),
		};
	} catch (error) {
		await handleFileError(error as NodeJS.ErrnoException, 'selected file');
		return null;
	}
}

export async function saveFile(filePath: string, content: string) {
	try {
		const tempPath = filePath + '.tmp';
		await fs.promises.writeFile(tempPath, content, 'utf8');
		await fs.promises.rename(tempPath, filePath);
		const stat = await fs.promises.stat(filePath);
		return { success: true, mtime: stat.mtimeMs, size: stat.size };
	} catch (error) {
		await handleFileError(error as NodeJS.ErrnoException, filePath);
		return { success: false, mtime: 0, size: 0 };
	}
}

export async function saveFileAs(content: string): Promise<FileData | null> {
	try {
		const { dialog } = await import('electron');
		const result = await dialog.showSaveDialog({ filters: [{ name: 'All Files', extensions: ['*'] }] });
		if (result.canceled || !result.filePath) {
			return null;
		}
		const saved = await saveFile(result.filePath, content);
		if (!saved.success) {
			return null;
		}
		const stat = await fs.promises.stat(result.filePath);
		return {
			path: result.filePath,
			name: path.basename(result.filePath),
			content,
			mtime: stat.mtimeMs,
			size: stat.size,
			encoding: 'utf-8',
			eol: detectEOL(content),
		};
	} catch (error) {
		await handleFileError(error as NodeJS.ErrnoException, 'selected file');
		return null;
	}
}
