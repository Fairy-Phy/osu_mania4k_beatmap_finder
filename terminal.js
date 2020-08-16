const blessed = require('blessed');
const fs = require("fs").promises;

const screen = blessed.screen();
const foundmaptext = blessed.log({
	label: "Found 4K beatmapsetID List",
	width: "50%",
	height: "49.5%",
	border: { type: "line", fg: "#f0f0f0" }
});
const infotext = blessed.log({
	label: "Info",
	top: "49.5%",
	width: "50%",
	height: "50%",
	border: { type: "line", fg: "#f0f0f0" }
});
const errortext = blessed.log({
	label: "Error",
	left: "50%",
	width: "50%",
	height: "99%",
	border: { type: "line", fg: "#f0f0f0" },
});
const currentidtext = blessed.box({
	bottom: 0,
	height: 1,
	style: {
		fg: "#ffffff",
		bg: "#0000ff"
	}
});

screen.append(foundmaptext);
screen.append(infotext);
screen.append(errortext);
screen.append(currentidtext);

screen.title = "osu!mania 4k Beatmap Finder";

exports.screensetting = screen;

exports.currentid = text => {
	currentidtext.setContent(text);
	screen.render();
}

exports.found = text => {
	foundmaptext.log(text);
	screen.render();
}

exports.info = text => {
	infotext.log(text);
	screen.render();
}

exports.error = async text => {
	errortext.log(text);
	screen.render();
	await fs.appendFile("./errorlog.log", String(text) + "\n", { flag: "as" });
}
