module.exports = {
	env: {
		es6: true,
		node: true,
		jest: true,
	},
	parserOptions: {
		ecmaVersion: 2018,
	},
	extends: [
		'eslint:recommended',
		'plugin:import/errors',
		'plugin:import/warnings',
		'plugin:jest/recommended',
		'plugin:prettier/recommended',
	],
	rules: {
		'jest/consistent-test-it': ['error', { fn: 'it' }],
		'jest/no-if': 'error',
		'jest/no-test-return-statement': 'error',
		'jest/require-to-throw-message': 'error',
		'jest/require-top-level-describe': 'error',
	}
};
