'use strict';

module.exports = {
	dialog: {
		showMessageBox: async () => ({ response: 0 }),
		showOpenDialog: async () => ({ canceled: true, filePaths: [] }),
		showSaveDialog: async () => ({ canceled: true, filePath: undefined }),
	},
	app: { name: 'Minimal Editor' },
	Menu: { buildFromTemplate: () => ({}), setApplicationMenu: () => undefined },
};
