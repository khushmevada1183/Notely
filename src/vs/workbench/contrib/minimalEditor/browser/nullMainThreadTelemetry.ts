/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { Disposable } from '../../../../base/common/lifecycle.js';
import { ClassifiedEvent, IGDPRProperty, OmitMetadata, StrictPropertyCheck } from '../../../../platform/telemetry/common/gdprTypings.js';
import { TelemetryLevel } from '../../../../platform/telemetry/common/telemetry.js';
import { extHostNamedCustomer, IExtHostContext } from '../../../services/extensions/common/extHostCustomers.js';
import { ExtHostContext, ExtHostTelemetryShape, MainContext, MainThreadTelemetryShape } from '../../../api/common/extHost.protocol.js';

@extHostNamedCustomer(MainContext.MainThreadTelemetry)
export class NullMainThreadTelemetry extends Disposable implements MainThreadTelemetryShape {

	private readonly _proxy: ExtHostTelemetryShape;

	constructor(extHostContext: IExtHostContext) {
		super();
		this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostTelemetry);
		this._proxy.$initializeTelemetryLevel(TelemetryLevel.NONE, false);
	}

	$publicLog(_eventName: string, _data?: unknown): void { }
	$publicLog2<E extends ClassifiedEvent<OmitMetadata<T>> = never, T extends IGDPRProperty = never>(_eventName: string, _data?: StrictPropertyCheck<T, E>): void { }
}
