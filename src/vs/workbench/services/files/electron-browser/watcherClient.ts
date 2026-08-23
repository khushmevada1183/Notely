/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { getDelayedChannel, ProxyChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { IFileChange } from '../../../../platform/files/common/files.js';
import { AbstractUniversalWatcherClient, ILogMessage, IRecursiveWatcher } from '../../../../platform/files/common/watcher.js';
import { IUtilityProcessWorkerWorkbenchService } from '../../utilityProcess/electron-browser/utilityProcessWorkerWorkbenchService.js';
import { Event } from '../../../../base/common/event.js';

export class UniversalWatcherClient extends AbstractUniversalWatcherClient {

	constructor(
		onFileChanges: (changes: IFileChange[]) => void,
		onLogMessage: (msg: ILogMessage) => void,
		verboseLogging: boolean,
		private readonly utilityProcessWorkerWorkbenchService: IUtilityProcessWorkerWorkbenchService
	) {
		super(onFileChanges, onLogMessage, verboseLogging);

		this.init();
	}

	protected override createWatcher(disposables: DisposableStore): IRecursiveWatcher {
		// NOTELY: We disable the out-of-process File Watcher (Utility Process) to save ~53MB PSS.
		// A simple notepad does not need heavy recursive workspace watching.
		return {
			watch: async () => {},
			stop: async () => {},
			onDidChangeFile: Event.None,
			onDidLogMessage: Event.None,
			onDidError: Event.None,
			setVerboseLogging: async () => {}
		} as unknown as IRecursiveWatcher;
	}
}
