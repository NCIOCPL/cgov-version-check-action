const getPackageVersion = require('./util/get-package-version');
const getAllGithubReleases = require('../util/get-all-github-releases');

/**
 * This determines if a package version has ever had a github release.
 *
 * Assumptions:
 *  * The package.json file lives at the root of the repo
 *  * The version number in the package .json will always be X.Y.Z
 *  * Release tags are always vX.Y.Z
 *
 * @param {Octokit} octokit an octokit instance to be used.
 * @param {Context} context a github Context
 */
const hasNeverBeenReleased = async (octokit, context) => {
	// Get the commit's version
	const repo = context.payload.repository.name;
	const owner = context.payload.repository.owner.name;
	const newVersion = await getPackageVersion(octokit, owner, repo, context.sha);

	// Get all the releases?
	const releases = await getAllGithubReleases(octokit, owner, repo);

	return !releases.includes(`v${newVersion}`);
};

module.exports = hasNeverBeenReleased;
