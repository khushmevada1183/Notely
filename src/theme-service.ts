import * as monaco from 'monaco-editor';
import { convertToMonacoTheme, IThemeDefinition } from './theme-converter';
import type { IMinimalConfiguration } from './minimal-config';

const JSONC_STRIP = /("[^"\\]*(?:\\.[^"\\]*)*")|('[^'\\]*(?:\\.[^'\\]*)*')|(\/\*[^\/\*]*(?:(?:\*|\/)[^\/\*]*)*?\*\/)|(\/{2,}.*?(?:(?:\r?\n)|$))|(,\s*[}\]])/g;

interface IThemeManifestEntry {
	id: string;
	label: string;
	uiTheme: string;
	path: string;
}

interface IRawThemeFile {
	include?: string;
	colors?: Record<string, string>;
	tokenColors?: IThemeDefinition['tokenColors'];
}

let themes: IThemeDefinition[] = [];

function parseThemeJson(text: string): IRawThemeFile {
	const stripped = text.replace(JSONC_STRIP, (match, _m1, _m2, m3, m4, m5) => {
		if (m3) {
			return '';
		}
		if (m4) {
			const length = m4.length;
			if (m4[length - 1] === '\n') {
				return m4[length - 2] === '\r' ? '\r\n' : '\n';
			}
			return '';
		}
		if (m5) {
			return match.substring(1);
		}
		return match;
	});
	try {
		return JSON.parse(stripped);
	} catch {
		return JSON.parse(stripped.replace(/,\s*([}\]])/g, '$1'));
	}
}

function resolveIncludePath(include: string, manifest: IThemeManifestEntry[]): string | undefined {
	const base = include.replace(/^\.\//, '');
	return manifest.find(entry => entry.path === base || entry.path.endsWith(base))?.path;
}

async function fetchThemeFile(path: string): Promise<IRawThemeFile> {
	const resp = await fetch(`./resources/themes/${path}`);
	return parseThemeJson(await resp.text());
}

async function resolveThemeData(
	path: string,
	manifest: IThemeManifestEntry[],
	seen = new Set<string>(),
): Promise<{ colors: Record<string, string>; tokenColors: IThemeDefinition['tokenColors'] }> {
	if (seen.has(path)) {
		return { colors: {}, tokenColors: [] };
	}
	seen.add(path);

	const raw = await fetchThemeFile(path);
	if (raw.include) {
		const includePath = resolveIncludePath(raw.include, manifest);
		if (includePath) {
			const parent = await resolveThemeData(includePath, manifest, seen);
			return {
				colors: { ...parent.colors, ...raw.colors },
				tokenColors: [...parent.tokenColors, ...(raw.tokenColors ?? [])],
			};
		}
	}
	return {
		colors: raw.colors ?? {},
		tokenColors: raw.tokenColors ?? [],
	};
}

async function loadRendererConfig(): Promise<IMinimalConfiguration> {
	return await window.electronAPI.invoke('config:load') as IMinimalConfiguration;
}

async function saveRendererConfig(partial: Partial<IMinimalConfiguration>): Promise<void> {
	await window.electronAPI.invoke('config:save', partial);
}

export async function loadThemes(): Promise<IThemeDefinition[]> {
	const resp = await fetch('./resources/themes/manifest.json');
	const manifest = await resp.json() as IThemeManifestEntry[];
	themes = [];
	for (const entry of manifest) {
		const { colors, tokenColors } = await resolveThemeData(entry.path, manifest);
		themes.push({
			id: entry.id,
			label: entry.label,
			uiTheme: (entry.uiTheme as IThemeDefinition['uiTheme']) || 'vs-dark',
			colors,
			tokenColors,
		});
	}
	return themes;
}

export function getThemes(): IThemeDefinition[] {
	return themes;
}

export function applyTheme(themeId: string): void {
	const theme = themes.find(t => t.id === themeId);
	if (theme) {
		monaco.editor.defineTheme(themeId, convertToMonacoTheme(theme));
		monaco.editor.setTheme(themeId);
		void saveRendererConfig({ theme: themeId });
		return;
	}
	if (themeId === 'vs' || themeId === 'vs-dark' || themeId === 'hc-black' || themeId === 'hc-light') {
		monaco.editor.setTheme(themeId);
		void saveRendererConfig({ theme: themeId });
	}
}

export async function applySavedTheme(): Promise<void> {
	await loadThemes();
	const { theme } = await loadRendererConfig();
	if (themes.some(t => t.id === theme)) {
		applyTheme(theme);
		return;
	}
	monaco.editor.setTheme('vs-dark');
}
