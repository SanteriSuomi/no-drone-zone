import { createServer, IncomingMessage } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { Low, JSONFile } from "lowdb";
import { resolve, dirname } from "path";
import { Violation } from "./types/types.js";
import { DATABASE_FILE_NAME, PORT, REFRESH_SPEED } from "./utils/constants.js";
import {
	processHttpRequest,
	processWebsocketRequest,
	processInternalJob,
} from "./requests.js";

import dotenv from "dotenv";
dotenv.config();

const http = createServer();
const ws = new WebSocketServer({ server: http });
const db = new Low<Violation[]>(
	new JSONFile(resolve(dirname("./"), "data", DATABASE_FILE_NAME))
);

http.on("request", processHttpRequest);

ws.on("connection", (client: WebSocket, request: IncomingMessage) => {
	processWebsocketRequest(client, request, db);
});

setInterval(() => {
	processInternalJob(ws, db);
}, REFRESH_SPEED);

http.listen(PORT, () => {
	console.log(`Listening to connections on port ${PORT}`);
});
