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
			case "if":
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
					this.Statement.name,
					[`Unexpected token {}.`, `Line {}, column {}.`],
					[Colors.red, this._lookahead.kind],
					[Colors.white, this._lookahead.line],
					[Colors.white, this._lookahead.column]
				);
		}
	}

	/**
	 * IfStatement
	 *  : 'if' 'Expression' Statement 'else' Statement
	 */
	IfStatement() {
		this._eat("if", this.IfStatement.name);
		// TODO: check if the expression is a boolean
		// TODO: Do everything on this basically
	}

	/**
	 * BlockStatement
	 *   : '{' OptStatementList '}'
	 *   ;
	 */
	BlockStatement() {
		this._eat("{", this.BlockStatement.name);

		const body = this._lookahead.kind === "}" ? [] : this.StatementList("}");

		this._eat("}", this.BlockStatement.name);

		return {
			type: "BlockStatement",
			body,
		};
	}

	/**
	 * VariableStatement
	 *   : 'let' VariableDeclarationList ';'
	 *   ;
	 */
	VariableStatement(kind) {
		this._eat(kind, this.VariableStatement.name);
		const declarations = this.VariableDeclarationList();
		return {
			type: "VariableDeclaration",
			kind: kind,
			declarations,
		};
	}

	/**
	 * VariableDeclarationList
	 *   : VariableDeclaration
	 *   | VariableDeclarationList ',' VariableDeclaration
	 *   ;
	 */
	VariableDeclarationList() {
		const declarations = [];
		do {
			declarations.push(this.VariableDeclaration());
		} while (
			// TODO: Discard of that disgusting comma-separated list
			this._lookahead &&
			this._lookahead.kind === "Comma" &&
			this._eat("Comma", this.VariableDeclarationList.name)
		);
		return declarations;
	}

	/**
	 * VariableDeclaration
	 *  : Identifier OptVariableInitializer
	 *  ;
	 */
	VariableDeclaration() {
		const id = this.Identifier();

		// let test, meme = "yes" WILL RESULT IN test = "empty init" and meme = "yes"

		// OptVariableIdentifier
		const init =
			this._lookahead.kind === "Comma" ? null : this.VariableInitializer();
		return {
			type: "VariableDeclarator",
			id,
			init,
		};
	}

	/**
	 * VariableInitializer
	 *  : SIMPLE_ASSIGN AssignmentExpression
	 *  ;
	 */
	VariableInitializer() {
		this._eat("Assign", this.VariableInitializer.name);
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

		if (this._lookahead && this._isAssignmentOperator(this._lookahead.kind)) {
			return {
				type: "AssignmentExpression",
				operator: this.AssignmentOperator().value,
				left: this._checkValidAssignmentTarget(left),
				right: this.AssignmentExpression(),
			};
		}

		return left;
	}

	/**
	 * Whether the token is an assignment operator
	 */
	_isAssignmentOperator(tokenType) {
		return tokenType === "Assign";
	}

	/**
	 * AssignmentOperator
	 *   : SIMPLE_ASSIGN
	 *   | COMPLEX_ASSIGN
	 *   ;
	 */
	AssignmentOperator() {
		if (this._lookahead.kind === "Assign") {
			return this._eat("Assign", this.AssignmentOperator.name);
		}
	}

	/**
	 * AdditiveExpression
	 *   : MultiplicativeExpression
	 *   | AdditiveExpression ADDITIVE_OPERATOR Literal -> Literal ADDITIVE_OPERATOR Literal ADDITIVE_OPERATOR Literal
	 */
	AdditiveExpression() {
		return this._BinaryExpression("MultiplicativeExpression", "Add"); // TODO: Add [/^[+\-]/, 'ADDITIVE_OPERATOR'],
	}

	/**
	 * MultiplicativeExpression
	 *   : PrimaryExpression
	 *   | MultiplicativeExpression MULTIPLICATIVE_OPERATOR PrimaryExpression -> PrimaryExpression MULTIPLICATIVE_OPERATOR
	 */
	MultiplicativeExpression() {
		return this._BinaryExpression("PrimaryExpression", "Multiply"); // TODO: Add  [/^[*\/]/, 'MULTIPLICATIVE_OPERATOR'],
	}

	/**
	 * Identifier
	 *   : IDENTIFIER
	 *   ;
	 */
	Identifier() {
		const token = this._eat("Variable", this.Identifier.name);
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
			case "Literal":
				return this.Literal();
			case "(":
				return this.ParenthizedExpression(); // TODO: TEST ParenthizedExpression
			default:
				return this.LeftHandSideExpression();
		}
	}

	/**
	 * ParenthizedExpression
	 *   : '(' Expression ')'
	 *   ;
	 */
	ParenthizedExpression() {
		// TODO: Verify what this is supposed to do and if it's valid
		this._eat("(", this.ParenthizedExpression.name);
		const expression = this.Expression();
		this._eat(")", this.ParenthizedExpression.name);
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
				return this.NumericLiteral();
			case "String":
				return this.StringLiteral();
			default:
				throw new ParserError(
					this.Literal.name,
					[`Unexpected literal token {}.`],
					[Colors.red, this._lookahead.kind]
				);
		}
	}

	/**
	 * NumericLiteral
	 *   : NUMBER
	 *   ;
	 */
	NumericLiteral() {
		const token = this._eat("Number", this.NumericLiteral.name);
		return {
			type: "Literal",
			kind: "Number",
			value: token.value,
		};
	}

	/**
	 * StringLiteral
	 *   : STRING
	 *   ;
	 */
	StringLiteral() {
		const token = this._eat("String", this.StringLiteral.name);
		return {
			type: "Literal",
			kind: "String",
			value: token.value,
		};
	}

	/**
	 * Generic binary expression
	 */
	_BinaryExpression(builderName, operatorToken) {
		let left = this[builderName]();

		while (this._lookahead && this._lookahead.kind === operatorToken) {
			const operator = this._eat(
				operatorToken,
				this._BinaryExpression.name
			).value;
			const right = this[builderName]();

			left = {
				type: "BinaryExpression",
				operator,
				left,
				right,
			};
		}

		return left;
	}

	/**
	 * Extra check whether it's valid assignment target
	 */
	_checkValidAssignmentTarget(node) {
		if (node.kind === "Variable") {
			return node;
		}
		throw new ParserError(this._checkValidAssignmentTarget.name, [
			`Invalid left-hand side in assignment expression.`,
		]);
	}

	_eat(kind, caller) {
		const token = this._lookahead;

		// TODO: Remove this after transfer to TypeScript
		if (!caller) {
			throw new ParserError(
				this._eat.name,
				[`Missing caller name in {}`],
				[Colors.red, this._eat.name]
			);
		}

		if (!token) {
			throw new ParserError(
				this._eat.name,
				[`Unexpected {}, expected token kind {}.`, `Token ate by {} function.`],
				[Colors.red, "end of file"],
				[Colors.green, kind],
				[Colors.white, caller]
			);
		}

		if (token.kind !== kind) {
			throw new ParserError(
				this._eat.name,
				[
					`Unexpected token kind {}, expected {}.`,
					`Token line {} column {}.`,
					`Token ate by {} function.`,
				],
				[Colors.red, token.kind],
				[Colors.green, kind],
				[Colors.white, token.line],
				[Colors.white, token.column],
				[Colors.white, caller]
			);
		}

		this._lookahead = this._tokenizer.nextToken();

		// TODO: DEBUG ONLY
		if (!this._lookahead) {
			console.log(
				`End of file reached.
				Last token available eaten by '${caller}' function.`
			);
		}

		return token;
	}
}

process.on("uncaughtException", console.error);

module.exports = {
	Parser,
};
