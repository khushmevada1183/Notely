/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IExtensionsWorkbenchService } from '../../extensions/common/extensions.js';
import { ExtensionsWorkbenchService } from '../../extensions/browser/extensionsWorkbenchService.js';

// MainThreadExtensionService needs this to wire up the extension host proxy.
registerSingleton(IExtensionsWorkbenchService, ExtensionsWorkbenchService, InstantiationType.Delayed);
