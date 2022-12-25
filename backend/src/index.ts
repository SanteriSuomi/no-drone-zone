import WebSocket from "ws";
import { Violation } from "./types/types";
import { refreshViolations } from "./utils/functions";
import { PORT, REFRESH_SPEED } from "./utils/constants";

const websocketServer = new WebSocket.Server({ port: PORT });

let savedViolations: Violation[] = [];

websocketServer.on("connection", (client) => {
	client.send(JSON.stringify(savedViolations));
});

setInterval(() => {
	refreshViolations(savedViolations)
		.then((updateData) => {
			if (updateData.updated) {
				savedViolations = updateData.violations;
				websocketServer.clients.forEach((client) => {
					client.send(JSON.stringify(savedViolations));
				});
			}
		})
		.catch((error) => {
			console.log(error);
		});
}, REFRESH_SPEED);
