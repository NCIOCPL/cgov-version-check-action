const { RequestError } = require('@octokit/request-error');

// API Responses
const newJsonResponse = require('./good_res.new.json');
const dirResponse = require('./dir-response.json');
const errorResponse = require('./404.json');

describe('getPackageVersion', () => {
	beforeEach(() => {
		jest.clearAllMocks();
		jest.resetModules();
	});

	it('returns the correct version when valid response', async () => {
		const getPackageVersion = require('../get-package-version');

		const mockGetContent = jest.fn().mockReturnValueOnce(newJsonResponse);
		const octokit = {
			rest: {
				repos: {
					getContent: mockGetContent,
				},
			},
		};

		// New commit
		const actual = await getPackageVersion(
			octokit,
			'nciocpl',
			'glossary-app',
			'38f97e063d849701fd0bef158ebf4f3001edefd7'
		);

		expect(actual).toEqual('1.2.2');
		expect(octokit.rest.repos.getContent).toHaveBeenCalledWith({
			owner: 'nciocpl',
			repo: 'glossary-app',
			path: 'package.json',
			ref: '38f97e063d849701fd0bef158ebf4f3001edefd7',
		});
	});

	it('handled cached response for a valid request', async () => {
		const getPackageVersion = require('../get-package-version');

		const mockGetContent = jest.fn().mockReturnValueOnce(newJsonResponse);
		const octokit = {
			rest: {
				repos: {
					getContent: mockGetContent,
				},
			},
		};

		// New commit
		await getPackageVersion(
			octokit,
			'nciocpl',
			'glossary-app',
			'38f97e063d849701fd0bef158ebf4f3001edefd7'
		);

		const actual = await getPackageVersion(
			octokit,
			'nciocpl',
			'glossary-app',
			'38f97e063d849701fd0bef158ebf4f3001edefd7'
		);

		expect(actual).toEqual('1.2.2');
		expect(octokit.rest.repos.getContent).toHaveBeenCalledWith({
			owner: 'nciocpl',
			repo: 'glossary-app',
			path: 'package.json',
			ref: '38f97e063d849701fd0bef158ebf4f3001edefd7',
		});
		expect(octokit.rest.repos.getContent.mock.calls.length).toBe(1);
	});

	it('throws on error when invalid response', async () => {
		const getPackageVersion = require('../get-package-version');

		const mockGetContent = jest.fn().mockReturnValueOnce(dirResponse);
		const octokit = {
			rest: {
				repos: {
					getContent: mockGetContent,
				},
			},
		};

		// Test that it throws on http error.
		await expect(
			getPackageVersion(
				octokit,
				'nciocpl',
				'glossary-app',
				'38f97e063d849701fd0bef158ebf4f3001edefd7'
			)
		).rejects.toThrow(
			`Could not get package.json for 38f97e063d849701fd0bef158ebf4f3001edefd7`
		);

		expect(octokit.rest.repos.getContent).toHaveBeenCalledWith({
			owner: 'nciocpl',
			repo: 'glossary-app',
			path: 'package.json',
			ref: '38f97e063d849701fd0bef158ebf4f3001edefd7',
		});
	});

	it('throws on error when invalid response when cached', async () => {
		const getPackageVersion = require('../get-package-version');

		const mockGetContent = jest.fn().mockReturnValueOnce(dirResponse);
		const octokit = {
			rest: {
				repos: {
					getContent: mockGetContent,
				},
			},
		};

		// Test that it throws on http error.
		await expect(
			getPackageVersion(
				octokit,
				'nciocpl',
				'glossary-app',
				'38f97e063d849701fd0bef158ebf4f3001edefd7'
			)
		).rejects.toThrow(
			`Could not get package.json for 38f97e063d849701fd0bef158ebf4f3001edefd7`
		);

		await expect(
			getPackageVersion(
				octokit,
				'nciocpl',
				'glossary-app',
				'38f97e063d849701fd0bef158ebf4f3001edefd7'
			)
		).rejects.toThrow(
			`Could not get package.json for 38f97e063d849701fd0bef158ebf4f3001edefd7`
		);

		expect(octokit.rest.repos.getContent).toHaveBeenCalledWith({
			owner: 'nciocpl',
			repo: 'glossary-app',
			path: 'package.json',
			ref: '38f97e063d849701fd0bef158ebf4f3001edefd7',
		});
		expect(octokit.rest.repos.getContent.mock.calls.length).toBe(1);
	});

	it('handles 404 error', async () => {
		const getPackageVersion = require('../get-package-version');

		const mockGetContent = jest.fn().mockImplementation(() => {
			throw new RequestError('', 404, {
				headers: errorResponse.headers,
				request: errorResponse.request,
			});
		});
		const octokit = {
			rest: {
				repos: {
					getContent: mockGetContent,
				},
			},
		};

		// Test that it throws on http error.
		await expect(
			getPackageVersion(
				octokit,
				'nciocpl',
				'glossary-app',
				'38f97e063d849701fd0bef158ebf4f3001edefd7'
			)
		).rejects.toThrow(
			`Could not get package.json for 38f97e063d849701fd0bef158ebf4f3001edefd7`
		);

		expect(octokit.rest.repos.getContent).toHaveBeenCalledWith({
			owner: 'nciocpl',
			repo: 'glossary-app',
			path: 'package.json',
			ref: '38f97e063d849701fd0bef158ebf4f3001edefd7',
		});
	});

	it('handles 404 error which error cached', async () => {
		const getPackageVersion = require('../get-package-version');

		const mockGetContent = jest.fn().mockImplementation(() => {
			throw new RequestError('', 404, {
				headers: errorResponse.headers,
				request: errorResponse.request,
			});
		});
		const octokit = {
			rest: {
				repos: {
					getContent: mockGetContent,
				},
			},
		};

		// Test that it throws on http error.
		await expect(
			getPackageVersion(
				octokit,
				'nciocpl',
				'glossary-app',
				'38f97e063d849701fd0bef158ebf4f3001edefd7'
			)
		).rejects.toThrow(
			`Could not get package.json for 38f97e063d849701fd0bef158ebf4f3001edefd7`
		);

		// Test that it throws on http error.
		await expect(
			getPackageVersion(
				octokit,
				'nciocpl',
				'glossary-app',
				'38f97e063d849701fd0bef158ebf4f3001edefd7'
			)
		).rejects.toThrow(
			`Could not get package.json for 38f97e063d849701fd0bef158ebf4f3001edefd7`
		);

		expect(octokit.rest.repos.getContent).toHaveBeenCalledWith({
			owner: 'nciocpl',
			repo: 'glossary-app',
			path: 'package.json',
			ref: '38f97e063d849701fd0bef158ebf4f3001edefd7',
		});
		expect(octokit.rest.repos.getContent.mock.calls.length).toBe(1);
	});
});
