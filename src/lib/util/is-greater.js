const VERSION_TEST_REGEX = /\d+\.\d+\.\d+/;

/**
 * Helper function to determine if a version is greater
 * than another one. Assumes versions are in X.Y.Z format.
 * @param {string} oldVersion the version to test against
 * @param {string} newVersion the version we want to see is newer
 * @returns true if newVersion is greater than oldVersion, false if not.
 */
const isGreater = (oldVersion, newVersion) => {
	if (oldVersion === null || !VERSION_TEST_REGEX.test(oldVersion)) {
		throw new Error('Old version number is invalid.');
	}
	if (newVersion === null || !VERSION_TEST_REGEX.test(newVersion)) {
		throw new Error('New version number is invalid.');
	}

	const oldArr = oldVersion.split('.');
	const newArr = newVersion.split('.');

	do {
		const newPart = newArr.shift();
		const oldPart = oldArr.shift();

		if (newPart > oldPart) {
			return true;
		} else if (newPart < oldPart) {
			return false;
		}
	} while (newArr.length > 0);
};

module.exports = isGreater;
