/**
 * Token class used by the tokenizer
 */
class Token {
	/**
	 * Creates a new token.
	 * @param {string} type - The type of the token.
	 * @param {*} value - The value of the token.
	 * @param {*} raw - The raw value of the token.
	 * @param {string} kind - The kind of the token.
	 * @param {number} start - The start index of the token.
	 * @param {number} end - The end index of the token.
	 * @param {number} line - The line number of the token.
	 * @param {number} column - The column number of the token.
	 */
	constructor(type, value, raw, kind, start, end, line, column) {
		this.type = type;
		this.value = value;
		this.raw = raw;
		this.kind = kind;
		this.start = start;
		this.end = end;
		this.line = line;
		this.column = column;
	}
}

module.exports = {
	Token,
};
