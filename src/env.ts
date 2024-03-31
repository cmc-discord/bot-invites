import dotenv from 'dotenv';

function init() {
	dotenv.config();
}

function get(key: string): string {
	const value = process.env[key];
	if (!value) {
		throw new Error(`Missing environment variable: ${key}`);
	}
	return value;
}

function getOrDefault(key: string, defaultValue: string): string {
	const value = process.env[key];
	if (value === undefined) {
		return defaultValue;
	}

	return value;
}

export default {
	init,
	get,
	getOrDefault,
};
