/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import path from 'path';

/** npm production dependency paths to omit from Notely installers. */
const NOTELY_NPM_EXCLUDE_SEGMENTS = [
	`${path.sep}node_modules${path.sep}@github${path.sep}copilot${path.sep}`,
	`${path.sep}node_modules${path.sep}@github${path.sep}copilot-`,
	`${path.sep}node_modules${path.sep}@github${path.sep}copilot-sdk${path.sep}`,
	`${path.sep}node_modules${path.sep}@vscode${path.sep}copilot-api${path.sep}`,
	`${path.sep}node_modules${path.sep}@anthropic-ai${path.sep}`,
	`${path.sep}node_modules${path.sep}@openai${path.sep}`,
	`${path.sep}node_modules${path.sep}openai${path.sep}`,
];

/** Compiled `out/` paths to omit from Notely installers (AI / agent / sessions stack). */
const NOTELY_OUT_EXCLUDE_PATTERNS: RegExp[] = [
	/[/\\]vs[/\\]workbench[/\\]contrib[/\\]chat[/\\]/,
	/[/\\]vs[/\\]workbench[/\\]contrib[/\\]inlineChat[/\\]/,
	/[/\\]vs[/\\]workbench[/\\]contrib[/\\]mcp[/\\]/,
	/[/\\]vs[/\\]workbench[/\\]contrib[/\\]agentsVoice[/\\]/,
	/[/\\]vs[/\\]workbench[/\\]services[/\\]agentHost[/\\]/,
	/[/\\]vs[/\\]workbench[/\\]services[/\\]mcp[/\\]/,
	/[/\\]vs[/\\]platform[/\\]agentHost[/\\]/,
	/[/\\]vs[/\\]platform[/\\]mcp[/\\]/,
	/[/\\]vs[/\\]sessions[/\\]/,
];

const NOTELY_CHECKSUM_FILES = [
	'vs/base/parts/sandbox/electron-browser/preload.js',
	'vs/workbench/workbench.desktop.main.js',
	'vs/workbench/workbench.desktop.main.css',
	'vs/workbench/api/node/extensionHostProcess.js',
	'vs/code/electron-browser/workbench/workbench.html',
	'vs/code/electron-browser/workbench/workbench.js',
];

export function isNotelyExcludedNpmDependency(dependencyPath: string): boolean {
	const normalized = path.normalize(dependencyPath);
	return NOTELY_NPM_EXCLUDE_SEGMENTS.some(segment => normalized.includes(segment));
}

export function isNotelyExcludedOutFile(filePath: string): boolean {
	const normalized = filePath.replace(/\\/g, '/');
	return NOTELY_OUT_EXCLUDE_PATTERNS.some(pattern => pattern.test(normalized));
}

export function getNotelyChecksumFiles(): string[] {
	return NOTELY_CHECKSUM_FILES;
}
