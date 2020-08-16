const terminal = require("./terminal");
const request = require("request-promise");
const fs = require("fs").promises;

/* Config */

const apitoken = require("./config.json").apitoken;
const start_beatmatsetid = 60000;
const max_beatmapsetid = 1300000;

/* Main */

const sucessarray = {
	ranked: [],
	approved: [],
	qualified: [],
	loved: []
};

const savefile = async () => {
	sucessarray.ranked.sort((a, b) => {
		if (a < b) return -1;
		if (a > b) return 1;
		return 0;
	});

	sucessarray.approved.sort((a, b) => {
		if (a < b) return -1;
		if (a > b) return 1;
		return 0;
	});

	sucessarray.qualified.sort((a, b) => {
		if (a < b) return -1;
		if (a > b) return 1;
		return 0;
	});

	sucessarray.loved.sort((a, b) => {
		if (a < b) return -1;
		if (a > b) return 1;
		return 0;
	});

	await fs.appendFile("./result_ids.txt", `Ranked:\n`, { flag: "as" });
	sucessarray.ranked.forEach(async sucess_text => {
		await fs.appendFile("./result_ids.txt", `${sucess_text}\n`, { flag: "as" });
	});

	await fs.appendFile("./result_ids.txt", `Approved:\n`, { flag: "as" });
	sucessarray.approved.forEach(async sucess_text => {
		await fs.appendFile("./result_ids.txt", `${sucess_text}\n`, { flag: "as" });
	});

	await fs.appendFile("./result_ids.txt", `Qualified:\n`, { flag: "as" });
	sucessarray.qualified.forEach(async sucess_text => {
		await fs.appendFile("./result_ids.txt", `${sucess_text}\n`, { flag: "as" });
	});

	await fs.appendFile("./result_ids.txt", `Loved:\n`, { flag: "as" });
	sucessarray.loved.forEach(async sucess_text => {
		await fs.appendFile("./result_ids.txt", `${sucess_text}\n`, { flag: "as" });
	});
};

terminal.screensetting.key(["escape", "C-c"], async (ch, key) => {
	await savefile();
	terminal.screensetting.title = "";
	process.exit(0);
});

const request_api = async () => {
	const queuearray = [...Array(max_beatmapsetid).keys()];
	while (queuearray.length != 0) {
		const fallarray = [];
		for (let i = start_beatmatsetid; i < queuearray.length; i++) {
			terminal.currentid("CurrentID: " + i);
			await request(`https://osu.ppy.sh/api/get_beatmaps?k=${apitoken}&s=${i}`)
				.then(res => {
					const res_json = JSON.parse(res);
					if (res_json.length == 0) return;
					let end_foreach = false
					res_json.forEach(res_json_beatmap => {
						if (end_foreach) return;
						if (res_json_beatmap.mode == "3" && res_json_beatmap.diff_size == "4") {
							if (res_json_beatmap.approved == "1") {
								terminal.found(`Found Ranked 4K map: ${i}`);
								sucessarray.ranked.push(i);
								end_foreach = true;
								return;
							}
							else if (res_json_beatmap.approved == "2") {
								terminal.found(`Found Approved 4K map: ${i}`);
								sucessarray.approved.push(i);
								end_foreach = true;
								return;
							}
							else if (res_json_beatmap.approved == "3") {
								terminal.found(`Found Qualified 4K map: ${i}`);
								sucessarray.qualified.push(i);
								end_foreach = true;
								return;
							}
							else if (res_json_beatmap.approved == "4") {
								terminal.found(`Found Loved 4K map: ${i}`);
								sucessarray.loved.push(i);
								end_foreach = true;
								return;
							}
						}
					});
				})
				.catch(async error => {
					if (error.statusCode == 429) {
						console.log("Too Many Request: " + i);
						await terminal.error(error.message);
						fallarray.push(i);
					}
					else if (error.name == "RequestError") {
						terminal.info("RequestError: " + i);
						await terminal.error(error.message);
						terminal.info("Continue...");
						i--;
					}
					else {
						terminal.info("OtherError: " + i);
						await terminal.error(error.message);
						fallarray.push(i);
					}
				});
		}

		if (fallarray.length != 0) {
			queuearray = fallarray;
			terminal.info("FailurePhase");
		}
		else break;
	}
}

const unlink_file = async () => {
	await fs.unlink("./result_ids.txt")
		.then(() => terminal.info("Deleted before result"))
		.catch(async error => await terminal.error(error.message));
}

(async () => {
	terminal.info(`osu!mania 4k Beatmap Finder v${require("./package.json").version}`);
	terminal.info(`StartID: ${start_beatmatsetid}, EndID: ${max_beatmapsetid - 1}`);

	await unlink_file();
	await request_api();
})().then(() => terminal.info("Finished. Press Escape or Ctrl+C to Exit and Result save"));
