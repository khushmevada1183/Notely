/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { localize, localize2 } from '../../../../nls.js';
import { Action2, MenuId, MenuRegistry, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { Categories } from '../../../../platform/action/common/actionCommonCategories.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IsMacNativeContext } from '../../../../platform/contextkey/common/contextkeys.js';
import { NEW_UNTITLED_FILE_COMMAND_ID, SAVE_FILE_AS_COMMAND_ID, SAVE_FILE_COMMAND_ID } from '../../files/browser/fileConstants.js';

// Notely uses dedicated submenu IDs so only the entries registered here appear.
const NotelyFileMenu = MenuId.for('NotelyMenubarFileMenu');
const NotelyEditMenu = MenuId.for('NotelyMenubarEditMenu');
const NotelyViewMenu = MenuId.for('NotelyMenubarViewMenu');

const TOGGLE_WORD_WRAP_ID = 'editor.action.toggleWordWrap';
const TOGGLE_LINE_NUMBERS_ID = 'editor.action.toggleLineNumbers';
const SELECT_THEME_ID = 'workbench.action.selectTheme';

class ToggleLineNumbersAction extends Action2 {

	constructor() {
		super({
			id: TOGGLE_LINE_NUMBERS_ID,
			title: {
				...localize2('toggleLineNumbers', 'Toggle Line Numbers'),
				mnemonicTitle: localize({ key: 'miToggleLineNumbers', comment: ['&& denotes a mnemonic'] }, "Toggle &&Line Numbers"),
			},
			category: Categories.View,
			f1: true,
			toggled: ContextKeyExpr.notEquals('config.editor.lineNumbers', 'off'),
		});
	}

	override run(accessor: ServicesAccessor): Promise<void> {
		const configurationService = accessor.get(IConfigurationService);
		const current = configurationService.getValue<'on' | 'off' | 'relative' | 'interval'>('editor.lineNumbers');
		const next = current === 'off' ? 'on' : 'off';
		return configurationService.updateValue('editor.lineNumbers', next);
	}
}

registerAction2(ToggleLineNumbersAction);

(function registerNotelyMenubar(): void {
	MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
		submenu: NotelyFileMenu,
		title: {
			value: 'File',
			original: 'File',
			mnemonicTitle: localize({ key: 'mFile', comment: ['&& denotes a mnemonic'] }, "&&File"),
		},
		order: 1
	});

	MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
		submenu: NotelyEditMenu,
		title: {
			value: 'Edit',
			original: 'Edit',
			mnemonicTitle: localize({ key: 'mEdit', comment: ['&& denotes a mnemonic'] }, "&&Edit"),
		},
		order: 2
	});

	MenuRegistry.appendMenuItem(MenuId.MenubarMainMenu, {
		submenu: NotelyViewMenu,
		title: {
			value: 'View',
			original: 'View',
			mnemonicTitle: localize({ key: 'mView', comment: ['&& denotes a mnemonic'] }, "&&View"),
		},
		order: 3
	});
})();

(function registerNotelyFileMenu(): void {
	MenuRegistry.appendMenuItem(NotelyFileMenu, {
		group: '1_new',
		command: {
			id: NEW_UNTITLED_FILE_COMMAND_ID,
			title: localize({ key: 'miNew', comment: ['&& denotes a mnemonic'] }, "&&New"),
		},
		order: 1
	});

	MenuRegistry.appendMenuItem(NotelyFileMenu, {
		group: '2_open',
		command: {
			id: 'workbench.action.files.openFile',
			title: localize({ key: 'miOpen', comment: ['&& denotes a mnemonic'] }, "&&Open..."),
		},
		order: 1
	});

	MenuRegistry.appendMenuItem(NotelyFileMenu, {
		group: '4_save',
		command: {
			id: SAVE_FILE_COMMAND_ID,
			title: localize({ key: 'miSave', comment: ['&& denotes a mnemonic'] }, "&&Save"),
		},
		order: 1
	});

	MenuRegistry.appendMenuItem(NotelyFileMenu, {
		group: '4_save',
		command: {
			id: SAVE_FILE_AS_COMMAND_ID,
			title: localize({ key: 'miSaveAs', comment: ['&& denotes a mnemonic'] }, "Save &&As..."),
		},
		order: 2
	});

	MenuRegistry.appendMenuItem(NotelyFileMenu, {
		group: 'z_Exit',
		command: {
			id: 'workbench.action.quit',
			title: localize({ key: 'miExit', comment: ['&& denotes a mnemonic'] }, "E&&xit"),
		},
		order: 1,
		when: IsMacNativeContext.toNegated()
	});
})();

(function registerNotelyEditMenu(): void {
	MenuRegistry.appendMenuItem(NotelyEditMenu, {
		group: '1_do',
		command: {
			id: 'undo',
			title: localize({ key: 'miUndo', comment: ['&& denotes a mnemonic'] }, "&&Undo"),
		},
		order: 1
	});

	MenuRegistry.appendMenuItem(NotelyEditMenu, {
		group: '1_do',
		command: {
			id: 'redo',
			title: localize({ key: 'miRedo', comment: ['&& denotes a mnemonic'] }, "&&Redo"),
		},
		order: 2
	});

	MenuRegistry.appendMenuItem(NotelyEditMenu, {
		group: '2_ccp',
		command: {
			id: 'editor.action.clipboardCutAction',
			title: localize({ key: 'miCut', comment: ['&& denotes a mnemonic'] }, "Cu&&t"),
		},
		order: 1
	});

	MenuRegistry.appendMenuItem(NotelyEditMenu, {
		group: '2_ccp',
		command: {
			id: 'editor.action.clipboardCopyAction',
			title: localize({ key: 'miCopy', comment: ['&& denotes a mnemonic'] }, "&&Copy"),
		},
		order: 2
	});

	MenuRegistry.appendMenuItem(NotelyEditMenu, {
		group: '2_ccp',
		command: {
			id: 'editor.action.clipboardPasteAction',
			title: localize({ key: 'miPaste', comment: ['&& denotes a mnemonic'] }, "&&Paste"),
		},
		order: 3
	});

	MenuRegistry.appendMenuItem(NotelyEditMenu, {
		group: '2_ccp',
		command: {
			id: 'editor.action.selectAll',
			title: localize({ key: 'miSelectAll', comment: ['&& denotes a mnemonic'] }, "Select &&All"),
		},
		order: 4
	});

	MenuRegistry.appendMenuItem(NotelyEditMenu, {
		group: '3_find',
		command: {
			id: 'actions.find',
			title: localize({ key: 'miFind', comment: ['&& denotes a mnemonic'] }, "&&Find"),
		},
		order: 1
	});

	MenuRegistry.appendMenuItem(NotelyEditMenu, {
		group: '3_find',
		command: {
			id: 'editor.action.startFindReplaceAction',
			title: localize({ key: 'miReplace', comment: ['&& denotes a mnemonic'] }, "&&Replace"),
		},
		order: 2
	});
})();

(function registerNotelyViewMenu(): void {
	MenuRegistry.appendMenuItem(NotelyViewMenu, {
		group: '6_editor',
		command: {
			id: TOGGLE_WORD_WRAP_ID,
			title: localize({ key: 'miToggleWordWrap', comment: ['&& denotes a mnemonic'] }, "&&Word Wrap"),
			toggled: ContextKeyExpr.has('editorWordWrap'),
		},
		order: 1
	});

	MenuRegistry.appendMenuItem(NotelyViewMenu, {
		group: '6_editor',
		command: {
			id: TOGGLE_LINE_NUMBERS_ID,
			title: localize({ key: 'miToggleLineNumbers', comment: ['&& denotes a mnemonic'] }, "Toggle &&Line Numbers"),
			toggled: ContextKeyExpr.notEquals('config.editor.lineNumbers', 'off'),
		},
		order: 2
	});

	MenuRegistry.appendMenuItem(NotelyViewMenu, {
		group: '7_themes',
		command: {
			id: SELECT_THEME_ID,
			title: localize({ key: 'miSelectTheme', comment: ['&& denotes a mnemonic'] }, "Select &&Theme..."),
		},
		order: 1
	});
})();
