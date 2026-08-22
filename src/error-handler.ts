import { dialog } from 'electron';

export function getFileErrorMessage(error: NodeJS.ErrnoException, filePath: string): string {
	switch (error.code) {
		case 'ENOENT': return `File not found: ${filePath}`;
		case 'EACCES': return `Permission denied: ${filePath}`;
		case 'ENOSPC': return 'Disk is full. Free space and try again.';
		case 'EISDIR': return `Path is a directory, not a file: ${filePath}`;
		default: return error.message || 'Unknown file error';
	}
}

export async function showError(title: string, message: string): Promise<void> {
	await dialog.showMessageBox({ type: 'error', title, message, buttons: ['OK'] });
}

export async function handleFileError(error: NodeJS.ErrnoException, filePath: string): Promise<void> {
	await showError('File Error', getFileErrorMessage(error, filePath));
}
