/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import * as path from 'path';

const root = path.join(import.meta.dirname, '../..');

interface NotelyAllowlist {
	themes: string[];
	grammars: string[];
	exclude: string[];
}

let cachedNames: Set<string> | undefined;

export function getNotelyExtensionNames(): Set<string> {
	if (cachedNames) {
		return cachedNames;
	}

	const allowlistPath = path.join(import.meta.dirname, '../minimal-extensions.allowlist.json');
	const allowlist = JSON.parse(fs.readFileSync(allowlistPath, 'utf8')) as NotelyAllowlist;
	const names = new Set<string>();

	for (const pattern of allowlist.themes) {
		if (pattern.endsWith('*')) {
			const prefix = pattern.slice(0, -1);
			for (const entry of fs.readdirSync(path.join(root, 'extensions'))) {
				if (entry.startsWith(prefix)) {
					names.add(entry);
				}
			}
		} else {
			names.add(pattern);
		}
	}

	for (const grammar of allowlist.grammars) {
		names.add(grammar);
	}

	for (const excluded of allowlist.exclude) {
		names.delete(excluded);
	}

	cachedNames = names;
	return names;
}

export function isNotelyPackagedExtension(name: string): boolean {
	return getNotelyExtensionNames().has(name);
}
