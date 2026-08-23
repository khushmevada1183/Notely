/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { UriComponents } from '../../../../base/common/uri.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import * as search from '../../../services/search/common/search.js';
import { extHostNamedCustomer } from '../../../services/extensions/common/extHostCustomers.js';
import { AISearchKeyword, MainContext, MainThreadSearchShape } from '../../../api/common/extHost.protocol.js';

@extHostNamedCustomer(MainContext.MainThreadSearch)
export class NullMainThreadSearch extends Disposable implements MainThreadSearchShape {

	$registerFileSearchProvider(_handle: number, _scheme: string): void { }
	$registerAITextSearchProvider(_handle: number, _scheme: string): void { }
	$registerTextSearchProvider(_handle: number, _scheme: string): void { }
	$unregisterProvider(_handle: number): void { }
	$handleFileMatch(_handle: number, _session: number, _data: UriComponents[]): void { }
	$handleTextMatch(_handle: number, _session: number, _data: search.IRawFileMatch2[]): void { }
	$handleKeywordResult(_handle: number, _session: number, _data: AISearchKeyword): void { }
	$handleTelemetry(_eventName: string, _data: any): void { }
}
