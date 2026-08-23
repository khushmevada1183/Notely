/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { extHostNamedCustomer } from '../../../services/extensions/common/extHostCustomers.js';
import { MainContext, MainThreadEmbeddingsShape } from '../../../api/common/extHost.protocol.js';

@extHostNamedCustomer(MainContext.MainThreadEmbeddings)
export class NullMainThreadEmbeddings extends Disposable implements MainThreadEmbeddingsShape {

	$registerEmbeddingProvider(_handle: number, _identifier: string): void { }
	$unregisterEmbeddingProvider(_handle: number): void { }
	$computeEmbeddings(_embeddingsModel: string, _input: string[], _token: CancellationToken): Promise<{ values: number[] }[]> {
		return Promise.resolve([]);
	}
}
