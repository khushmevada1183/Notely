import * as assert from 'assert';
import { toggleValue } from '../../src/editor-preferences';

suite('editor-preferences', () => {
	test('toggleValue flips on/off', () => {
		assert.strictEqual(toggleValue('off'), 'on');
		assert.strictEqual(toggleValue('on'), 'off');
	});
});
