/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { SerializedError } from '../../../../base/common/errors.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { UriComponents } from '../../../../base/common/uri.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { SerializableObjectWithBuffers } from '../../../services/extensions/common/proxyIdentifier.js';
import { IChatMessage, IChatResponsePart, ILanguageModelChatSelector } from '../../../api/common/notely/aiProtocolStubs.js';
import { MainContext, MainThreadLanguageModelsShape } from '../../../api/common/extHost.protocol.js';
import { extHostNamedCustomer } from '../../../services/extensions/common/extHostCustomers.js';

@extHostNamedCustomer(MainContext.MainThreadLanguageModels)
export class NullMainThreadLanguageModels extends Disposable implements MainThreadLanguageModelsShape {

	$registerLanguageModelProvider(_vendor: string): void { }
	$onLMProviderChange(_vendor: string): void { }
	$unregisterProvider(_vendor: string): void { }
	$tryStartChatRequest(_extension: ExtensionIdentifier, _modelIdentifier: string, _requestId: number, _messages: SerializableObjectWithBuffers<IChatMessage[]>, _options: {}, _token: CancellationToken): Promise<void> { return Promise.resolve(); }
	$reportResponsePart(_requestId: number, _chunk: SerializableObjectWithBuffers<IChatResponsePart | IChatResponsePart[]>): Promise<void> { return Promise.resolve(); }
	$reportResponseDone(_requestId: number, _error: SerializedError | undefined): Promise<void> { return Promise.resolve(); }
	$selectChatModels(_selector: ILanguageModelChatSelector): Promise<string[]> { return Promise.resolve([]); }
	$countTokens(_modelId: string, _value: string | IChatMessage, _token: CancellationToken): Promise<number> { return Promise.resolve(0); }
	$cancelLanguageModelChatRequest(_requestId: number): void { }
	$fileIsIgnored(_uri: UriComponents, _token: CancellationToken): Promise<boolean> { return Promise.resolve(false); }
	$registerFileIgnoreProvider(_handle: number): void { }
	$unregisterFileIgnoreProvider(_handle: number): void { }
}
