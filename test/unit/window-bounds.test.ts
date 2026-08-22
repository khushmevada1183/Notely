import * as assert from 'assert';
import { normalizeWindowBounds } from '../../src/minimal-config';

suite('window-bounds', () => {
	test('off-screen bounds reset to defaults', () => {
		const result = normalizeWindowBounds({ x: -9999, y: -9999, width: 1200, height: 800 }, { width: 1920, height: 1080 });
		assert.ok(result.x >= 0);
		assert.ok(result.y >= 0);
	});
});
