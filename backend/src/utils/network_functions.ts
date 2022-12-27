import { IncomingMessage, ServerResponse } from "http";
import { WebSocket, WebSocketServer } from "ws";
import { Low } from "lowdb";
import { Violation } from "../types/types.js";
import { authenticate, refreshViolations } from "./general_functions.js";
import { API_URL_HEALTH } from "./constants.js";

function processHttpRequest(
	request: IncomingMessage,
	response: ServerResponse<IncomingMessage>
) {
	const { url } = request;
	if (url === API_URL_HEALTH) {
		response.writeHead(204).end();
	}
	response.writeHead(404).end();
}

async function processWebsocketRequest(
	client: WebSocket,
	request: IncomingMessage,
	db: Low<Violation[]>
) {
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
		console.error(error);
	}
}

async function processInternalJob(ws: WebSocketServer, db: Low<Violation[]>) {
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
		console.error(error);
	}
}

export { processHttpRequest, processWebsocketRequest, processInternalJob };
