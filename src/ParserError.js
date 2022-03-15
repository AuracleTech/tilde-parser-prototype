const { Colors, get } = require("./Colors");
const baseColor = Colors.gray;
const titleFormat =
	get(Colors.blink) + get(Colors.darkRed, 48) + get(Colors.red);
const reset = get(Colors.reset);

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
			return `${get(prefix)}${text}${reset}${get(baseColor)}`;
		});
		console.log(
			`${titleFormat}Error thrown by ${origin}${reset}`,
			`${get(baseColor)}\n${message}${reset}`
		);
		super();
	}
}

module.exports = {
	ParserError,
};
