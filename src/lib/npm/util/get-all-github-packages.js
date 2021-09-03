/**
 * Gets all the npm package names for a given repository.
 * @param {Octokit} octokit an octokit instance
 * @param {string} owner the owner of the repository
 * @param {string} repo the name of the repository
 */
const getAllGithubPackages = async (octokit, owner, repo) => {
	/**
	 * Helper function to continue fetching results until all
	 * items have been found.
	 *
	 * @param {string} startCursor the cursor return by a previous call, or null if first call
	 */
	const pagedFetch = async (startCursor) => {
		// A repo can be associated with multiple packages, and each package can have multiple
		// versions. Unfortunately paging is done for both the packages, and EACH packages'
		// versions. Since github only allows 100 items at most, we are just going to handle
		// this the longer, but simpler way. Gets all the packages here, and in
		// getAllGithubPackageVersions we can paginate the versions.

		// Paging these results might be tricky
		const cursorVarString = startCursor ? `, $startCursor: String!` : '';
		const afterString = startCursor ? `, after: $startCursor` : '';

		const query = `
			query repopackages($owner: String!, $repo: String!${cursorVarString}) {
				repository(name: $repo, owner: $owner) {
					packages(first: 100${afterString}) {
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
			}`;

		const { repository } = await octokit.graphql(query, {
			repo: repo,
			owner: owner,
			...(startCursor ? { startCursor } : {}),
		});

		// Extract out the releases
		const packagesList = repository.packages.nodes.map((node) => node.name);

		if (repository.packages.pageInfo.hasNextPage) {
			// Recursively call the next page of results
			return [
				...packagesList,
				...(await pagedFetch(repository.packages.pageInfo.startCursor)),
			];
		} else {
			// We are done here, so return the list
			return packagesList;
		}
	};

	try {
		const packages = await pagedFetch();
		return packages;
	} catch (error) {
		throw new Error(`Unable to fetch packages for ${owner}/${repo}`);
	}
};

module.exports = getAllGithubPackages;
