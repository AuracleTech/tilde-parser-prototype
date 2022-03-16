/**
 * The color class.
 */
class Color {
	constructor(definition, zindex = 38) {
		this.fg = zindex;
		this.display = Array.isArray(definition)
			? `\x1b[${this.fg};2;${definition[0]};${definition[1]};${definition[2]}m`
			: (this.display = definition);
	}
}

const Colors = {
	red: new Color([255, 0, 45]).display,
	gray: new Color([134, 134, 138]).display,
	darkRed: new Color([120, 4, 16]).display,
	green: new Color([46, 204, 113]).display,
	yellow: new Color([212, 234, 25]).display,
	blue: new Color([26, 177, 204]).display,
	magenta: new Color([171, 34, 234]).display,
	cyan: new Color([41, 171, 204]).display,
	white: new Color([238, 238, 238]).display,
	black: new Color([61, 61, 61]).display,
	blink: new Color("\u001b[5;90m").display,
	reset: new Color("\u001b[0m").display,
	bold: new Color("\u001b[1m").display,
	bgRed: new Color([255, 0, 45], 48).display,
	bgDarkRed: new Color([120, 4, 16], 48).display,
};

module.exports = {
	Colors,
};
