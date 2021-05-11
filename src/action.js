const github = require('@actions/github');
const core = require('@actions/core');
//const Webhooks = require('@octokit/webhooks');
const npmChecks = require('./lib/npm');

// The keys are the package-types we support.
// Those modules are a collection of checks that can be performed
const packageCheckers = {
	npm: npmChecks,
};

/**
 * Run the Action.
 */
async function run() {
	try {
		const packageType = core.getInput('package-type', { required: true });
		const checksToPerform = core.getInput('checks-to-perform', {
			required: true,
		});
		const githubToken = core.getInput('repo-token', { required: true });

		// Validate packageType
		if (!Object.keys(packageCheckers).includes(packageType)) {
			throw new Error(`Invalid package-type parameter: "${packageType}"`);
		}

		// Validate checksToPerform
		const requestedChecks = checksToPerform.split(',').map((s) => s.trim());
		const checkNames = Object.keys(packageCheckers[packageType]);
		const invalidChecks = requestedChecks.reduce((badChecks, check) => {
			if (!checkNames.includes(check)) {
				return [...badChecks, check];
			} else {
				return badChecks;
			}
		}, []);

		if (invalidChecks.length > 0) {
			throw new Error(
				`Invalid check(s) for type "${packageType}": "${invalidChecks.join(
					','
				)}"`
			);
		}

		// The @actions/github package provides us with a way of accessing
		// the current workflow ENV vars and objects. This way we do not
		// have to pass in all the information for our checks.

		// So I don't want to deal with pull_requests and their silly differences
		// from a push. It also would not make any sense for the PR to require
		// versions to keep being updated.
		if (github.context.eventName !== 'push') {
			throw new Error('This action can only handle push events at the moment.');
		}

		// @actions/github also provides a better way to setup the github
		// client within the workflow.
		const octokit = github.getOctokit(githubToken);

		const checkPromises = requestedChecks.map((checkName) =>
			packageCheckers[packageType][checkName](octokit, github.context)
		);

		const checkResults = await Promise.all(checkPromises);

		const failingChecks = checkResults.reduce((ac, res, idx) => {
			if (!res) {
				return ac.length === 0
					? requestedChecks[idx]
					: ac + ',' + requestedChecks[idx];
			} else {
				return ac;
			}
		}, '');

		if (failingChecks.length > 0) {
			throw new Error(`The following checks have failed: ${failingChecks}`);
		}
	} catch (error) {
		core.setFailed(error.message);
	}
}

module.exports = run;
