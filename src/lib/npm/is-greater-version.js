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
	if (!context.payload.push.before) {
		throw new Error(`Cannot get context.payload.push.before`);
	}
	if (!context.sha) {
		throw new Error(`Cannot get current sha`);
	}

	const oldVersion = await getPackageVersion(
		octokit,
		context.payload.push.before
	);
	const newVersion = await getPackageVersion(octokit, context.sha);

	return isGreater(oldVersion, newVersion);
};

module.exports = isGreaterVersion;
