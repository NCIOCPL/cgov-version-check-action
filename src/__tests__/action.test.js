jest.mock('@actions/core');
jest.mock('@actions/github');

// This mocks up the npm module so that we can test the
// various sets of checks-to-perform are called correctly,
// when the inputs to the actions are set correctly.
//
// NOTE: None of the tests in this file test the checks in
// lib/npm.
const mockNpmChecks = {
	passCheck: jest.fn().mockImplementation(() => true),
	failCheck: jest.fn().mockImplementation(() => false),
	anotherPassCheck: jest.fn().mockImplementation(() => true),
	anotherFailCheck: jest.fn().mockImplementation(() => false),
	exceptionCheck: jest.fn().mockImplementation(() => {
		throw new Error('Exception Thrown');
	}),
};
jest.mock('../lib/npm', () => mockNpmChecks);

const core = require('@actions/core');
const github = require('@actions/github');
const run = require('../action');

// Just a placeholder
describe('main action code', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	describe('error conditions', () => {
		it('Errors on invalid type', async () => {
			// Mock the core functions we will call.
			core.getInput = jest
				.fn()
				.mockReturnValueOnce('chicken') // Mock type param
				.mockReturnValueOnce('coup') // Mocks checks-to-perform
				.mockReturnValueOnce('12345'); // Mocks repo-token
			core.setFailed = jest.fn();
			core.info = jest.fn();

			await run();

			expect(core.setFailed).toHaveBeenCalledWith(
				`Invalid package-type parameter: "chicken"`
			);
		});

		it('Errors on invalid checks-to-perform', async () => {
			// Mock the core functions we will call.
			core.getInput = jest
				.fn()
				.mockReturnValueOnce('npm') // Mock type param
				.mockReturnValueOnce('coup') // Mocks checks-to-perform
				.mockReturnValueOnce('12345'); // Mocks repo-token
			core.setFailed = jest.fn();
			core.info = jest.fn();

			await run();

			expect(core.setFailed).toHaveBeenCalledWith(
				`Invalid check(s) for type "npm": "coup"`
			);
		});

		it('Errors on mixed checks-to-perform', async () => {
			// Mock the core functions we will call.
			core.getInput = jest
				.fn()
				.mockReturnValueOnce('npm') // Mock type param
				.mockReturnValueOnce('passCheck,coup,pluck,anotherPassCheck') // Mocks checks-to-perform
				.mockReturnValueOnce('12345'); // Mocks repo-token
			core.setFailed = jest.fn();
			core.info = jest.fn();

			await run();

			expect(core.setFailed).toHaveBeenCalledWith(
				`Invalid check(s) for type "npm": "coup,pluck"`
			);
		});

		it('Errors on invalid event', async () => {
			// Mock the core functions we will call.
			core.getInput = jest
				.fn()
				.mockReturnValueOnce('npm') // Mock type param
				.mockReturnValueOnce('passCheck') // Mocks checks-to-perform
				.mockReturnValueOnce('12345'); // Mocks repo-token
			core.setFailed = jest.fn();
			core.info = jest.fn();

			// Github is actually an object with a bunch of class instances and
			// functions hanging off.
			jest.mock('@actions/github', () => ({
				context: {
					eventName: 'pull_request',
				},
			}));

			await run();

			expect(core.setFailed).toHaveBeenCalledWith(
				`This action can only handle push events at the moment.`
			);
		});
	});

	describe('valid conditions', () => {
		// Space that is not allowed by the linter, however,
		// I keep copying the describe block. So adding space.
		it('calls checks, with one good check', async () => {
			// Mock the core functions we will call.
			core.getInput = jest
				.fn()
				.mockReturnValueOnce('npm') // Mock type param
				.mockReturnValueOnce('passCheck') // Mocks checks-to-perform
				.mockReturnValueOnce('12345'); // Mocks repo-token
			core.setFailed = jest.fn();
			core.info = jest.fn();

			// Github is actually an object with a bunch of class instances and
			// functions hanging off. For get Octokit we don't care what it is
			// returning cause we are not using it?
			github.getOctokit = jest.fn().mockReturnValueOnce('octokit');
			const mockContext = {
				eventName: 'push',
				payload: require('./mock-push-payload.json'),
				sha: '',
				ref: '',
				workflow: '',
				action: '',
				actor: '',
				job: '',
				runNumber: -1,
				runId: -1,
			};
			github.context = mockContext;

			await run();

			expect(core.setFailed).not.toHaveBeenCalled();
			expect(github.getOctokit).toHaveBeenCalledWith('12345');

			// Each check gets the same inputs, so we can loop and
			// make this a tiny bit easier to copy/paste.
			const calledTests = [mockNpmChecks.passCheck];
			const uncalledTests = [
				mockNpmChecks.anotherPassCheck,
				mockNpmChecks.failCheck,
				mockNpmChecks.anotherFailCheck,
				mockNpmChecks.exceptionCheck,
			];
			for (const test of calledTests) {
				expect(test).toHaveBeenCalledWith('octokit', mockContext);
			}
			for (const test of uncalledTests) {
				expect(test).not.toHaveBeenCalled();
			}
		});

		it('calls the checks, with multiple good check', async () => {
			// Mock the core functions we will call.
			core.getInput = jest
				.fn()
				.mockReturnValueOnce('npm') // Mock type param
				.mockReturnValueOnce('passCheck,anotherPassCheck') // Mocks checks-to-perform
				.mockReturnValueOnce('12345'); // Mocks repo-token
			core.setFailed = jest.fn();
			core.info = jest.fn();

			// Github is actually an object with a bunch of class instances and
			// functions hanging off.
			github.getOctokit = jest.fn().mockReturnValueOnce('octokit');
			const mockContext = {
				eventName: 'push',
				payload: require('./mock-push-payload.json'),
				sha: '',
				ref: '',
				workflow: '',
				action: '',
				actor: '',
				job: '',
				runNumber: -1,
				runId: -1,
			};
			github.context = mockContext;

			await run();

			expect(core.setFailed).not.toHaveBeenCalled();
			expect(github.getOctokit).toHaveBeenCalledWith('12345');
			const calledTests = [
				mockNpmChecks.passCheck,
				mockNpmChecks.anotherPassCheck,
			];
			const uncalledTests = [
				mockNpmChecks.failCheck,
				mockNpmChecks.anotherFailCheck,
				mockNpmChecks.exceptionCheck,
			];
			for (const test of calledTests) {
				expect(test).toHaveBeenCalledWith('octokit', mockContext);
			}
			for (const test of uncalledTests) {
				expect(test).not.toHaveBeenCalled();
			}
		});

		it('calls the checks, with one failing', async () => {
			// Mock the core functions we will call.
			core.getInput = jest
				.fn()
				.mockReturnValueOnce('npm') // Mock type param
				.mockReturnValueOnce('failCheck') // Mocks checks-to-perform
				.mockReturnValueOnce('12345'); // Mocks repo-token
			core.setFailed = jest.fn();
			core.info = jest.fn();

			// Github is actually an object with a bunch of class instances and
			// functions hanging off.
			github.getOctokit = jest.fn().mockReturnValueOnce('octokit');
			const mockContext = {
				eventName: 'push',
				payload: require('./mock-push-payload.json'),
				sha: '',
				ref: '',
				workflow: '',
				action: '',
				actor: '',
				job: '',
				runNumber: -1,
				runId: -1,
			};
			github.context = mockContext;

			await run();

			expect(github.getOctokit).toHaveBeenCalledWith('12345');
			// Each check gets the same inputs, so we can loop and
			// make this a tiny bit easier to copy/paste.
			const calledTests = [mockNpmChecks.failCheck];
			const uncalledTests = [
				mockNpmChecks.passCheck,
				mockNpmChecks.anotherPassCheck,
				mockNpmChecks.anotherFailCheck,
				mockNpmChecks.exceptionCheck,
			];
			for (const test of calledTests) {
				expect(test).toHaveBeenCalledWith('octokit', mockContext);
			}
			for (const test of uncalledTests) {
				expect(test).not.toHaveBeenCalled();
			}
			expect(core.setFailed).toHaveBeenCalledWith(
				'The following checks have failed: failCheck'
			);
		});

		it('calls all the checks, with multiple failing and some passing', async () => {
			// Mock the core functions we will call.
			core.getInput = jest
				.fn()
				.mockReturnValueOnce('npm') // Mock type param
				.mockReturnValueOnce(
					'passCheck, failCheck, anotherPassCheck, anotherFailCheck'
				) // Mocks checks-to-perform
				.mockReturnValueOnce('12345'); // Mocks repo-token
			core.setFailed = jest.fn();
			core.info = jest.fn();

			// Github is actually an object with a bunch of class instances and
			// functions hanging off.
			github.getOctokit = jest.fn().mockReturnValueOnce('octokit');
			const mockContext = {
				eventName: 'push',
				payload: require('./mock-push-payload.json'),
				sha: '',
				ref: '',
				workflow: '',
				action: '',
				actor: '',
				job: '',
				runNumber: -1,
				runId: -1,
			};
			github.context = mockContext;

			await run();

			expect(github.getOctokit).toHaveBeenCalledWith('12345');
			// Each check gets the same inputs, so we can loop and
			// make this a tiny bit easier to copy/paste.
			const calledTests = [
				mockNpmChecks.failCheck,
				mockNpmChecks.passCheck,
				mockNpmChecks.anotherPassCheck,
				mockNpmChecks.anotherFailCheck,
			];
			const uncalledTests = [mockNpmChecks.exceptionCheck];
			for (const test of calledTests) {
				expect(test).toHaveBeenCalledWith('octokit', mockContext);
			}
			for (const test of uncalledTests) {
				expect(test).not.toHaveBeenCalled();
			}
			expect(core.setFailed).toHaveBeenCalledWith(
				'The following checks have failed: failCheck,anotherFailCheck'
			);
		});

		it('calls the checks, handling an exception from a check', async () => {
			// Mock the core functions we will call.
			core.getInput = jest
				.fn()
				.mockReturnValueOnce('npm') // Mock type param
				.mockReturnValueOnce('exceptionCheck') // Mocks checks-to-perform
				.mockReturnValueOnce('12345'); // Mocks repo-token
			core.setFailed = jest.fn();
			core.info = jest.fn();

			// Github is actually an object with a bunch of class instances and
			// functions hanging off. For get Octokit we don't care what it is
			// returning cause we are not using it?
			github.getOctokit = jest.fn().mockReturnValueOnce('octokit');
			const mockContext = {
				eventName: 'push',
				payload: require('./mock-push-payload.json'),
				sha: '',
				ref: '',
				workflow: '',
				action: '',
				actor: '',
				job: '',
				runNumber: -1,
				runId: -1,
			};
			github.context = mockContext;

			await run();

			expect(github.getOctokit).toHaveBeenCalledWith('12345');

			// Each check gets the same inputs, so we can loop and
			// make this a tiny bit easier to copy/paste.
			const calledTests = [mockNpmChecks.exceptionCheck];
			const uncalledTests = [
				mockNpmChecks.passCheck,
				mockNpmChecks.anotherPassCheck,
				mockNpmChecks.failCheck,
				mockNpmChecks.anotherFailCheck,
			];
			for (const test of calledTests) {
				expect(test).toHaveBeenCalledWith('octokit', mockContext);
			}
			for (const test of uncalledTests) {
				expect(test).not.toHaveBeenCalled();
			}
			expect(core.setFailed).toHaveBeenCalledWith('Exception Thrown');
		});
	});
});
