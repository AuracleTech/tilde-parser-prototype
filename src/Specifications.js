/**
 * TokenType specifications
 */
class TokenType {
	/**
	 * Initialize the token type.
	 * @param {string} type - The type of the token.
	 * @param {string} kind - The kind of the token.
	 * @param {regex} regex - The regex to match the token.
	 * @param {lambda} format - Format the value of the token.
	 * @param {boolean} discard - Whether the token is discarded.
	 */
	constructor(type, kind, conf = {}) {
		this.type = type;
		this.kind = kind;
		this.regex = conf.regex;
		this.discard = !!conf.discard;
		this.format = conf.format || ((value) => value);
	}
}

// TODO: Literal
// string | boolean | null | number | RegExp | bigint | bigdecimal
const TokenTypes = [
	new TokenType("LineEnd", "LineEnd", { regex: /^\r\n/, discard: true }),
	new TokenType("Util", "Tab", { regex: /^\t/, discard: true }),

	new TokenType("WhiteSpace", "WhiteSpace", { regex: /^\s+/, discard: true }),

	new TokenType("Comment", "Block", { regex: /^\/[\s\S]*?\//, discard: true }),
	new TokenType("Comment", "Line", { regex: /^#.*/, discard: true }),

	new TokenType("Literal", "Number", {
		regex: /^\d+/,
		format: (value) => Number(value),
	}),
	new TokenType("Literal", "String", {
		regex: /^"[^"]*"/,
		format: (value) => value.slice(1, -1),
	}),
	new TokenType("Literal", "Char", {
		regex: /^'[^']*'/,
		format: (value) => value.slice(1, -1),
	}),
	new TokenType("Literal", "BoolFalse", {
		regex: /^false/,
		format: () => false,
	}),
	new TokenType("Literal", "BoolTrue", {
		regex: /^true/,
		format: () => true,
	}),

	new TokenType("Operator", "Add", { regex: /^\+/ }),
	new TokenType("Operator", "Sub", { regex: /^-/ }),
	new TokenType("Operator", "Multiply", { regex: /^\*/ }),
	new TokenType("Operator", "Divide", { regex: /^\// }),
	new TokenType("Operator", "Modulo", { regex: /^%/ }),
	new TokenType("Operator", "Power", { regex: /^\^/ }),
	new TokenType("Operator", "Equal", { regex: /^==/ }),
	new TokenType("Operator", "Greater", { regex: /^>/ }),
	new TokenType("Operator", "Less", { regex: /^</ }),
	new TokenType("Operator", "And", { regex: /^&/ }),
	new TokenType("Operator", "Or", { regex: /^\|/ }),
	new TokenType("Operator", "Not", { regex: /^!/ }),
	new TokenType("Operator", "Assign", { regex: /^=/ }),
	new TokenType("Operator", "AssignType", { regex: /^:/ }),
	new TokenType("Operator", "Dot", { regex: /^\./ }),
	new TokenType("Operator", "Comma", { regex: /^,/ }),

	new TokenType("PrimaryExpressions", "{", { regex: /^{/ }),
	new TokenType("PrimaryExpressions", "}", { regex: /^}/ }),

	new TokenType("PrimaryExpressions", "(", { regex: /^\(/ }),
	new TokenType("PrimaryExpressions", ")", { regex: /^\)/ }),

	new TokenType("Keyword", "If", { regex: /^\bif\b/ }),
	new TokenType("Keyword", "Else", { regex: /^else/ }),
	new TokenType("Keyword", "ShortIf", { regex: /^\?/ }),

	new TokenType("VarDeclarator", "Let", { regex: /^\blet\b/ }),
	new TokenType("VarDeclarator", "Const", { regex: /^\bconst\b/ }),

	new TokenType("Identifier", "Variable", {
		regex: /^[a-z_][a-z_]+/,
	}),
];

module.exports = {
	TokenTypes,
};
