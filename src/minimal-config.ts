import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

export interface IMinimalConfiguration {
	theme: string;
	wordWrap: 'on' | 'off';
	lineNumbers: 'on' | 'off';
	fontSize: number;
	tabSize: number;
	insertSpaces: boolean;
	windowBounds: { x: number; y: number; width: number; height: number };
	isMaximized?: boolean;
}

export function getConfigDir(): string {
	if (process.platform === 'darwin') {
		return path.join(os.homedir(), 'Library', 'Application Support', 'MinimalEditor');
	}
	if (process.platform === 'win32') {
		return path.join(os.homedir(), 'AppData', 'Roaming', 'MinimalEditor');
	}
	return path.join(os.homedir(), '.config', 'minimal-editor');
}

export function getDefaultConfig(): IMinimalConfiguration {
	return {
		theme: 'vs-dark',
		wordWrap: 'off',
		lineNumbers: 'on',
		fontSize: 14,
		tabSize: 4,
		insertSpaces: true,
		windowBounds: { x: 100, y: 100, width: 1200, height: 800 },
	};
}

export function normalizeWindowBounds(
	bounds: { x: number; y: number; width: number; height: number },
	screen: { width: number; height: number },
): typeof bounds {
	const minVisible = 50;
	if (bounds.x + minVisible < 0 || bounds.y + minVisible < 0 ||
		bounds.x > screen.width || bounds.y > screen.height) {
		return getDefaultConfig().windowBounds;
	}
	return bounds;
}

export function loadConfig(): IMinimalConfiguration {
	try {
		const configPath = path.join(getConfigDir(), 'config.json');
		return { ...getDefaultConfig(), ...JSON.parse(fs.readFileSync(configPath, 'utf8')) };
	} catch {
		return getDefaultConfig();
	}
}

export function saveConfig(partial: Partial<IMinimalConfiguration>): void {
	const dir = getConfigDir();
	fs.mkdirSync(dir, { recursive: true });
	const current = loadConfig();
	fs.writeFileSync(path.join(dir, 'config.json'), JSON.stringify({ ...current, ...partial }, null, 2));
}
