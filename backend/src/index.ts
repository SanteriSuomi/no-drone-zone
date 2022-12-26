import http from "http";
import { WebSocketServer } from "ws";
import { Low, JSONFile } from "lowdb";
import { Violation } from "./types/types.js";
import { authenticate, refreshViolations } from "./utils/functions.js";
import {
	API_URL_HEALTH,
	DATABASE_FILE_NAME,
	PORT,
	REFRESH_SPEED,
} from "./utils/constants.js";
import { resolve, dirname } from "path";

import dotenv from "dotenv";
dotenv.config();

const server = http.createServer();
const ws = new WebSocketServer({ server: server });
const db = new Low<Violation[]>(
	new JSONFile(resolve(dirname("./"), "data", DATABASE_FILE_NAME))
);

server.on("request", (request, response) => {
	try {
		const { url } = request;
		if (url === API_URL_HEALTH) {
			response.writeHead(200);
			response.write("Ok");
			response.end();
		}
	} catch (error) {
		console.log(error);
	}
});

ws.on("connection", async (client, request) => {
	try {
		if (authenticate(request)) {
			console.log("New WS client " + request.socket.remoteAddress);
			if (!db.data) {
				await db.read();
				if (!db.data) {
					db.data = [];
				}
			}
			client.send(JSON.stringify(db.data));
		} else {
			client.send("Not authorized");
			client.terminate();
		}
	} catch (error) {
		console.log(error);
	}
});

setInterval(async () => {
	try {
		if (!db.data) return;
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
	}
}, REFRESH_SPEED);

server.listen(PORT, () => {
	console.log(`Listening to connections on port ${PORT}`);
});
