/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import type { IConfigurationNode } from '../../../platform/configuration/common/configurationRegistry.js';
import { TerminalAccessibilityCommandId, defaultTerminalAccessibilityCommandsToSkipShell } from '../terminalContrib/accessibility/common/terminal.accessibility.js';
import { terminalAccessibilityConfiguration } from '../terminalContrib/accessibility/common/terminalAccessibilityConfiguration.js';
import { terminalAutoRepliesConfiguration } from '../terminalContrib/autoReplies/common/terminalAutoRepliesConfiguration.js';
import { terminalInitialHintConfiguration } from '../terminalContrib/inlineHint/common/terminalInitialHintConfiguration.js';
import { AgentSandboxSettingId } from '../../../platform/sandbox/common/settings.js';
import { terminalCommandGuideConfiguration } from '../terminalContrib/commandGuide/common/terminalCommandGuideConfiguration.js';
import { TerminalDeveloperCommandId } from '../terminalContrib/developer/common/terminal.developer.js';
import { defaultTerminalFindCommandToSkipShell } from '../terminalContrib/find/common/terminal.find.js';
import { defaultTerminalHistoryCommandsToSkipShell, terminalHistoryConfiguration } from '../terminalContrib/history/common/terminal.history.js';
import { terminalOscNotificationsConfiguration } from '../terminalContrib/notification/common/terminalNotificationConfiguration.js';
import { terminalResizeDimensionsOverlayConfiguration } from '../terminalContrib/resizeDimensionsOverlay/common/terminalResizeDimensionsOverlayConfiguration.js';
import { TerminalStickyScrollSettingId, terminalStickyScrollConfiguration } from '../terminalContrib/stickyScroll/common/terminalStickyScrollConfiguration.js';
import { defaultTerminalSuggestCommandsToSkipShell } from '../terminalContrib/suggest/common/terminal.suggest.js';
import { TerminalSuggestSettingId, terminalSuggestConfiguration } from '../terminalContrib/suggest/common/terminalSuggestConfiguration.js';
import { terminalTypeAheadConfiguration } from '../terminalContrib/typeAhead/common/terminalTypeAheadConfiguration.js';
import { terminalZoomConfiguration } from '../terminalContrib/zoom/common/terminal.zoom.js';

// Notely Tier 3: terminal chat contrib deleted — inline constants for layer-breaker exports.
const enum TerminalChatCommandId {
	OpenTerminalSettingsLink = 'workbench.action.terminal.chat.openTerminalSettingsLink',
	DisableSessionAutoApproval = 'workbench.action.terminal.chat.disableSessionAutoApproval',
	FocusMostRecentChatTerminalOutput = 'workbench.action.terminal.chat.focusMostRecentChatTerminalOutput',
	FocusMostRecentChatTerminal = 'workbench.action.terminal.chat.focusMostRecentChatTerminal',
	ToggleChatTerminalOutput = 'workbench.action.terminal.chat.toggleChatTerminalOutput',
	FocusChatInstanceAction = 'workbench.action.terminal.chat.focusChatInstance',
	ContinueInBackground = 'workbench.action.terminal.chat.continueInBackground',
}

const enum TerminalChatAgentToolsSettingId {
	AutoApprove = 'chat.tools.terminal.autoApprove',
	EnableAutoApprove = 'chat.tools.terminal.enableAutoApprove',
	ShellIntegrationTimeout = 'chat.tools.terminal.shellIntegrationTimeout',
	OutputLocation = 'chat.tools.terminal.outputLocation',
	AgentSandboxLinuxFileSystem = 'chat.agent.sandbox.fileSystem.linux',
	AgentSandboxMacFileSystem = 'chat.agent.sandbox.fileSystem.mac',
	AgentSandboxWindowsFileSystem = 'chat.agent.sandbox.fileSystem.windows',
}

const enum TerminalChatContextKeyStrings {
	ChatHasTerminals = 'hasChatTerminals',
	ChatHasHiddenTerminals = 'hasHiddenChatTerminals',
}

export const enum TerminalContribCommandId {
	A11yFocusAccessibleBuffer = TerminalAccessibilityCommandId.FocusAccessibleBuffer,
	DeveloperRestartPtyHost = TerminalDeveloperCommandId.RestartPtyHost,
	OpenTerminalSettingsLink = TerminalChatCommandId.OpenTerminalSettingsLink,
	DisableSessionAutoApproval = TerminalChatCommandId.DisableSessionAutoApproval,
	FocusMostRecentChatTerminalOutput = TerminalChatCommandId.FocusMostRecentChatTerminalOutput,
	FocusMostRecentChatTerminal = TerminalChatCommandId.FocusMostRecentChatTerminal,
	ToggleChatTerminalOutput = TerminalChatCommandId.ToggleChatTerminalOutput,
	FocusChatInstanceAction = TerminalChatCommandId.FocusChatInstanceAction,
	ContinueInBackground = TerminalChatCommandId.ContinueInBackground,
}

export const enum TerminalContribSettingId {
	StickyScrollEnabled = TerminalStickyScrollSettingId.Enabled,
	SuggestEnabled = TerminalSuggestSettingId.Enabled,
	AutoApprove = TerminalChatAgentToolsSettingId.AutoApprove,
	EnableAutoApprove = TerminalChatAgentToolsSettingId.EnableAutoApprove,
	ShellIntegrationTimeout = TerminalChatAgentToolsSettingId.ShellIntegrationTimeout,
	OutputLocation = TerminalChatAgentToolsSettingId.OutputLocation,
	AgentSandboxEnabled = AgentSandboxSettingId.AgentSandboxEnabled,
	AgentSandboxWindowsEnabled = AgentSandboxSettingId.AgentSandboxWindowsEnabled,
	AgentSandboxAllowNetwork = AgentSandboxSettingId.AgentSandboxAllowNetwork,
	AgentSandboxAllowUnsandboxedCommands = AgentSandboxSettingId.AgentSandboxAllowUnsandboxedCommands,
	AgentSandboxRetryWithAllowNetworkRequests = AgentSandboxSettingId.AgentSandboxRetryWithAllowNetworkRequests,
	AgentSandboxAllowAutoApprove = AgentSandboxSettingId.AgentSandboxAllowAutoApprove,
	AgentSandboxLinuxFileSystem = TerminalChatAgentToolsSettingId.AgentSandboxLinuxFileSystem,
	AgentSandboxMacFileSystem = TerminalChatAgentToolsSettingId.AgentSandboxMacFileSystem,
	AgentSandboxWindowsFileSystem = TerminalChatAgentToolsSettingId.AgentSandboxWindowsFileSystem,
}

export const enum TerminalContribContextKeyStrings {
	ChatHasTerminals = TerminalChatContextKeyStrings.ChatHasTerminals,
	ChatHasHiddenTerminals = TerminalChatContextKeyStrings.ChatHasHiddenTerminals,
}

export const terminalContribConfiguration: IConfigurationNode['properties'] = {
	...terminalAccessibilityConfiguration,
	...terminalAutoRepliesConfiguration,
	...terminalInitialHintConfiguration,
	...terminalCommandGuideConfiguration,
	...terminalHistoryConfiguration,
	...terminalOscNotificationsConfiguration,
	...terminalResizeDimensionsOverlayConfiguration,
	...terminalStickyScrollConfiguration,
	...terminalSuggestConfiguration,
	...terminalTypeAheadConfiguration,
	...terminalZoomConfiguration,
};

export const defaultTerminalContribCommandsToSkipShell = [
	...defaultTerminalAccessibilityCommandsToSkipShell,
	...defaultTerminalFindCommandToSkipShell,
	...defaultTerminalHistoryCommandsToSkipShell,
	...defaultTerminalSuggestCommandsToSkipShell,
];
