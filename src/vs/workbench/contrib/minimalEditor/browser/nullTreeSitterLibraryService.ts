/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { Parser, Language, Query } from '@vscode/tree-sitter-wasm';
import { IReader } from '../../../../base/common/observable.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ITreeSitterLibraryService } from '../../../../editor/common/services/treeSitter/treeSitterLibraryService.js';

export class NullTreeSitterLibraryService implements ITreeSitterLibraryService {
	declare readonly _serviceBrand: undefined;

	getParserClass(): Promise<typeof Parser> {
		return Promise.reject(new Error('TreeSitter is disabled in Notely'));
	}

	supportsLanguage(_languageId: string, _reader: IReader | undefined): boolean {
		return false;
	}

	getLanguage(_languageId: string, _ignoreSupportsCheck: boolean, _reader: IReader | undefined): Language | undefined {
		return undefined;
	}

	async getLanguagePromise(_languageId: string): Promise<Language | undefined> {
		return undefined;
	}

	getInjectionQueries(_languageId: string, _reader: IReader | undefined): Query | null | undefined {
		return null;
	}

	getHighlightingQueries(_languageId: string, _reader: IReader | undefined): Query | null | undefined {
		return null;
	}

	async createQuery(_language: Language, _querySource: string): Promise<Query> {
		return Promise.reject(new Error('TreeSitter is disabled in Notely'));
	}
}

registerSingleton(ITreeSitterLibraryService, NullTreeSitterLibraryService, InstantiationType.Delayed);
