import express from "express";
import { Violation } from "./types/types";
import { refreshViolations } from "./utils/functions";
import { REFRESH_SPEED, PORT } from "./utils/constants";

const app = express();

let savedViolations: Violation[] = [];

setInterval(async () => {
	const newViolations = await refreshViolations(savedViolations);
	if (newViolations) {
		savedViolations = newViolations;
	}
}, REFRESH_SPEED);

app.get("/violations", (_req, res) => {
	res.status(200).json(JSON.stringify(savedViolations));
});

app.listen(PORT, () => {
	console.log(`Listening on port ${PORT}`);
});
