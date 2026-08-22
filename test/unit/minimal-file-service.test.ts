import * as assert from 'assert';
import { detectEOL } from '../../src/minimal-file-service';

suite('minimal-file-service', () => {
	test('detectEOL finds CRLF', () => {
		assert.strictEqual(detectEOL('a\r\nb'), '\r\n');
	});
	test('detectEOL defaults to LF', () => {
		assert.strictEqual(detectEOL('a\nb'), '\n');
	});
});
