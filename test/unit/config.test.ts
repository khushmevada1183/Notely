import * as assert from 'assert';
import { getDefaultConfig, normalizeWindowBounds } from '../../src/minimal-config';

suite('config', () => {
	test('defaults include tabSize 4', () => {
		assert.strictEqual(getDefaultConfig().tabSize, 4);
	});

	test('normalizeWindowBounds keeps on-screen bounds', () => {
		const bounds = { x: 100, y: 100, width: 800, height: 600 };
		const result = normalizeWindowBounds(bounds, { width: 1920, height: 1080 });
		assert.deepStrictEqual(result, bounds);
	});
});
