const getAllGithubPackages = require('../get-all-github-packages');

describe('get-all-github-packages', () => {
	it('works with single page', async () => {
		const singleResultResponse = require('./npm-packages-mocks/single.json');
		const mockGraphQl = jest.fn().mockReturnValueOnce(singleResultResponse);
		const mockOctokit = {
			graphql: mockGraphQl,
		};

		const actual = await getAllGithubPackages(
			mockOctokit,
			'NCIOCPL',
			'glossary-app'
		);
		const expected = ['glossary-app'];
		expect(actual).toEqual(expected);
		expect(mockGraphQl).toHaveBeenCalledWith(
			`
			query repopackages($owner: String!, $repo: String!) {
				repository(name: $repo, owner: $owner) {
					packages(first: 100) {
						totalCount
						nodes {
							name
							id
							packageType
						}
						pageInfo {
							hasNextPage
							startCursor
						}
					}
				}
			}`,
			{ owner: 'NCIOCPL', repo: 'glossary-app' }
		);
	});

	// works with multiple pages
	it('works with multiple pages', async () => {
		const multi1Response = require('./npm-packages-mocks/multiple-packages-paged-1.json');
		const multi2Response = require('./npm-packages-mocks/multiple-packages-paged-2.json');
		const mockGraphQl = jest
			.fn()
			.mockReturnValueOnce(multi1Response)
			.mockReturnValueOnce(multi2Response);
		const mockOctokit = {
			graphql: mockGraphQl,
		};

		const actual = await getAllGithubPackages(mockOctokit, 'NCIOCPL', 'ncids');
		const expected = ['ncids-css', 'ncids-react'];
		expect(actual).toEqual(expected);
		expect(mockGraphQl.mock.calls).toHaveLength(2);
		expect(mockGraphQl.mock.calls[0][1]).toEqual({
			owner: 'NCIOCPL',
			repo: 'ncids',
		});

		// Let's test a paged request query since this is the first
		// test to use one.
		expect(mockGraphQl.mock.calls[1][0]).toEqual(
			`
			query repopackages($owner: String!, $repo: String!, $startCursor: String!) {
				repository(name: $repo, owner: $owner) {
					packages(first: 100, after: $startCursor) {
						totalCount
						nodes {
							name
							id
							packageType
						}
						pageInfo {
							hasNextPage
							startCursor
						}
					}
				}
			}`
		);
		expect(mockGraphQl.mock.calls[1][1]).toEqual({
			owner: 'NCIOCPL',
			repo: 'ncids',
			startCursor: 'MQ',
		});
	});

	it('works with no results', async () => {
		const emptyResponse = require('./npm-packages-mocks/empty.json');
		const mockGraphQl = jest.fn().mockReturnValueOnce(emptyResponse);
		const mockOctokit = {
			graphql: mockGraphQl,
		};

		const actual = await getAllGithubPackages(
			mockOctokit,
			'NCIOCPL',
			'cgov-digital-platform'
		);
		const expected = [];
		expect(actual).toEqual(expected);
		expect(mockGraphQl).toHaveBeenCalledWith(
			`
			query repopackages($owner: String!, $repo: String!) {
				repository(name: $repo, owner: $owner) {
					packages(first: 100) {
						totalCount
						nodes {
							name
							id
							packageType
						}
						pageInfo {
							hasNextPage
							startCursor
						}
					}
				}
			}`,
			{ owner: 'NCIOCPL', repo: 'cgov-digital-platform' }
		);
	});

	it('handles errors', async () => {
		const mockGraphQl = jest.fn().mockImplementation(() => {
			throw new Error('error');
		});
		const mockOctokit = {
			graphql: mockGraphQl,
		};

		await expect(
			getAllGithubPackages(mockOctokit, 'NCIOCPL', 'glossary-app')
		).rejects.toThrow('Unable to fetch packages for NCIOCPL/glossary-app');

		expect(mockGraphQl).toHaveBeenCalledWith(
			`
			query repopackages($owner: String!, $repo: String!) {
				repository(name: $repo, owner: $owner) {
					packages(first: 100) {
						totalCount
						nodes {
							name
							id
							packageType
						}
						pageInfo {
							hasNextPage
							startCursor
						}
					}
				}
			}`,
			{ owner: 'NCIOCPL', repo: 'glossary-app' }
		);
	});
});
