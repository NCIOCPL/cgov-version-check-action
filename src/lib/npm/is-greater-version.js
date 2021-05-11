const isGreater = require('../util/is-greater');
const getPackageVersion = require('./util/get-package-version');
const core = require('@actions/core');

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
	core.debug(context.payload);
	const oldVersion = await getPackageVersion(octokit, context.payload.before);
	const newVersion = await getPackageVersion(octokit, context.sha);

	return isGreater(oldVersion, newVersion);
};

module.exports = isGreaterVersion;
