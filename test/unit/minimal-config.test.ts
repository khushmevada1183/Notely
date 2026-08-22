import * as assert from 'assert';
import { getDefaultConfig } from '../../minimal-config.js';

suite('minimal-config', () => {
	test('getDefaultConfig returns vs-dark theme', () => {
		const cfg = getDefaultConfig();
		assert.strictEqual(cfg.theme, 'vs-dark');
		assert.strictEqual(cfg.wordWrap, 'off');
		assert.strictEqual(cfg.lineNumbers, 'on');
	});
});
