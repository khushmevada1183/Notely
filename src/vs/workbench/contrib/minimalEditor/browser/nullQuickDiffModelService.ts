/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { URI } from '../../../../base/common/uri.js';
import { IReference } from '../../../../base/common/lifecycle.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IQuickDiffModelService, QuickDiffModel, QuickDiffModelOptions } from '../../scm/browser/quickDiffModel.js';

class NullQuickDiffModelService implements IQuickDiffModelService {
	declare _serviceBrand: undefined;

	createQuickDiffModelReference(_resource: URI, _options?: QuickDiffModelOptions): IReference<QuickDiffModel> | undefined {
		return undefined;
	}
}

registerSingleton(IQuickDiffModelService, NullQuickDiffModelService, InstantiationType.Delayed);
