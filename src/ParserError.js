const { Colors } = require("./Colors");
const base = Colors.gray;
const titleFormat = Colors.blink + Colors.bgDarkRed + Colors.red;
const reset = Colors.reset;

/**
 * ParserError represents an error during parsing.
 * @param {string} origin - The origin of the error.
 * @param {string} message - The error message.
 * @param {...} args - Replaces any placeholders in the message.
 */
class ParserError extends Error {
	constructor(origin, messages, ...placeholders) {
		let index = 0;
		let message = messages.join("\n");
		message = message.replace(/\{\}/g, () => {
			let prefix = placeholders[index][0];
			let text = placeholders[index][1];
			++index;
			return `${prefix}${text}${reset}${base}`;
		});
		console.log(
			`${titleFormat}     Error thrown by ${origin}     ${reset}`,
			`\n${base}${message}${reset}`
		);
		super();
	}
}

module.exports = {
	ParserError,
};
