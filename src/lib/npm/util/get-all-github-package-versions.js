/**
 * Gets all the versions of the npm packages for a given repository.
 * @param {Octokit} octokit an octokit instance
 * @param {string} owner the owner of the repository
 * @param {string} packageName the name of the specific package to look for.
 */
const getAllGithubPackageVersions = async (octokit, owner, packageName) => {
	/**
	 * Helper function to continue fetching results until all
	 * items have been found.
	 *
	 * @param {string} startCursor the cursor return by a previous call, or null if first call
	 */
	const pagedFetch = async (startCursor) => {
		// Paging these results might be tricky
		const cursorVarString = startCursor ? `, $startCursor: String!` : '';
		const afterString = startCursor ? `, after: $startCursor` : '';

		const query = `
		query orgpackageversions($owner: String!, $pgkName: String!${cursorVarString}) {
			organization(login: $owner) {
				packages(first: 1, names: $pkgName) {
					nodes {
						name
						versions(first: 100${afterString}) {
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
		`;

		const { organization } = await octokit.graphql(query, {
			owner: owner,
			pkgName: packageName,
			...(startCursor ? { startCursor } : {}),
		});

		// If the package name does not exist, or has never been published, then
		// there will be no versions.
		if (organization.packages.nodes.length === 0) {
			return [];
		}

		// Extract out the releases
		const versions = organization.packages.nodes[0].versions.nodes.map(
			(node) => node.version
		);

		if (organization.packages.nodes[0].versions.pageInfo.hasNextPage) {
			// Recursively call the next page of results
			return [
				...versions,
				...(await pagedFetch(
					organization.packages.nodes[0].versions.pageInfo.startCursor
				)),
			];
		} else {
			// We are done here, so return the list
			return versions;
		}
	};

	try {
		const versions = await pagedFetch();
		return versions;
	} catch (error) {
		throw new Error(`Unable to fetch versions for ${packageName} in ${owner}`);
	}
};

module.exports = getAllGithubPackageVersions;
