const getAllGithubPackageVersions = require('../get-all-github-package-versions');

describe('getAllGithubPackageVersions', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.resetModules();
	});

	it('returns the correct versions for a single page of results', async () => {
		const singlePageResponse = require('./npm-package-versions/single-page.json');
		const mockGraphQl = jest.fn().mockReturnValueOnce(singlePageResponse);
		const mockOctokit = {
			graphql: mockGraphQl,
		};

		// New commit
		const actual = await getAllGithubPackageVersions(
			mockOctokit,
			'nciocpl',
			'glossary-app'
		);

		expect(actual).toEqual([
			'1.2.2',
			'1.2.0',
			'1.1.0',
			'1.0.4',
			'1.0.3',
			'1.0.2',
			'1.0.1',
			'1.0.0',
			'0.1.0',
		]);
		expect(mockGraphQl.mock.calls).toHaveLength(1);
		expect(mockGraphQl.mock.calls[0][0]).toEqual(
			`
		query orgpackageversions($owner: String!, $pgkName: String!) {
			organization(login: $owner) {
				packages(first: 1, names: $pkgName) {
					nodes {
						name
						versions(first: 100) {
							nodes {
								version
							}
							totalCount
							pageInfo {
								hasNextPage
								startCursor
							}
						}
					}
				}
			}
		}
		`
		);
		expect(mockGraphQl.mock.calls[0][1]).toEqual({
			owner: 'nciocpl',
			pkgName: 'glossary-app',
		});
	});

	it('returns the correct versions for multiple pages of results', async () => {
		const multiPageResponse1 = require('./npm-package-versions/multipage-1.json');
		const multiPageResponse2 = require('./npm-package-versions/multipage-2.json');
		const multiPageResponse3 = require('./npm-package-versions/multipage-3.json');

		const mockGraphQl = jest
			.fn()
			.mockReturnValueOnce(multiPageResponse1)
			.mockReturnValueOnce(multiPageResponse2)
			.mockReturnValueOnce(multiPageResponse3);

		const mockOctokit = {
			graphql: mockGraphQl,
		};

		// New commit
		const actual = await getAllGithubPackageVersions(
			mockOctokit,
			'nciocpl',
			'glossary-app'
		);

		expect(actual).toEqual(['1.2.2', '1.2.0', '1.1.0']);
		expect(mockGraphQl.mock.calls).toHaveLength(3);
		expect(mockGraphQl.mock.calls[0][1]).toEqual({
			owner: 'nciocpl',
			pkgName: 'glossary-app',
		});

		// Let's test a paged request query since this is the first
		// test to use one.
		expect(mockGraphQl.mock.calls[1][0]).toEqual(
			`
		query orgpackageversions($owner: String!, $pgkName: String!, $startCursor: String!) {
			organization(login: $owner) {
				packages(first: 1, names: $pkgName) {
					nodes {
						name
						versions(first: 100, after: $startCursor) {
							nodes {
								version
							}
							totalCount
							pageInfo {
								hasNextPage
								startCursor
							}
						}
					}
				}
			}
		}
		`
		);
		expect(mockGraphQl.mock.calls[1][1]).toEqual({
			owner: 'nciocpl',
			pkgName: 'glossary-app',
			startCursor: 'Y3Vyc29yOnYyOpHOAHsblg==',
		});
		expect(mockGraphQl.mock.calls[2][1]).toEqual({
			owner: 'nciocpl',
			pkgName: 'glossary-app',
			startCursor: 'Y3Vyc29yOnYyOpHOAHenwA==',
		});
	});

	it('handles error', async () => {
		const mockGraphQl = jest.fn().mockImplementation(() => {
			throw new Error('Error');
		});
		const mockOctokit = {
			graphql: mockGraphQl,
		};

		// New commit
		await expect(
			getAllGithubPackageVersions(mockOctokit, 'nciocpl', 'glossary-app')
		).rejects.toThrow('Unable to fetch versions for glossary-app in nciocpl');

		expect(mockGraphQl.mock.calls).toHaveLength(1);
		expect(mockGraphQl.mock.calls[0][0]).toEqual(
			`
		query orgpackageversions($owner: String!, $pgkName: String!) {
			organization(login: $owner) {
				packages(first: 1, names: $pkgName) {
					nodes {
						name
						versions(first: 100) {
							nodes {
								version
							}
							totalCount
							pageInfo {
								hasNextPage
								startCursor
							}
						}
					}
				}
			}
		}
		`
		);
		expect(mockGraphQl.mock.calls[0][1]).toEqual({
			owner: 'nciocpl',
			pkgName: 'glossary-app',
		});
	});
});
