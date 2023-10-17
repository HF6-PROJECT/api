import { BaseError } from '../error';

describe('BaseError', () => {
	it('should be throwable', async () => {
		try {
			throw new BaseError('BaseError message blablabla');

			expect(true).toEqual(false);
		} catch (e) {
			expect(e).toBeInstanceOf(BaseError);
		}
	});
});
