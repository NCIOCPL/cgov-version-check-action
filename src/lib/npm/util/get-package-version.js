const requestCache = {};

/**
 * Gets the package version from a commit.
 *
 * Assumes package.json lives at the repo root.
 *
 * @param {Octokit} octokit an octokit instance to be used.
 * @param {string} commitSHA the commit hash for the commit you want the version of
 */
const getPackageVersion = async (octokit, owner, repo, commitSHA) => {
	try {
		const cachedRequest = requestCache[owner + repo + commitSHA];

		if (cachedRequest) {
			if (cachedRequest instanceof Error) {
				throw cachedRequest;
			} else {
				return cachedRequest;
			}
		}

		const res = await octokit.rest.repos.getContent({
			owner: owner,
			repo: repo,
			path: 'package.json',
			ref: commitSHA,
		});

		if (res.data.type !== 'file') {
			throw new Error('Did not get a file response back.');
		}

		const contentBuffer = Buffer.from(res.data.content, res.data.encoding);
		const packageJson = JSON.parse(contentBuffer.toString());

		requestCache[owner + repo + commitSHA] = packageJson.version;
		return requestCache[owner + repo + commitSHA];
	} catch (error) {
		requestCache[owner + repo + commitSHA] = error;
		throw new Error(`Could not get package.json for ${commitSHA}`);
	}
};

module.exports = getPackageVersion;
