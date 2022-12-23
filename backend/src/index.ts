import express from "express";
import { Violation } from "./types/types";
import { parseStringPromise } from "xml2js";
import { getUpdatedViolations } from "./utils/functions";
import { API_URL_DRONES, REFRESH_SPEED, PORT } from "./utils/constants";

const app = express();

let violations: Violation[] = [];

setInterval(() => {
	fetch(API_URL_DRONES)
		.then((response) => response.text())
		.then(async (xmlResult) => {
			try {
				const parseResult = await parseStringPromise(xmlResult);
				const drones = parseResult.report.capture[0].drone;
				violations = await getUpdatedViolations(drones, [
					...violations,
				]);
			} catch (error) {
				console.log(error);
			}
		});
}, REFRESH_SPEED);

app.get("/violations", (_req, res) => {
	res.status(200).json(JSON.stringify(violations));
});

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});
