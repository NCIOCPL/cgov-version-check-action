const hasNeverBeenPublished = require('../has-never-been-published');

describe('npm-has-never-been-published', () => {
	it('works', async () => {
		const actual = hasNeverBeenPublished();
		expect(actual).toBeTruthy();
	});
});
