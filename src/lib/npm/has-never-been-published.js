/**
 * This determines if a package version has ever been published.
 *
 * Assumptions:
 *  * The package.json file lives at the root of the repo
 *  * The version number in the package .json will always be X.Y.Z
 *  * The package repository is GitHub
 *
 * @param {Octokit} octokit an octokit instance to be used.
 * @param {Context} context a github Context
 */
const hasNeverBeenPublished = async (octokit, context) => {
	return false && octokit && context;
};

module.exports = hasNeverBeenPublished;
