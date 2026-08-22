import * as assert from 'assert';
import { getDefaultEditorOptions } from '../../src/monaco-config';

suite('monaco-config', () => {
	test('minimap disabled by default', () => {
		const opts = getDefaultEditorOptions();
		assert.deepStrictEqual(opts.minimap, { enabled: false });
	});
});
