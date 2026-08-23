/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as fs from 'fs';
import * as path from 'path';

const root = path.join(import.meta.dirname, '../..');

/** npm install roots for Notely — no remote, no copilot, no TS language-feature extensions. */
export function getNotelyNpmDirs(): string[] {
	const dirs = [
		'',
		'build',
		'build/rspack',
		'build/vite',
	];

	if (fs.existsSync(path.join(root, '.build/distro/npm'))) {
		dirs.push('.build/distro/npm');
	}

	return dirs;
}

/** VS Code extension tsconfig compiles — Notely allowlist has none (themes/grammars only). */
export function getNotelyExtensionCompilations(): string[] {
	return [];
}

/** Esbuild desktop entry points Notely does not ship or spawn. */
export const NOTELY_EXCLUDED_DESKTOP_ENTRIES = [
	'vs/sessions/sessions.desktop.main',
	'vs/sessions/electron-browser/sessions',
	'vs/platform/agentHost/node/agentHostMain',
	'vs/platform/agentHost/node/diffWorkerMain',
	'vs/platform/localTranscription/node/localTranscriptionMain',
	'vs/platform/profiling/electron-browser/profileAnalysisWorkerMain',
	'vs/workbench/contrib/debug/node/telemetryApp',
];

/** TypeScript paths excluded from Notely compile (Tier 3 AI stack). */
export const NOTELY_TSCONFIG_EXCLUDES: string[] = [
	'vs/workbench/contrib/webview/browser/pre/service-worker.js',
	'vs/workbench/contrib/chat/**',
	'vs/workbench/contrib/inlineChat/**',
	'vs/workbench/contrib/mcp/**',
	'vs/workbench/contrib/agentsVoice/**',
	'vs/workbench/services/agentHost/**',
	'vs/workbench/services/mcp/**',
	'vs/platform/agentHost/**',
	'vs/platform/mcp/**',
	'vs/sessions/**',
	'vs/platform/localTranscription/**',
	'vs/workbench/services/localTranscription/**',
	'vs/workbench/contrib/welcomeAgentSessions/**',
	'vs/workbench/contrib/speech/**',
	'vs/workbench/workbench.common.main.ts',
	'vs/workbench/workbench.web.main.ts',
	'vs/workbench/api/browser/extensionHost.contribution.ts',
	'vs/workbench/api/**/mainThreadChat*.ts',
	'vs/workbench/api/**/mainThreadMcp*.ts',
	'vs/workbench/api/**/mainThreadLanguageModel*.ts',
	'vs/workbench/api/**/extHostChat*.ts',
	'vs/workbench/api/**/extHostMcp*.ts',
	'vs/workbench/api/**/extHostLanguageModel*.ts',
	'vs/workbench/api/**/extHostCodeMapper*.ts',
	'vs/workbench/api/**/extHostSpeech*.ts',
	'vs/workbench/api/**/extHostAgentEditorComments*.ts',
	'vs/workbench/api/node/extHostMcpNode.ts',
	'vs/workbench/contrib/terminal/browser/agentHost*.ts',
	'vs/workbench/contrib/terminalContrib/chatAgentTools/**',
	'vs/workbench/contrib/editTelemetry/browser/telemetry/agentHostEditMarkerService.ts',
	'vs/workbench/contrib/notebook/browser/controller/chat/**',
	'vs/server/**',
	'vs/workbench/test/browser/componentFixtures/**',
	'vs/workbench/api/test/**',
];
