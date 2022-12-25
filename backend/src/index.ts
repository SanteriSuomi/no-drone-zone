import { WebSocketServer } from "ws";
import { Violation } from "./types/types.js";
import { refreshViolations } from "./utils/functions.js";
import {
	DATABASE_FILE_PATH,
	MAX_ERROR_COUNT,
	PORT,
	REFRESH_SPEED,
} from "./utils/constants.js";
import { Low, JSONFile } from "lowdb";
import express from "express";

const app = express();
const db = new Low<Violation[]>(new JSONFile(DATABASE_FILE_PATH));
let timer: NodeJS.Timer | null;
let errorCount = 0;

app.get("/health", (_request, response) => {
	for (const client of ws?.clients.values()) {
		if (client.OPEN && !db.data) {
			return response
				.status(500)
				.send("A websocket client has open state but database is null");
		}
	}
	if (!timer) {
		return response.status(500).send("Timer not found");
	}
	if (errorCount > MAX_ERROR_COUNT) {
		return response.status(500).send("Error limit reached");
	}
	return response.status(200);
});

const server = app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});

const ws = new WebSocketServer({ server: server });

ws.on("connection", async (client) => {
	if (!db.data) {
		await db.read();
		if (!db.data) {
			db.data = [];
		}
	}
	client.send(JSON.stringify(db.data));
});

timer = setInterval(async () => {
	if (!db.data) return;
	try {
		const violationData = await refreshViolations(db.data);
		if (violationData.updated) {
			db.data = violationData.violations;
			await db.write();
			ws.clients.forEach((client) => {
				client.send(JSON.stringify(db.data));
			});
		}
	} catch (error) {
		console.log(error);
		errorCount += 1;
	}
}, REFRESH_SPEED);
