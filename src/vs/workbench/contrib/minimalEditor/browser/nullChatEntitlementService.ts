/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IObservable, observableValue } from '../../../../base/common/observable.js';
import { InstantiationType, registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import product from '../../../../platform/product/common/product.js';
import { IChatEntitlementService, type ChatEntitlement, type IChatSentiment } from '../../../services/chat/common/chatEntitlementService.js';

const hiddenSentiment: IChatSentiment = Object.freeze({
	completed: true,
	hidden: true,
	disabled: true,
});

export class NullChatEntitlementService extends Disposable implements IChatEntitlementService {
	declare _serviceBrand: undefined;

	readonly onDidChangeEntitlement = Event.None;
	readonly onDidChangeQuotaExceeded = Event.None;
	readonly onDidChangeQuotaRemaining = Event.None;
	readonly onDidChangeUsageBasedBilling = Event.None;
	readonly onDidChangeSentiment = Event.None;
	readonly onDidChangeAnonymous = Event.None;

	readonly entitlement = 4 as ChatEntitlement; // Unavailable
	readonly entitlementObs: IObservable<ChatEntitlement>;
	readonly clientByokEnabled = false;
	readonly hasByokModels = false;
	readonly organisations = undefined;
	readonly isInternal = false;
	readonly sku = undefined;
	readonly copilotTrackingId = undefined;
	readonly quotas = Object.freeze({});
	readonly sentiment = hiddenSentiment;
	readonly sentimentObs: IObservable<IChatSentiment>;
	readonly anonymous = false;
	readonly anonymousObs: IObservable<boolean>;

	constructor() {
		super();
		this.entitlementObs = observableValue('notelyChatEntitlement', this.entitlement);
		this.sentimentObs = observableValue('notelyChatSentiment', this.sentiment);
		this.anonymousObs = observableValue('notelyChatAnonymous', false);
	}

	acceptQuotas(): void { }
	clearQuotas(): void { }
	markAnonymousRateLimited(): void { }
	markSetupCompleted(): void { }
	setForceHidden(_hidden: boolean): void { }
	async update(_token: CancellationToken): Promise<void> { }
}

if (!product.defaultChatAgent) {
	registerSingleton(IChatEntitlementService, NullChatEntitlementService, InstantiationType.Eager);
}
