const { Colors } = require("./Colors");

/**
 * Display a message in all available colors.
 * @param {string} message
 */
function DisplayAllColors(message) {
	for (const color of Object.keys(Colors)) {
		console.log(`${color} : ${Colors[color]}${message}${Colors.reset}`);
	}
}

module.exports = {
	DisplayAllColors,
};
