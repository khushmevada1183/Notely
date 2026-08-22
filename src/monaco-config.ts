import type * as monaco from 'monaco-editor';

export function configureMonacoEnvironment(baseUrl: string): void {
	(self as any).MonacoEnvironment = {
		getWorkerUrl: (_moduleId: string, label: string) => {
			if (label === 'json') {
				return `${baseUrl}/vs/language/json/json.worker.js`;
			}
			if (label === 'css' || label === 'scss' || label === 'less') {
				return `${baseUrl}/vs/language/css/css.worker.js`;
			}
			if (label === 'html' || label === 'handlebars' || label === 'razor') {
				return `${baseUrl}/vs/language/html/html.worker.js`;
			}
			if (label === 'typescript' || label === 'javascript') {
				return `${baseUrl}/vs/language/typescript/ts.worker.js`;
			}
			return `${baseUrl}/vs/editor/editor.worker.js`;
		},
	};
}

export function getDefaultEditorOptions(): monaco.editor.IStandaloneEditorConstructionOptions {
	return {
		value: '',
		language: 'plaintext',
		theme: 'vs-dark',
		automaticLayout: true,
		minimap: { enabled: false },
		scrollBeyondLastLine: false,
		fontSize: 14,
		lineNumbers: 'on',
		wordWrap: 'off',
	};
}
