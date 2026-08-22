import * as assert from 'assert';
import { convertToMonacoTheme } from '../../src/theme-converter';

suite('theme-converter', () => {
	test('maps uiTheme to Monaco base', () => {
		const result = convertToMonacoTheme({
			id: 'test', label: 'Test', uiTheme: 'vs-dark',
			colors: {}, tokenColors: [],
		});
		assert.strictEqual(result.base, 'vs-dark');
		assert.strictEqual(result.inherit, true);
	});
});
