import * as assert from 'assert';
import { getCommandKey } from '../../src/minimal-menu';

suite('minimal-menu', () => {
	test('getCommandKey is Cmd on darwin', () => {
		const original = process.platform;
		Object.defineProperty(process, 'platform', { value: 'darwin' });
		assert.strictEqual(getCommandKey(), 'Cmd');
		Object.defineProperty(process, 'platform', { value: original });
	});
});
