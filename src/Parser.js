/**
 * Letter parser: reccursive descent implementation
 */

const { Tokenizer } = require("./Tokenizer");
const { ParserError } = require("./ParserError");
const { Colors } = require("./Colors");

/**
 * Initialize the parser.
 */
class Parser {
	constructor() {
		this._tokenizer = new Tokenizer();
	}

	/**
	 * Parses a string into AST
	 * @param {string} source The source code to parse into AST
	 */
	parse(string) {
		this._string = string;
		this._tokenizer.init(string);
		this._lookahead = this._tokenizer.nextToken();
		return this.Program();
	}

	/**
	 * Main entry point
	 */
	Program() {
		return {
			type: "Program",
			body: this.StatementList(),
		};
	}

	StatementList(stopLookAhead = null) {
		const Statements = [];

		while (this._lookahead && this._lookahead.kind !== stopLookAhead) {
			Statements.push(this.Statement());
		}

		return Statements;
	}

	/**
	 * Statement
	 *   : ExpressionStatement
	 *   | BlockStatement
	 *   | VariableStatement
	 *   ;
	 */
	/*
	Statements and declarations by category
	https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements
	
	###### Control flow
	break
	continue
	if...else
	switch
	throw
	try...catch
	###### Declarations
	var
	let
	const
	###### Function and class
	function
	async function
	return
	class
	###### Iteration
	do...while
	for...of
	for await...of
	while
	##### Others
	debugger
	export
	import
	*/
	Statement() {
		switch (this._lookahead.kind) {
			case "If":
				return this.IfStatement();
			case "{":
				return this.BlockStatement();
			case "Const":
			case "Let":
				return this.VariableStatement(this._lookahead.kind);
			case "Variable":
				return this.ExpressionStatement();
			default:
				throw new ParserError(
					[`Unexpected token {}.`, `Line {} column {}.`],
					[Colors.red, this._lookahead.kind],
					[Colors.white, this._lookahead.line],
					[Colors.white, this._lookahead.column]
				);
		}
	}

	/**
	 * IfStatement
	 *   : 'if' '(' Expression ')' Statement ('else' Statement)?
	 */
	IfStatement() {
		this._eat("If");
		const expression = this.ParenthizedExpression();
		const thenBranch = this.Statement();
		if (this._lookahead && this._lookahead.kind === "Else") {
			this._eat("Else");
			const elseBranch = this.Statement();
			return {
				type: "IfStatement",
				test: expression,
				consequent: thenBranch,
				alternate: elseBranch,
			};
		}
		return {
			type: "IfStatement",
			test: expression,
			consequent: thenBranch,
			alternate: null,
		};
	}

	/**
	 * BlockStatement
	 *  : '{' StatementList? '}'
	 * ;
	 */
	BlockStatement() {
		this._eat("{");
		const body = this._lookahead.kind === "}" ? [] : this.StatementList("}");
		this._eat("}");
		return {
			type: "BlockStatement",
			body,
		};
	}

	/**
	 * VariableStatement
	 *   : VarDeclarator VariableDeclarationList
	 * ;
	 */
	VariableStatement(kind) {
		this._eat(kind);
		const declarations = this.VariableDeclarationList();
		return {
			type: "VariableDeclaration",
			kind: kind,
			declarations,
		};
	}

	/**
	 * VariableDeclarationList
	 *   : VariableDeclaration (',' VariableDeclaration)*
	 *  ;
	 */
	VariableDeclarationList() {
		const declarations = [];
		do {
			declarations.push(this.VariableDeclaration());
		} while (
			this._lookahead &&
			this._lookahead.kind === "Comma" &&
			this._eat("Comma")
		);
		return declarations;
	}

	/**
	 * VariableDeclaration
	 *  : Identifier VariableInitializer
	 * ;
	 */
	VariableDeclaration() {
		const id = this.Identifier();
		// TODO: Remove uncertainty by disabling initializer and commas
		if (this._lookahead && this._lookahead.kind === "Assign") {
			const init = this.VariableInitializer();
			return {
				type: "VariableDeclarator",
				id,
				init,
			};
		} else if (this._lookahead && this._lookahead.kind === "Comma") {
			this._eat("Comma");
			return {
				type: "VariableDeclarator",
				id,
				init: null,
			};
		}

		return {
			type: "VariableDeclarator",
			id,
			init: null,
		};
	}

	/**
	 * VariableInitializer
	 *  : SIMPLE_ASSIGN AssignmentExpression
	 *  ;
	 */
	VariableInitializer() {
		this._eat("Assign");
		return this.AssignmentExpression();
	}

	/**
	 * ExpressionStatement
	 *   : Expression ';`
	 *   ;
	 */
	ExpressionStatement() {
		return {
			type: "ExpressionStatement",
			expression: this.Expression(),
		};
	}

	/**
	 * Expression
	 *   : Literal
	 *   ;
	 */
	/*
	https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators
	Expressions and operators
	###### Primary expressions
	this
	function
	class
	function
	async function
	await
	[]
	{}
	/ac+c/i (RegExp)
	()
	###### Left-hand side expressions
	new
	super
	...obj
	###### Increment and decrement
	a++
	a--
	++a
	--a
	###### Unary operators
	delete
	void
	typeof
	+
	-
	~
	!
	###### Arithmetic operators
	+
	-
	/
	*
	%
	###### Relational operators
	in
	instanceof
	<
	>
	###### Equality operators
	==
	!=
	===
	!==
	###### Bitwise operators
	<<
	>>
	>>>
	###### Binary bitwise operators
	&
	|
	^
	###### Binary logical operators
	&&
	||
	??
	###### Conditional operator
	(condition ? ifTrue : ifFalse)
	###### Assignment operators
	=
	*=
	**=
	/=
	%=
	+=
	-=
	<<=
	>>=
	>>>=
	&=
	^=
	|=
	&&+
	||=
	??=
	###### Comma operator
	,

	*/
	Expression() {
		return this.AssignmentExpression();
	}

	/**
	 * AssignmentExpression
	 *   : AdditiveExpression
	 *   | LeftHandSideExpression AssignmentOperator AssignmentExpression
	 *   ;
	 */
	AssignmentExpression() {
		const left = this.AdditiveExpression();

		if (this._lookahead && this._lookahead.kind == "Assign") {
			return {
				type: "AssignmentExpression",
				left: this._checkValidAssignmentTarget(left),
				right: this.AssignmentExpression(),
				operator: this._eat("Assign").value,
			};
		}

		return left;
	}

	/**
	 * AdditiveExpression
	 *   : MultiplicativeExpression
	 *   | AdditiveExpression ADDITIVE_OPERATOR Literal -> Literal ADDITIVE_OPERATOR Literal ADDITIVE_OPERATOR Literal
	 */
	AdditiveExpression() {
		return this._BinaryExpression(
			this.MultiplicativeExpression.name,
			"AdditiveOperator"
		);
	}

	/**
	 * MultiplicativeExpression
	 *   : PrimaryExpression
	 *   | MultiplicativeExpression MULTIPLICATIVE_OPERATOR PrimaryExpression -> PrimaryExpression MULTIPLICATIVE_OPERATOR
	 */
	MultiplicativeExpression() {
		return this._BinaryExpression(
			this.PrimaryExpression.name,
			"MultiplicativeOperator"
		);
	}

	/**
	 * Generic binary expression
	 * @param {string} builderName Name of the builder function
	 * @param {string} operatorTokens Token types for the operators
	 */
	_BinaryExpression(builderName, operatorToken) {
		let left = this[builderName]();

		while (this._lookahead && this._lookahead.type === operatorToken) {
			const operator = this._eat(this._lookahead.kind);

			left = {
				type: "BinaryExpression",
				left,
				right: this[builderName](),
				operator: operator.value,
			};
		}

		return left;
	}

	/**
	 * Identifier
	 *   : IDENTIFIER
	 *   ;
	 */
	Identifier() {
		const token = this._eat("Variable");
		return {
			type: token.type,
			kind: token.kind,
			name: token.value,
		};
	}

	/**
	 * LeftHandSideExpression
	 *   : Identifier
	 *   ;
	 */
	LeftHandSideExpression() {
		return this.Identifier();
	}

	/**
	 * PrimaryExpression
	 *   : Literal
	 *   | ParenthizedExpression
	 *   | LeftHandSideExpression
	 *   ;
	 */
	PrimaryExpression() {
		switch (this._lookahead.type) {
			case "ParenthizedExpression":
				return this.ParenthizedExpression();
			case "Literal":
				return this.Literal();
			case "Identifier": // TODO: Verify this
				return this.LeftHandSideExpression();
			default:
				throw new ParserError(
					[
						`Expected any valid primary expression`,
						`received unexpected token type {}`,
					],
					[Colors.red, this._lookahead.type]
				);
		}
	}

	/**
	 * ParenthizedExpression
	 *   : '(' Expression ')'
	 *   ;
	 */
	ParenthizedExpression() {
		this._eat("(");
		const expression = this.Expression();
		this._eat(")");
		return expression;
	}

	/**
	 * Literal
	 *   : NumericLiteral
	 *   | StringLiteral
	 *   ;
	 */
	Literal() {
		switch (this._lookahead.kind) {
			case "Number":
			case "String":
			case "BoolFalse":
			case "BoolTrue":
			case "Char":
				let token = this._eat(this._lookahead.kind);
				return {
					type: token.type,
					kind: token.kind,
					value: token.value,
				};
			default:
				throw new ParserError(
					[`Unexpected literal token {}.`],
					[Colors.red, this._lookahead.kind]
				);
		}
	}

	/**
	 * Extra check whether it's valid assignment target
	 * @param node The node to check
	 * @returns {boolean} Whether it's a valid assignment target
	 */
	_checkValidAssignmentTarget(node) {
		if (node.kind === "Variable") {
			return node;
		}
		throw new ParserError(
			[
				`Invalid left-hand side in assignment expression.`,
				`Was expecting node to be Variable kind {}.`,
				`Got {} instead.`,
				`Line {} column {}`,
			],
			[Colors.green, node.kind],
			[Colors.red, node.kind],
			[Colors.white, this._tokenizer.line],
			[Colors.white, this._tokenizer.column]
		);
	}

	/**
	 * Eat current token, and return it
	 * @param {String} kind - Expecting kind of token to be eaten
	 * @returns {Token}
	 */
	_eat(kind) {
		const token = this._lookahead;

		if (!token) {
			throw new ParserError(
				[`Unexpected {}, expected token kind {}.`],
				[Colors.red, "end of file"],
				[Colors.green, kind]
			);
		}

		if (token.kind !== kind) {
			throw new ParserError(
				[`Unexpected token kind {}, expected {}.`, `Token line {} column {}.`],
				[Colors.red, token.kind],
				[Colors.green, kind],
				[Colors.white, token.line],
				[Colors.white, token.column]
			);
		}

		this._lookahead = this._tokenizer.nextToken();

		return token;
	}
}

module.exports = {
	Parser,
};
