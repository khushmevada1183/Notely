/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { MainContext } from '../../../api/common/extHost.protocol.js';
import { ProxyIdentifier } from '../../../services/extensions/common/proxyIdentifier.js';

/** Main-thread RPC surface Notely registers (real + intentional null stubs). */
export const NOTELY_MAIN_CONTEXT_IDENTIFIERS: ProxyIdentifier<unknown>[] = [
	MainContext.MainThreadLocalization,
	MainContext.MainThreadBulkEdits,
	MainContext.MainThreadClipboard,
	MainContext.MainThreadCommands,
	MainContext.MainThreadConfiguration,
	MainContext.MainThreadConsole,
	MainContext.MainThreadDecorations,
	MainContext.MainThreadDiagnostics,
	MainContext.MainThreadDialogs,
	MainContext.MainThreadDocumentContentProviders,
	MainContext.MainThreadDocuments,
	MainContext.MainThreadTextEditors,
	MainContext.MainThreadEditorTabs,
	MainContext.MainThreadErrors,
	MainContext.MainThreadExtensionService,
	MainContext.MainThreadFileSystem,
	MainContext.MainThreadFileSystemEventService,
	MainContext.MainThreadLanguageFeatures,
	MainContext.MainThreadLanguages,
	MainContext.MainThreadLogger,
	MainContext.MainThreadMessageService,
	MainContext.MainThreadProgress,
	MainContext.MainThreadQuickOpen,
	MainContext.MainThreadStatusBar,
	MainContext.MainThreadStorage,
	MainContext.MainThreadTheming,
	MainContext.MainThreadTreeViews,
	MainContext.MainThreadDownloadService,
	MainContext.MainThreadUrls,
	MainContext.MainThreadWindow,
	MainContext.MainThreadWorkspace,
	MainContext.MainThreadLabelService,
	MainContext.MainThreadSecretState,
	MainContext.MainThreadTelemetry,
	// Null stubs — ext host still probes these; Notely does not implement the features.
	MainContext.MainThreadAuthentication,
	MainContext.MainThreadDebugService,
	MainContext.MainThreadEmbeddings,
	MainContext.MainThreadLanguageModels,
	MainContext.MainThreadSearch,
	MainContext.MainThreadTask,
	MainContext.MainThreadTerminalService,
];
