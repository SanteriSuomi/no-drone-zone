import { parseStringPromise } from "xml2js";
import { ApiData, Drone, Violation } from "../types/types.js";
import {
	EXPIRATION_TIME,
	NDZ_MID_POINT,
	NDZ_RADIUS,
} from "../utils/constants.js";
import { IncomingMessage } from "http";

function euclideanDistance(
	startX: number,
	endX: number,
	startY: number,
	endY: number
): number {
	return Math.hypot(endX - startX, endY - startY);
}

async function refreshViolations(
	savedViolations: Violation[]
): Promise<ApiData> {
	const response = await fetch(process.env.API_URL_DRONES);
	const result = await response.text();
	const parseResult = await parseStringPromise(result, {
		explicitArray: false,
	});
	const drones = parseResult.report.capture.drone;
	return await getUpdatedViolations(drones, [...savedViolations]);
}

async function getUpdatedViolations(
	drones: Drone[],
	savedViolations: Violation[]
) {
	const newViolations: (Violation | void)[] = await getPilots(drones);

	const updatedViolations: Violation[] = [];
	let updated = false;

	const savedViolationMap = new Map<
		string,
		{ violation: Violation; index: number }
	>();
	savedViolations.forEach((violation: Violation, index: number) => {
		if (
			violation &&
			violation.timestamp + EXPIRATION_TIME > new Date().getTime()
		) {
			updatedViolations.push(violation);
			savedViolationMap.set(violation.drone.serialNumber, {
				violation: violation,
				index: index,
			});
			updated = true;
		}
	});

	newViolations.forEach((violation: Violation | void) => {
		if (violation) {
			const existingViolation = savedViolationMap.get(
				violation.drone.serialNumber
			);
			if (existingViolation) {
				updatedViolations[existingViolation.index] = violation;
			} else {
				updatedViolations.push(violation);
			}
			updated = true;
		}
	});

	updatedViolations.sort((a: Violation, b: Violation) =>
		a.distance > b.distance ? 1 : -1
	);
	return { updated: updated, violations: updatedViolations };
}

async function getPilots(drones: Drone[]): Promise<(Violation | void)[]> {
	return await Promise.all(
		drones.map(async (drone: Drone) => {
			const distance = euclideanDistance(
				NDZ_MID_POINT.x,
				drone.positionX,
				NDZ_MID_POINT.y,
				drone.positionY
			);
			if (distance < NDZ_RADIUS) {
				const response = await fetch(
					process.env.API_URL_PILOTS + drone.serialNumber
				);
				const pilot = await response.json();
				return Promise.resolve({
					timestamp: new Date().getTime(),
					distance: distance,
					drone: drone,
					pilot: pilot,
				});
			}
			return Promise.resolve();
		})
	);
}

function authenticate(request: IncomingMessage) {
	return (
		request.headers["sec-websocket-protocol"] === process.env.WS_ACCESS_KEY
	);
}

export { refreshViolations, getUpdatedViolations, authenticate };
