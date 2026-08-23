/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type * as vscode from 'vscode';
import { UriComponents } from '../../../../base/common/uri.js';
import { IAuthorizationTokenResponse } from '../../../../base/common/oauth.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { AuthenticationSession, AuthenticationSessionAccount, AuthenticationSessionsChangeEvent, IAuthenticationWwwAuthenticateRequest } from '../../../services/authentication/common/authentication.js';
import { extHostNamedCustomer } from '../../../services/extensions/common/extHostCustomers.js';
import { IRegisterAuthenticationProviderDetails, IRegisterDynamicAuthenticationProviderDetails, MainContext, MainThreadAuthenticationShape } from '../../../api/common/extHost.protocol.js';

@extHostNamedCustomer(MainContext.MainThreadAuthentication)
export class NullMainThreadAuthentication extends Disposable implements MainThreadAuthenticationShape {

	$registerAuthenticationProvider(_details: IRegisterAuthenticationProviderDetails): Promise<void> { return Promise.resolve(); }
	$unregisterAuthenticationProvider(_id: string): Promise<void> { return Promise.resolve(); }
	$ensureProvider(_id: string): Promise<void> { return Promise.resolve(); }
	$sendDidChangeSessions(_providerId: string, _event: AuthenticationSessionsChangeEvent): Promise<void> { return Promise.resolve(); }
	$getSession(_providerId: string, _scopeListOrRequest: ReadonlyArray<string> | IAuthenticationWwwAuthenticateRequest, _extensionId: string, _extensionName: string, _options: vscode.AuthenticationGetSessionOptions): Promise<AuthenticationSession | undefined> { return Promise.resolve(undefined); }
	$getAccounts(_providerId: string): Promise<ReadonlyArray<AuthenticationSessionAccount>> { return Promise.resolve([]); }
	$removeSession(_providerId: string, _sessionId: string): Promise<void> { return Promise.resolve(); }
	$waitForUriHandler(_expectedUri: UriComponents): Promise<UriComponents> { return Promise.resolve(_expectedUri); }
	$showContinueNotification(_message: string): Promise<boolean> { return Promise.resolve(false); }
	$showDeviceCodeModal(_userCode: string, _verificationUri: string): Promise<boolean> { return Promise.resolve(false); }
	$promptForClientRegistration(_authorizationServerUrl: string): Promise<{ clientId: string; clientSecret?: string } | undefined> { return Promise.resolve(undefined); }
	$promptForResourceClientSecret(_resourceClientId: string, _resource: string): Promise<string | undefined> { return Promise.resolve(undefined); }
	$registerDynamicAuthenticationProvider(_details: IRegisterDynamicAuthenticationProviderDetails): Promise<void> { return Promise.resolve(); }
	$setSessionsForDynamicAuthProvider(_authProviderId: string, _clientId: string, _sessions: (IAuthorizationTokenResponse & { created_at: number })[]): Promise<void> { return Promise.resolve(); }
	$sendDidChangeDynamicProviderInfo(_info: { providerId: string; clientId?: string; authorizationServer?: UriComponents; label?: string; clientSecret?: string }): Promise<void> { return Promise.resolve(); }
}
