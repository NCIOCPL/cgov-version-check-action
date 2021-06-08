/**
 * Gets all the release tags for a given repository.
 * @param {Octokit} octokit an octokit instance
 * @param {string} owner the owner of the repository
 * @param {string} repo the name of the repository
 */
const getAllGithubReleases = async (octokit, owner, repo) => {
	/**
	 * Helper function to continue fetching results until all
	 * items have been found.
	 *
	 * @param {string} startCursor the cursor return by a previous call, or null if first call
	 */
	const pagedFetch = async (startCursor) => {
		// So the query for fetching a page of items looks just
		// like the query for the first page, except we need to
		// provide it with a curser for where to begin with.
		const cursorVarString = startCursor ? `, $startCursor: String!` : '';
		const afterString = startCursor ? `, after: $startCursor` : '';

		const query = `
		query reporeleases($owner: String!, $repo: String!${cursorVarString}) {
			repository(name: $repo, owner: $owner) {
				releases(first: 100${afterString}) {
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
		`;

		const { repository } = await octokit.graphql(query, {
			repo: repo,
			owner: owner,
			...(startCursor ? { startCursor } : {}),
		});

		// Extract out the releases
		const releases = repository.releases.nodes.map((node) => node.tag.name);

		if (repository.releases.pageInfo.hasNextPage) {
			// Recursively call the next page of results
			return [
				...releases,
				...(await pagedFetch(repository.releases.pageInfo.startCursor)),
			];
		} else {
			// We are done here, so return the list
			return releases;
		}
	};

	try {
		const releases = await pagedFetch();
		return releases;
	} catch (error) {
		throw new Error(`Unable to fetch releases for ${owner}/${repo}`);
	}
};

module.exports = getAllGithubReleases;
