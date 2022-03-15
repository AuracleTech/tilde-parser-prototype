/**
 * Extract streams of tokens from a source string
 */

const { Token } = require("./Token");
const { TokenTypes } = require("./Specifications");

class Tokenizer {
	/**
	 * Initialize the tokenizer.
	 * @param {string} buffer - The source string to tokenize.
	 */
	init(string) {
		this._string = string;
		this._cursor = 0;
		this._line = 1;
		this._column = 1;
	}

	/**
	 * Whether the cursor is at the end of File.
	 * @returns {boolean}
	 */
	isEOF() {
		return this._cursor >= this._string.length;
	}

	/**
	 * Whether there are more tokens in the source string.
	 * @returns {boolean}
	 */
	hasMoreTokens() {
		return this._cursor < this._string.length;
	}

	/**
	 * Obtain the next token from the source string.
	 * @returns {Token}
	 */
	nextToken() {
		if (!this.hasMoreTokens()) {
			return null;
		}

		const buffer = this._string.slice(this._cursor);

		for (const TokenType of TokenTypes) {
			const value = this._match(TokenType.regex, buffer);

			// If no token matched
			if (!value) {
				continue;
			}

			// Update line number and column number
			if (TokenType.kind === "LineEnd") {
				this._line += 1;
				this._column = 1;
			} else {
				this._column += value.length;
			}

			const token = new Token(
				TokenType.type,
				TokenType.format(value),
				value,
				TokenType.kind,
				this._cursor,
				this._cursor + value.length,
				this._line,
				this._column
			);

			// Update the cursor in source
			this._cursor += token.raw.length;

			// Skip discarded tokens
			if (TokenType.discard) {
				return this.nextToken();
			}

			return token;
		}

		throw new Error(`Unexpected token '${buffer[0]}'.`);
	}

	/**
	 * Match a token from the source string.
	 * @param {string} regex
	 * @param {string} buffer
	 * @returns
	 */
	_match(regex, buffer) {
		const matched = regex.exec(buffer);
		if (matched == null) {
			return null;
		}
		return matched[0];
	}
}

module.exports = {
	Tokenizer,
};
