import http from "http";
import { WebSocketServer } from "ws";
import { Low, JSONFile } from "lowdb";
import { Violation } from "./types/types.js";
import { refreshViolations, writeResponse } from "./utils/functions.js";
import {
	API_URL_HEALTH,
	API_URL_WS,
	DATABASE_FILE_PATH,
	MAX_ERROR_COUNT,
	PORT,
	REFRESH_SPEED,
} from "./utils/constants.js";

const server = http.createServer();
const ws = new WebSocketServer({ server: server, path: API_URL_WS });
const db = new Low<Violation[]>(new JSONFile(DATABASE_FILE_PATH));

let violationUpdateJob: NodeJS.Timer | null;
let errorCount = 0;

server.on("request", (request, response) => {
	const { url } = request;
	if (url === API_URL_HEALTH) {
		response.setHeader("Content-Type", "application/json");
		for (const client of ws?.clients.values()) {
			if (client.OPEN && !db.data) {
				return writeResponse(
					response,
					500,
					"A websocket client has open state but database is null"
				);
			}
		}
		if (!violationUpdateJob) {
			return writeResponse(response, 500, "Timer not found");
		}
		if (errorCount > MAX_ERROR_COUNT) {
			return writeResponse(response, 500, "Error limit reached");
		}
		return writeResponse(response, 200, "OK");
	}
});

ws.on("connection", async (client) => {
	if (!db.data) {
		await db.read();
		if (!db.data) {
			db.data = [];
		}
	}
	client.send(JSON.stringify(db.data));
});

violationUpdateJob = setInterval(async () => {
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

server.listen(PORT, () => {
	console.log(`Listening to connections on port ${PORT}`);
});
