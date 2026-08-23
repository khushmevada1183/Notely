/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { Emitter } from '../../../../base/common/event.js';
import { IAhpTerminalCommandSource, IChatTerminalOutputSource, IChatTerminalToolProgressPart, ITerminalChatService, ITerminalInstance } from './terminal.js';

/** Notely: terminal chat contrib removed — no-op stub. */
export class NullTerminalChatService extends Disposable implements ITerminalChatService {
	declare readonly _serviceBrand: undefined;

	private readonly _onDidRegisterTerminalInstanceWithToolSession = this._register(new Emitter<ITerminalInstance>());
	readonly onDidRegisterTerminalInstanceWithToolSession = this._onDidRegisterTerminalInstanceWithToolSession.event;

	private readonly _onDidRegisterOutputSource = this._register(new Emitter<string>());
	readonly onDidRegisterOutputSource = this._onDidRegisterOutputSource.event;

	private readonly _onDidContinueInBackground = this._register(new Emitter<string>());
	readonly onDidContinueInBackground = this._onDidContinueInBackground.event;

	registerTerminalInstanceWithToolSession(_terminalToolSessionId: string | undefined, _instance: ITerminalInstance): void { }
	getTerminalInstanceByToolSessionId(_terminalToolSessionId: string): Promise<ITerminalInstance | undefined> { return Promise.resolve(undefined); }
	registerTerminalInstanceWithExecutionId(_terminalExecutionId: string, _instance: ITerminalInstance): IDisposable { return Disposable.None; }
	getTerminalInstanceByExecutionId(_terminalExecutionId: string): ITerminalInstance | undefined { return undefined; }
	getToolSessionTerminalInstances(_hiddenOnly?: boolean): readonly ITerminalInstance[] { return []; }
	getToolSessionIdForInstance(_instance: ITerminalInstance): string | undefined { return undefined; }
	registerTerminalInstanceWithChatSession(_chatSessionResource: URI, _instance: ITerminalInstance): void { }
	getChatSessionResourceForInstance(_instance: ITerminalInstance): URI | undefined { return undefined; }
	isBackgroundTerminal(_terminalToolSessionId?: string): boolean { return false; }
	registerOutputSource(_terminalToolSessionId: string, _source: IChatTerminalOutputSource): IDisposable { return Disposable.None; }
	getOutputSource(_terminalToolSessionId: string | undefined): IChatTerminalOutputSource | undefined { return undefined; }
	registerProgressPart(_part: IChatTerminalToolProgressPart): IDisposable { return Disposable.None; }
	setFocusedProgressPart(_part: IChatTerminalToolProgressPart): void { }
	clearFocusedProgressPart(_part: IChatTerminalToolProgressPart): void { }
	getFocusedProgressPart(): IChatTerminalToolProgressPart | undefined { return undefined; }
	getMostRecentProgressPart(): IChatTerminalToolProgressPart | undefined { return undefined; }
	setChatSessionAutoApproval(_chatSessionResource: URI, _enabled: boolean): void { }
	hasChatSessionAutoApproval(_chatSessionResource: URI): boolean { return false; }
	addSessionAutoApproveRule(_chatSessionResource: URI, _key: string, _value: boolean | { approve: boolean; matchCommandLine?: boolean }): void { }
	getSessionAutoApproveRules(_chatSessionResource: URI): Readonly<Record<string, boolean | { approve: boolean; matchCommandLine?: boolean }>> { return {}; }
	getAutoApproveActions(_commandLine: string, _language: 'shellscript' | 'powershell'): Promise<undefined> { return Promise.resolve(undefined); }
	continueInBackground(_terminalToolSessionId: string): void { this._onDidContinueInBackground.fire(_terminalToolSessionId); }
	registerAhpCommandSource(_terminalToolSessionId: string, _source: IAhpTerminalCommandSource, _promisedTerminal: Promise<ITerminalInstance>): IDisposable { return Disposable.None; }
	getAhpCommandSource(_terminalToolSessionId: string): IAhpTerminalCommandSource | undefined { return undefined; }
}
