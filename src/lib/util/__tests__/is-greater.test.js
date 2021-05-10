const isGreater = require('../is-greater');

describe('isGreater', () => {
	it('throws error on invalid older', () => {
		expect(() => {
			isGreater('a.b.c');
		}).toThrow('Old version number is invalid.');
	});

	it('throws error on invalid newer', () => {
		expect(() => {
			isGreater('1.2.3', 'a.b.c');
		}).toThrow('New version number is invalid.');
	});

	it('returns true if greater major', () => {
		expect(isGreater('1.1.1', '2.0.0')).toBeTruthy();
	});

	it('returns true if greater minor', () => {
		expect(isGreater('1.1.1', '1.2.0')).toBeTruthy();
	});

	it('returns true if greater fix', () => {
		expect(isGreater('1.1.1', '1.1.2')).toBeTruthy();
	});

	it('returns false if lesser major', () => {
		expect(isGreater('5.5.5', '1.1.1')).toBeFalsy();
	});

	it('returns false if lesser minor', () => {
		expect(isGreater('1.5.5', '1.1.1')).toBeFalsy();
	});

	it('returns false if lesser fix', () => {
		expect(isGreater('1.1.5', '1.1.4')).toBeFalsy();
	});

	it('returns false if equal', () => {
		expect(isGreater('1.0.0', '1.0.0')).toBeFalsy();
	});
});
