/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { IDefaultAccount, IDefaultAccountAuthenticationProvider } from '../../../base/common/defaultAccount.js';
import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IDefaultAccountProvider, IDefaultAccountService, ManagedSettingsFetchStatus } from './defaultAccount.js';

export class NullDefaultAccountService extends Disposable implements IDefaultAccountService {
	declare _serviceBrand: undefined;

	readonly onDidChangeDefaultAccount = Event.None;
	readonly onDidChangePolicyData = Event.None;
	readonly onDidChangeCopilotTokenInfo = Event.None;
	readonly policyData = null;
	readonly currentDefaultAccount = null;
	readonly copilotTokenInfo = null;
	readonly managedSettingsFetchStatus: ManagedSettingsFetchStatus = null;
	readonly managedSettingsFetchedAt = null;
	readonly managedSettingsRawResponse = null;

	async getDefaultAccount(): Promise<IDefaultAccount | null> {
		return null;
	}

	getDefaultAccountAuthenticationProvider(): IDefaultAccountAuthenticationProvider {
		return { id: '', name: '', enterprise: false };
	}

	setDefaultAccountProvider(_provider: IDefaultAccountProvider): void {
		// Notely: no Copilot default account provider
	}

	async refresh(): Promise<IDefaultAccount | null> {
		return null;
	}

	async signIn(): Promise<IDefaultAccount | null> {
		return null;
	}

	async signOut(): Promise<void> {
	}

	resolveGitHubUrl(path: string): string {
		return `https://github.com/${path}`;
	}
}
