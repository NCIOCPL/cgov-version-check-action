jest.mock('@actions/core');

// This mocks up the npm module so that we can test the
// various sets of checks-to-perform are called correctly,
// when the inputs to the actions are set correctly.
//
// NOTE: None of the tests in this file test the checks in
// lib/npm.
const mockNpmChecks = {};
jest.mock('../lib/npm', () => mockNpmChecks);

const core = require('@actions/core');
const run = require('../action');

// This is a test to make sure we can export an empty npm module.
describe('main action code with no checks', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('Works with an empty NPM module', async () => {
		// Mock the core functions we will call.
		core.getInput = jest
			.fn()
			.mockReturnValueOnce('npm') // Mock type param
			.mockReturnValueOnce('') // This should never happen for checks
			.mockReturnValueOnce('12345'); // Mocks repo-token
		core.setFailed = jest.fn();
		core.info = jest.fn();

		await run();

		expect(core.setFailed).toHaveBeenCalledWith(
			`Invalid check(s) for type "npm": ""`
		);
	});
});
