jest.mock('../util/get-package-version');
const isGreaterVersion = require('../is-greater-version');

const getPackageVersion = require('../util/get-package-version');

describe('npm-is-greater-version', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('handles greater', async () => {
		// The first call will be for old, the second will be for new.
		getPackageVersion.mockReturnValueOnce('1.2.2').mockReturnValueOnce('1.2.3');

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

		const actual = await isGreaterVersion(mockOctokit, mockContext);
		expect(actual).toBeTruthy();
		expect(getPackageVersion.mock.calls.length).toBe(2);

		// Call 1.
		expect(getPackageVersion.mock.calls[0][1]).toBe('userName');
		expect(getPackageVersion.mock.calls[0][2]).toBe('package-release-test');
		expect(getPackageVersion.mock.calls[0][3]).toBe(
			'e311b74c1e615ccef73cfe8d708c40b7480ce549'
		);
		// Call 2.
		expect(getPackageVersion.mock.calls[1][1]).toBe('userName');
		expect(getPackageVersion.mock.calls[1][2]).toBe('package-release-test');
		expect(getPackageVersion.mock.calls[1][3]).toBe(
			'38f97e063d849701fd0bef158ebf4f3001edefd7'
		);
	});

	it('handles less than', async () => {
		// The first call will be for old, the second will be for new.
		getPackageVersion.mockReturnValueOnce('2.2.2').mockReturnValueOnce('1.2.3');

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

		const actual = await isGreaterVersion(mockOctokit, mockContext);
		expect(actual).not.toBeTruthy();
		expect(getPackageVersion.mock.calls.length).toBe(2);
		// Call 1.
		expect(getPackageVersion.mock.calls[0][1]).toBe('userName');
		expect(getPackageVersion.mock.calls[0][2]).toBe('package-release-test');
		expect(getPackageVersion.mock.calls[0][3]).toBe(
			'e311b74c1e615ccef73cfe8d708c40b7480ce549'
		);
		// Call 2.
		expect(getPackageVersion.mock.calls[1][1]).toBe('userName');
		expect(getPackageVersion.mock.calls[1][2]).toBe('package-release-test');
		expect(getPackageVersion.mock.calls[1][3]).toBe(
			'38f97e063d849701fd0bef158ebf4f3001edefd7'
		);
	});

	it('handles equals', async () => {
		// The first call will be for old, the second will be for new.
		getPackageVersion.mockReturnValueOnce('2.2.2').mockReturnValueOnce('2.2.2');

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

		const actual = await isGreaterVersion(mockOctokit, mockContext);
		expect(actual).not.toBeTruthy();
		expect(getPackageVersion.mock.calls.length).toBe(2);
		// Call 1.
		expect(getPackageVersion.mock.calls[0][1]).toBe('userName');
		expect(getPackageVersion.mock.calls[0][2]).toBe('package-release-test');
		expect(getPackageVersion.mock.calls[0][3]).toBe(
			'e311b74c1e615ccef73cfe8d708c40b7480ce549'
		);
		// Call 2.
		expect(getPackageVersion.mock.calls[1][1]).toBe('userName');
		expect(getPackageVersion.mock.calls[1][2]).toBe('package-release-test');
		expect(getPackageVersion.mock.calls[1][3]).toBe(
			'38f97e063d849701fd0bef158ebf4f3001edefd7'
		);
	});

	it('handles exception', async () => {
		// The first call will be for old, the second will be for new.
		getPackageVersion.mockImplementation(() => {
			throw new Error('Error Occurred');
		});

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

		await expect(
			isGreaterVersion(mockOctokit, mockContext)
		).rejects.toThrowError('Error Occurred');

		// Note: only one call will happen before it throws.
		expect(getPackageVersion.mock.calls.length).toBe(1);
		expect(getPackageVersion.mock.calls[0][1]).toBe('userName');
		expect(getPackageVersion.mock.calls[0][2]).toBe('package-release-test');
		expect(getPackageVersion.mock.calls[0][3]).toBe(
			'e311b74c1e615ccef73cfe8d708c40b7480ce549'
		);
	});
});
