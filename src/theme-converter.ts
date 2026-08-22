import type * as monaco from 'monaco-editor';

export interface IThemeDefinition {
	id: string;
	label: string;
	uiTheme: 'vs' | 'vs-dark' | 'hc-black' | 'hc-light';
	colors: Record<string, string>;
	tokenColors: Array<{ scope?: string | string[]; settings: Record<string, string> }>;
}

export function convertToMonacoTheme(def: IThemeDefinition): monaco.editor.IStandaloneThemeData {
	return {
		base: def.uiTheme,
		inherit: true,
		colors: def.colors,
		rules: def.tokenColors.flatMap(tc => {
			const scopes = Array.isArray(tc.scope) ? tc.scope : tc.scope ? [tc.scope] : [];
			return scopes.map(scope => ({
				token: scope,
				foreground: tc.settings.foreground?.replace('#', ''),
				background: tc.settings.background?.replace('#', ''),
				fontStyle: tc.settings.fontStyle,
			}));
		}),
	};
}
