const getAllGithubReleases = require('../get-all-github-releases');

describe('get-all-github-releases', () => {
	it('works with single page', async () => {
		const singleResultResponse = require('./release-mocks/glossary-request-single-page.json');
		const mockGraphQl = jest.fn().mockReturnValueOnce(singleResultResponse);
		const mockOctokit = {
			graphql: mockGraphQl,
		};

		const actual = await getAllGithubReleases(
			mockOctokit,
			'NCIOCPL',
			'glossary-app'
		);
		const expected = [
			'v1.0.0',
			'v1.0.1',
			'v1.0.2',
			'v1.0.3',
			'v1.0.4',
			'v1.1.0',
			'v1.2.0',
			'v1.2.2',
		];
		expect(actual).toEqual(expected);
		expect(mockGraphQl).toHaveBeenCalledWith(
			`
		query reporeleases($owner: String!, $repo: String!) {
			repository(name: $repo, owner: $owner) {
				releases(first: 100) {
					totalCount
					nodes {
						tag {
							name
							prefix
						}
					}
					pageInfo {
						hasNextPage
						startCursor
					}
				}
			}
		}
		`,
			{ owner: 'NCIOCPL', repo: 'glossary-app' }
		);
	});

	// works with multiple pages
	it('works with multiple pages', async () => {
		const multi1Response = require('./release-mocks/paged-response-1.json');
		const multi2Response = require('./release-mocks/paged-response-2.json');
		const multi3Response = require('./release-mocks/paged-response-3.json');
		const mockGraphQl = jest
			.fn()
			.mockReturnValueOnce(multi1Response)
			.mockReturnValueOnce(multi2Response)
			.mockReturnValueOnce(multi3Response);
		const mockOctokit = {
			graphql: mockGraphQl,
		};

		const actual = await getAllGithubReleases(
			mockOctokit,
			'NCIOCPL',
			'glossary-app'
		);
		const expected = ['v1.0.0', 'v1.0.1', 'v1.0.2'];
		expect(actual).toEqual(expected);
		expect(mockGraphQl.mock.calls).toHaveLength(3);
		expect(mockGraphQl.mock.calls[0][1]).toEqual({
			owner: 'NCIOCPL',
			repo: 'glossary-app',
		});

		// Let's test a paged request query since this is the first
		// test to use one.
		expect(mockGraphQl.mock.calls[1][0]).toEqual(
			`
		query reporeleases($owner: String!, $repo: String!, $startCursor: String!) {
			repository(name: $repo, owner: $owner) {
				releases(first: 100, after: $startCursor) {
					totalCount
					nodes {
						tag {
							name
							prefix
						}
					}
					pageInfo {
						hasNextPage
						startCursor
					}
				}
			}
		}
		`
		);
		expect(mockGraphQl.mock.calls[1][1]).toEqual({
			owner: 'NCIOCPL',
			repo: 'glossary-app',
			startCursor: 'Y3Vyc29yOnYyOpHOAamKGg==',
		});
		expect(mockGraphQl.mock.calls[2][1]).toEqual({
			owner: 'NCIOCPL',
			repo: 'glossary-app',
			startCursor: 'Y3Vyc29yOnYyOpHOAapAJw==',
		});
	});

	it('works with no results', async () => {
		const emptyResponse = require('./release-mocks/empty-releases.json');
		const mockGraphQl = jest.fn().mockReturnValueOnce(emptyResponse);
		const mockOctokit = {
			graphql: mockGraphQl,
		};

		const actual = await getAllGithubReleases(
			mockOctokit,
			'NCIOCPL',
			'glossary-app'
		);
		const expected = [];
		expect(actual).toEqual(expected);
		expect(mockGraphQl).toHaveBeenCalledWith(
			`
		query reporeleases($owner: String!, $repo: String!) {
			repository(name: $repo, owner: $owner) {
				releases(first: 100) {
					totalCount
					nodes {
						tag {
							name
							prefix
						}
					}
					pageInfo {
						hasNextPage
						startCursor
					}
				}
			}
		}
		`,
			{ owner: 'NCIOCPL', repo: 'glossary-app' }
		);
	});
});
