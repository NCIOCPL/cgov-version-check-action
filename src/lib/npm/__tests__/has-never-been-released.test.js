jest.mock('../util/get-package-version');
jest.mock('../../util/get-all-github-releases');
const getPackageVersion = require('../util/get-package-version');
const getAllGithubReleases = require('../../util/get-all-github-releases');
const hasNeverBeenReleased = require('../has-never-been-released');

describe('npm-has-never-been-released', () => {
	it('passes when version has never been released', async () => {
		// Setup the octokit, setup the context.
		const mockOctokit = {};
		const mockContext = {
			eventName: 'push',
			payload: require('../../../__tests__/mock-push-payload.json'),
			sha: '38f97e063d849701fd0bef158ebf4f3001edefd7',
			ref: '',
			workflow: '',
			action: '',
			actor: '',
			job: '',
			runNumber: -1,
			runId: -1,
		};

		// Mock the package.json version from the context SHA
		getPackageVersion.mockReturnValueOnce('1.2.2');

		// Mock the response to get all released versions
		getAllGithubReleases.mockReturnValueOnce([]);

		const actual = await hasNeverBeenReleased(mockOctokit, mockContext);

		expect(getPackageVersion).toHaveBeenCalledWith(
			mockOctokit,
			'userName',
			'package-release-test',
			'38f97e063d849701fd0bef158ebf4f3001edefd7'
		);

		expect(getAllGithubReleases).toHaveBeenCalledWith(
			mockOctokit,
			'userName',
			'package-release-test'
		);

		expect(actual).toBeTruthy();
	});

	it('fails when version has been released', async () => {
		// Setup the octokit, setup the context.
		const mockOctokit = {};
		const mockContext = {
			eventName: 'push',
			payload: require('../../../__tests__/mock-push-payload.json'),
			sha: '38f97e063d849701fd0bef158ebf4f3001edefd7',
			ref: '',
			workflow: '',
			action: '',
			actor: '',
			job: '',
			runNumber: -1,
			runId: -1,
		};

		// Mock the package.json version from the context SHA
		getPackageVersion.mockReturnValueOnce('1.2.2');

		// Mock the response to get all released versions
		getAllGithubReleases.mockReturnValueOnce(['v1.2.2']);

		const actual = await hasNeverBeenReleased(mockOctokit, mockContext);

		expect(getPackageVersion).toHaveBeenCalledWith(
			mockOctokit,
			'userName',
			'package-release-test',
			'38f97e063d849701fd0bef158ebf4f3001edefd7'
		);

		expect(getAllGithubReleases).toHaveBeenCalledWith(
			mockOctokit,
			'userName',
			'package-release-test'
		);

		expect(actual).not.toBeTruthy();
	});
	// TODO: Handle error from api
});
