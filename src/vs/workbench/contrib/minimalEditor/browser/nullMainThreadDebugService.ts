/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { UriComponents } from '../../../../base/common/uri.js';
import { DebugConfigurationProviderTriggerKind } from '../../debug/common/debug.js';
import { extHostNamedCustomer } from '../../../services/extensions/common/extHostCustomers.js';
import { DebugSessionUUID, IFunctionBreakpointDto, IDataBreakpointDto, IDebugConfiguration, ISourceMultiBreakpointDto, IStartDebuggingOptions, MainContext, MainThreadDebugServiceShape } from '../../../api/common/extHost.protocol.js';

@extHostNamedCustomer(MainContext.MainThreadDebugService)
export class NullMainThreadDebugService extends Disposable implements MainThreadDebugServiceShape {

	$registerDebugTypes(_debugTypes: string[]): void { }
	$sessionCached(_sessionID: string): void { }
	$acceptDAMessage(_handle: number, _message: DebugProtocol.ProtocolMessage): void { }
	$acceptDAError(_handle: number, _name: string, _message: string, _stack: string | undefined): void { }
	$acceptDAExit(_handle: number, _code: number | undefined, _signal: string | undefined): void { }
	$registerDebugConfigurationProvider(_type: string, _triggerKind: DebugConfigurationProviderTriggerKind, _hasProvideMethod: boolean, _hasResolveMethod: boolean, _hasResolve2Method: boolean, _handle: number): Promise<void> { return Promise.resolve(); }
	$registerDebugAdapterDescriptorFactory(_type: string, _handle: number): Promise<void> { return Promise.resolve(); }
	$unregisterDebugConfigurationProvider(_handle: number): void { }
	$unregisterDebugAdapterDescriptorFactory(_handle: number): void { }
	$startDebugging(_folder: UriComponents | undefined, _nameOrConfig: string | IDebugConfiguration, _options: IStartDebuggingOptions): Promise<boolean> { return Promise.resolve(false); }
	$stopDebugging(_sessionId: DebugSessionUUID | undefined): Promise<void> { return Promise.resolve(); }
	$setDebugSessionName(_id: DebugSessionUUID, _name: string): void { }
	$customDebugAdapterRequest(_id: DebugSessionUUID, _command: string, _args: any): Promise<any> { return Promise.resolve(undefined); }
	$getDebugProtocolBreakpoint(_id: DebugSessionUUID, _breakpoinId: string): Promise<DebugProtocol.Breakpoint | undefined> { return Promise.resolve(undefined); }
	$appendDebugConsole(_value: string): void { }
	$registerBreakpoints(_breakpoints: Array<ISourceMultiBreakpointDto | IFunctionBreakpointDto | IDataBreakpointDto>): Promise<void> { return Promise.resolve(); }
	$unregisterBreakpoints(_breakpointIds: string[], _functionBreakpointIds: string[], _dataBreakpointIds: string[]): Promise<void> { return Promise.resolve(); }
	$registerDebugVisualizer(_extensionId: string, _id: string): void { }
	$unregisterDebugVisualizer(_extensionId: string, _id: string): void { }
	$registerDebugVisualizerTree(_treeId: string, _canEdit: boolean): void { }
	$unregisterDebugVisualizerTree(_treeId: string): void { }
}
