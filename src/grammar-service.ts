import * as monaco from 'monaco-editor';
import { Registry, INITIAL, StackElement } from 'monaco-textmate';
import { loadWASM } from 'onigasm';
import { LANGUAGE_TO_SCOPE } from './language-scope-map';

const GRAMMARS_BASE = './grammars/';

interface GrammarManifestEntry {
	languageId: string;
	scopeName: string;
	file: string;
}

let wasmLoaded = false;

class TokenizerState implements monaco.languages.IState {
	constructor(private readonly _ruleStack: StackElement) { }

	get ruleStack(): StackElement {
		return this._ruleStack;
	}

	clone(): TokenizerState {
		return new TokenizerState(this._ruleStack);
	}

	equals(other: monaco.languages.IState): boolean {
		return other instanceof TokenizerState && other._ruleStack === this._ruleStack;
	}
}

// monaco-editor-textmate uses Monaco internals for scope-to-theme matching.
function tmToMonacoToken(editor: monaco.editor.ICodeEditor, scopes: string[]): string {
	let scopeName = '';
	for (let i = scopes[0].length - 1; i >= 0; i -= 1) {
		const char = scopes[0][i];
		if (char === '.') {
			break;
		}
		scopeName = char + scopeName;
	}

	const themeService = (editor as unknown as { _themeService?: { getColorTheme(): { _tokenTheme: { _match(token: string): { _foreground: number } } } } })._themeService;
	if (!themeService) {
		return scopes[scopes.length - 1] ?? '';
	}

	for (let i = scopes.length - 1; i >= 0; i -= 1) {
		const scope = scopes[i];
		for (let j = scope.length - 1; j >= 0; j -= 1) {
			if (scope[j] !== '.') {
				continue;
			}
			const token = scope.slice(0, j);
			const tokenTheme = themeService.getColorTheme()._tokenTheme;
			if (tokenTheme._match(`${token}.${scopeName}`)._foreground > 1) {
				return `${token}.${scopeName}`;
			}
			if (tokenTheme._match(token)._foreground > 1) {
				return token;
			}
		}
	}

	return scopes[scopes.length - 1] ?? '';
}

async function wireTmGrammars(
	monacoInstance: typeof monaco,
	registry: Registry,
	languages: Map<string, string>,
	editor: monaco.editor.ICodeEditor,
): Promise<void> {
	await Promise.all(Array.from(languages.keys()).map(async (languageId) => {
		const scopeName = languages.get(languageId);
		if (!scopeName) {
			return;
		}
		try {
			const grammar = await registry.loadGrammar(scopeName);
			if (!grammar) {
				return;
			}
			monacoInstance.languages.setTokensProvider(languageId, {
				getInitialState: () => new TokenizerState(INITIAL),
				tokenize: (line: string, state: TokenizerState) => {
					const result = grammar.tokenizeLine(line, state.ruleStack);
					return {
						endState: new TokenizerState(result.ruleStack),
						tokens: result.tokens.map(token => ({
							...token,
							scopes: tmToMonacoToken(editor, token.scopes),
						})),
					};
				},
			});
		} catch (err) {
			console.warn(`TextMate grammar unavailable for ${languageId} (${scopeName}):`, err);
		}
	}));
}

export async function initSyntaxHighlighting(editor: monaco.editor.IStandaloneCodeEditor): Promise<void> {
	if (!wasmLoaded) {
		const resp = await fetch(`${GRAMMARS_BASE}onigasm.wasm`);
		if (!resp.ok) {
			throw new Error(`Failed to load onigasm.wasm: ${resp.status}`);
		}
		await loadWASM(await resp.arrayBuffer());
		wasmLoaded = true;
	}

	const manifestResp = await fetch(`${GRAMMARS_BASE}manifest.json`);
	if (!manifestResp.ok) {
		throw new Error(`Failed to load grammar manifest: ${manifestResp.status}`);
	}
	const manifest = await manifestResp.json() as GrammarManifestEntry[];
	const availableScopes = new Set(manifest.map(entry => entry.scopeName));

	const registry = new Registry({
		getGrammarDefinition: async (scopeName: string, _dependentScope: string) => {
			const entry = manifest.find(m => m.scopeName === scopeName);
			if (!entry) {
				return { format: 'json' as const, content: '{}' };
			}
			const grammarResp = await fetch(`${GRAMMARS_BASE}${entry.file}`);
			return { format: 'json' as const, content: await grammarResp.text() };
		},
	});

	const languages = new Map<string, string>();
	for (const [languageId, scopeName] of Object.entries(LANGUAGE_TO_SCOPE)) {
		if (availableScopes.has(scopeName)) {
			languages.set(languageId, scopeName);
		}
	}

	await wireTmGrammars(monaco, registry, languages, editor);
}
