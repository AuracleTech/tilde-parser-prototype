const Colors = {
	gray: [134, 134, 138],
	red: [255, 0, 45],
	darkRed: [120, 4, 16],
	green: [46, 204, 113],
	yellow: [212, 234, 25],
	blue: [26, 177, 204],
	magenta: [171, 34, 234],
	cyan: [41, 171, 204],
	white: [238, 238, 238],
	black: [61, 61, 61],
	blink: "\u001b[5;90m",
	reset: "\u001b[0m",
	bold: "\u001b[1m",
};

/**
 * Return a formattings string to display a color in the console.
 * @param {string} name - The name of the color.
 * @param {number} foreground (optional) - Defaut to 38 for foreground, 48 for background.
 * @returns {string} The formatting string.
 */
function get(color, foreground = 38) {
	if (!Array.isArray(color)) {
		return color;
	}
	let red = color[0];
	let green = color[1];
	let blue = color[2];
	return `\x1b[${foreground};2;${red};${green};${blue}m`;
}

/**
 * Display a message in all available colors.
 * @param {string} message
 */
function DisplayAllColors(message) {
	for (const color of Object.keys(Colors)) {
		console.log(`${color} : ${Colors[color]}${message}`);
	}
}

module.exports = {
	Colors,
	get,
	DisplayAllColors,
};
