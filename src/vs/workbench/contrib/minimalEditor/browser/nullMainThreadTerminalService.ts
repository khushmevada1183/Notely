/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { IProcessProperty, IProcessReadyWindowsPty } from '../../../../platform/terminal/common/terminal.js';
import { ISerializableEnvironmentDescriptionMap, ISerializableEnvironmentVariableCollection } from '../../../../platform/terminal/common/environmentVariable.js';
import { extHostNamedCustomer } from '../../../services/extensions/common/extHostCustomers.js';
import { ExtHostTerminalIdentifier, MainContext, MainThreadTerminalServiceShape, TerminalLaunchConfig } from '../../../api/common/extHost.protocol.js';

@extHostNamedCustomer(MainContext.MainThreadTerminalService)
export class NullMainThreadTerminalService extends Disposable implements MainThreadTerminalServiceShape {

	$createTerminal(_extHostTerminalId: string, _config: TerminalLaunchConfig): Promise<void> { return Promise.resolve(); }
	$dispose(_id: ExtHostTerminalIdentifier): void { }
	$hide(_id: ExtHostTerminalIdentifier): void { }
	$sendText(_id: ExtHostTerminalIdentifier, _text: string, _shouldExecute: boolean): void { }
	$show(_id: ExtHostTerminalIdentifier, _preserveFocus: boolean): void { }
	$registerProcessSupport(_isSupported: boolean): void { }
	$registerProfileProvider(_id: string, _extensionIdentifier: string): void { }
	$unregisterProfileProvider(_id: string): void { }
	$registerCompletionProvider(_id: string, _extensionIdentifier: string, ..._triggerCharacters: string[]): void { }
	$unregisterCompletionProvider(_id: string): void { }
	$registerQuickFixProvider(_id: string, _extensionIdentifier: string): void { }
	$unregisterQuickFixProvider(_id: string): void { }
	$setEnvironmentVariableCollection(_extensionIdentifier: string, _persistent: boolean, _collection: ISerializableEnvironmentVariableCollection | undefined, _descriptionMap: ISerializableEnvironmentDescriptionMap): void { }
	$startSendingDataEvents(): void { }
	$stopSendingDataEvents(): void { }
	$startSendingCommandEvents(): void { }
	$stopSendingCommandEvents(): void { }
	$startLinkProvider(): void { }
	$stopLinkProvider(): void { }
	$sendProcessData(_terminalId: number, _data: string): void { }
	$sendProcessReady(_terminalId: number, _pid: number, _cwd: string, _windowsPty: IProcessReadyWindowsPty | undefined): void { }
	$sendProcessProperty(_terminalId: number, _property: IProcessProperty<any>): void { }
	$sendProcessExit(_terminalId: number, _exitCode: number | undefined): void { }
}
