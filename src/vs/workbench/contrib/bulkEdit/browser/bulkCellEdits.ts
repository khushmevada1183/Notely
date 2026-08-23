/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { CancellationToken } from '../../../../base/common/cancellation.js';
import { URI } from '../../../../base/common/uri.js';
import { ResourceEdit } from '../../../../editor/browser/services/bulkEditService.js';
import { WorkspaceEditMetadata } from '../../../../editor/common/languages.js';
import { IProgress } from '../../../../platform/progress/common/progress.js';
import { UndoRedoGroup, UndoRedoSource } from '../../../../platform/undoRedo/common/undoRedo.js';

/** Notely: notebook bulk edits removed — stub keeps bulkEditService compiling. */
export class ResourceNotebookCellEdit extends ResourceEdit {
	static is(_candidate: unknown): _candidate is ResourceNotebookCellEdit {
		return false;
	}

	static lift(edit: ResourceNotebookCellEdit): ResourceNotebookCellEdit {
		return edit;
	}

	constructor(
		readonly resource: URI,
		readonly cellEdit: unknown,
		readonly notebookVersionId: number | undefined = undefined,
		readonly metadata?: WorkspaceEditMetadata,
	) {
		super(metadata);
	}
}

export class BulkCellEdits {
	constructor(
		private readonly _edits: ResourceNotebookCellEdit[],
		private readonly _undoRedoGroup: UndoRedoGroup,
		private readonly _undoRedoSource: UndoRedoSource | undefined,
	) { }

	apply(_progress: IProgress<void>, _token: CancellationToken): Promise<void> {
		return Promise.resolve();
	}
}
