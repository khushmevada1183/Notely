import * as fs from 'fs';
import * as path from 'path';

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
}

export async function saveFile(filePath: string, content: string) {
	const tempPath = filePath + '.tmp';
	await fs.promises.writeFile(tempPath, content, 'utf8');
	await fs.promises.rename(tempPath, filePath);
	const stat = await fs.promises.stat(filePath);
	return { success: true, mtime: stat.mtimeMs, size: stat.size };
}

export async function saveFileAs(content: string): Promise<FileData | null> {
	const { dialog } = await import('electron');
	const result = await dialog.showSaveDialog({ filters: [{ name: 'All Files', extensions: ['*'] }] });
	if (result.canceled || !result.filePath) {
		return null;
	}
	await saveFile(result.filePath, content);
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
}
