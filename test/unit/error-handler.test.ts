import * as assert from 'assert';
import { getFileErrorMessage } from '../../src/error-handler';

suite('error-handler', () => {
	test('ENOENT message', () => {
		const msg = getFileErrorMessage({ code: 'ENOENT', message: 'missing' } as NodeJS.ErrnoException, '/a/b.txt');
		assert.ok(msg.includes('not found'));
	});
});
