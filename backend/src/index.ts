import http from "http";
import { WebSocketServer } from "ws";
import { Low, JSONFile } from "lowdb";
import { Violation } from "./types/types.js";
import { refreshViolations, writeResponse } from "./utils/functions.js";
import {
	API_URL_HEALTH,
	DATABASE_FILE_NAME,
	PORT,
	REFRESH_SPEED,
} from "./utils/constants.js";
import path, { dirname } from "path";

const server = http.createServer();
const ws = new WebSocketServer({ server: server });
const db = new Low<Violation[]>(
	new JSONFile(path.resolve(dirname("./"), DATABASE_FILE_NAME))
);

let violationUpdateJob: NodeJS.Timer | null;
let errorCount = 0;

server.on("request", (request, response) => {
	const { url } = request;
	if (url === API_URL_HEALTH) {
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
