/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/** Compile-time stubs — Notely excludes AI source trees from tsconfig. */

export type PromptsType = string;
export type HookTypeValue = string;

export type IChatAgentMetadata = Record<string, unknown>;
export type IChatAgentRequest = Record<string, unknown>;
export type IChatAgentResult = Record<string, unknown>;
export type UserSelectedTools = Record<string, unknown>;
export type ICodeMapperRequest = Record<string, unknown>;
export type ICodeMapperResult = Record<string, unknown>;
export type IChatContextItem = Record<string, unknown>;
export type IChatProgressHistoryResponseContent = Record<string, unknown>;
export type IChatRequestModeInstructions = Record<string, unknown>;
export type IChatRequestVariableData = Record<string, unknown>;
export type ChatResponseClearToPreviousToolInvocationReason = Record<string, unknown>;
export type IChatContentInlineReference = Record<string, unknown>;
export type IChatExternalEditsDto = Record<string, unknown>;
export type IChatFollowup = Record<string, unknown>;
export type IChatMultiDiffData = Record<string, unknown>;
export type IChatMultiDiffDataSerialized = Record<string, unknown>;
export type IChatNotebookEdit = Record<string, unknown>;
export type IChatProgress = Record<string, unknown>;
export type IChatTask = Record<string, unknown>;
export type IChatTaskDto = Record<string, unknown>;
export type IChatUserActionEvent = Record<string, unknown>;
export type IChatVoteAction = Record<string, unknown>;
export type IChatSessionItem = Record<string, unknown>;
export type IChatSessionProviderOptionGroup = Record<string, unknown>;
export type IChatSessionProviderOptionItem = Record<string, unknown>;
export type IChatRequestVariableValue = Record<string, unknown>;
export enum ChatAgentLocation { Panel = 1, Terminal = 2, Notebook = 3, Editor = 4 }
export type IChatMessage = Record<string, unknown>;
export type IChatResponsePart = Record<string, unknown>;
export type ILanguageModelChatInfoOptions = Record<string, unknown>;
export type ILanguageModelChatMetadataAndIdentifier = Record<string, unknown>;
export type ILanguageModelChatRequestOptions = Record<string, unknown>;
export type ILanguageModelChatSelector = Record<string, unknown>;
export type IPreparedToolInvocation = Record<string, unknown>;
export type IStreamedToolInvocation = Record<string, unknown>;
export type IToolInvocation = Record<string, unknown>;
export type IToolInvocationPreparationContext = Record<string, unknown>;
export type IToolInvocationStreamContext = Record<string, unknown>;
export type IToolProgressStep = Record<string, unknown>;
export type IToolResult = {
	content: Array<{ kind: string; value?: unknown; audience?: unknown; mimeType?: string; data?: { buffer: ArrayBufferLike } }>;
	toolMetadata?: unknown;
	toolResultError?: string | boolean;
	toolResultMessage?: unknown;
	toolResultDetails?: unknown;
};
export type IToolResultInputOutputDetails = Record<string, unknown>;
export type IToolResultOutputDetails = Record<string, unknown>;
export type IToolInvocationContext = Record<string, unknown>;
export enum ToolInvocationPresentation { Hidden = 0, HiddenAfterComplete = 1 }
export type ToolDataSource = { type: string; label?: string; extensionId?: { value: string }; serverLabel?: string; instructions?: string };
export type IPromptFileContext = Record<string, unknown>;
export type IPromptFileResource = Record<string, unknown>;
export type McpConnectionState = Record<string, unknown>;

export namespace McpServerLaunch {
	export type Serialized = unknown;
}

export namespace McpServerDefinition {
	export type Serialized = unknown;
}

export namespace McpCollectionDefinition {
	export type FromExtHost = unknown;
}

export type IKeywordRecognitionEvent = Record<string, unknown>;
export type ISpeechProviderMetadata = Record<string, unknown>;
export type ISpeechToTextEvent = Record<string, unknown>;
export type ITextToSpeechEvent = Record<string, unknown>;

export enum AiSettingsSearchResultKind { EMBEDDED = 0, LLM_RANKED = 1, CANCELED = 2 }
export type AiSettingsSearchResult = { query: string; kind: AiSettingsSearchResultKind; settings: unknown[] };
