import { parseStringPromise } from "xml2js";
import { ApiData, Drone, Pilot, Violation } from "../types/types.js";
import { EXPIRATION_TIME, NDZ_MID_POINT, NDZ_RADIUS } from "./constants.js";
import { IncomingMessage } from "http";

async function refreshViolations(
	savedViolations: Violation[]
): Promise<ApiData> {
	const response = await fetch(process.env.API_URL_DRONES);
	const result = await response.text();
	const parseResult = await parseStringPromise(result, {
		explicitArray: false,
	});
	const drones = parseResult.report.capture.drone;
	const timestamp = new Date(
		parseResult.report.capture.$.snapshotTimestamp
	).getTime();
	return await getUpdatedViolations(drones, [...savedViolations], timestamp);
}

async function getUpdatedViolations(
	drones: Drone[],
	savedViolations: Violation[],
	timestamp: number
) {
	const newViolations: (Violation | void)[] = await getPilots(drones);

	let updated = false;
	let updatedViolations: Violation[] = [];

	const savedViolationMap = new Map<string, Violation>();
	savedViolations.forEach((violation?: Violation) => {
		if (
			violation &&
			violation.timestamp + EXPIRATION_TIME > new Date().getTime()
		) {
			updatedViolations.push(violation);
			savedViolationMap.set(violation.drone.serialNumber, violation);
			updated = true;
		}
	});

	newViolations.forEach((violation?: Violation) => {
		if (violation) {
			violation.timestamp = timestamp;
			if (savedViolationMap.has(violation.drone.serialNumber)) {
				updatedViolations = updatedViolations.filter((v: Violation) => {
					return (
						v.drone.serialNumber !== violation.drone.serialNumber
					);
				});
			}
			updatedViolations.push(violation);
			updated = true;
		}
	});

	updatedViolations.sort((a: Violation, b: Violation) =>
		a.distance > b.distance ? 1 : -1
	);
	return { updated: updated, violations: updatedViolations };
}

async function getPilots(drones: Drone[]): Promise<(Violation | void)[]> {
	return await Promise.all(drones.map(retrievePilotData));
}

async function retrievePilotData(drone: Drone) {
	const distanceToNest = euclideanDistance(
		NDZ_MID_POINT.x,
		drone.positionX,
		NDZ_MID_POINT.y,
		drone.positionY
	);
	if (distanceToNest <= NDZ_RADIUS) {
		const response = await fetch(
			process.env.API_URL_PILOTS + drone.serialNumber
		);
		let pilot: Pilot = <Pilot>{};
		if (response.status !== 404) {
			pilot = await response.json();
		}
		return Promise.resolve({
			timestamp: 0,
			distance: distanceToNest,
			drone: drone,
			pilot: pilot,
		});
	}
	return Promise.resolve(null);
}

function euclideanDistance(
	startX: number,
	endX: number,
	startY: number,
	endY: number
): number {
	return Math.hypot(endX - startX, endY - startY);
}

function authenticate(request: IncomingMessage) {
	return (
		request.headers["sec-websocket-protocol"] === process.env.WS_ACCESS_KEY
	);
}

export { refreshViolations, authenticate };
