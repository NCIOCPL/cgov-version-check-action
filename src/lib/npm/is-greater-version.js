const isGreater = require('../util/is-greater');
const getPackageVersion = require('./util/get-package-version');

/**
 * This determines if a package version is newer than a previous one.
 *
 * Assumptions:
 *  * The package.json file lives at the root of the repo
 *  * The version number in the package .json will always be X.Y.Z
 *
 * @param {Octokit} octokit an octokit instance to be used.
 * @param {Context} context a github Context
 */
const isGreaterVersion = async (octokit, context) => {
	const repo = context.payload.repository.name;
	const owner = context.payload.repository.owner.name;

	const oldVersion = await getPackageVersion(
		octokit,
		owner,
		repo,
		context.payload.before
	);
	const newVersion = await getPackageVersion(octokit, owner, repo, context.sha);

	return isGreater(oldVersion, newVersion);
};

module.exports = isGreaterVersion;
