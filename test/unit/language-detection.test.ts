import * as assert from 'assert';
import { detectLanguage } from '../../src/language-detection';

suite('language-detection', () => {
	const cases: Record<string, string> = {
		'app.js': 'javascript', 'app.ts': 'typescript', 'app.py': 'python',
		'readme.md': 'markdown', 'data.json': 'json', 'unknown.xyz': 'plaintext',
	};
	for (const [file, lang] of Object.entries(cases)) {
		test(`detects ${file} as ${lang}`, () => assert.strictEqual(detectLanguage(file), lang));
	}
});
