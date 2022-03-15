const { Parser } = require("./src/Parser");
const parser = new Parser();

const fs = require("fs");
const code = fs.readFileSync("app.tilde", "utf8");

const ast = parser.parse(code);

console.log(JSON.stringify(ast, null, 2));
