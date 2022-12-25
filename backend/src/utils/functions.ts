import { parseStringPromise } from "xml2js";
import { ApiData, Drone, Violation } from "../types/types";
import {
	API_URL_DRONES,
	API_URL_PILOTS,
	EXPIRATION_TIME,
	NDZ_MID_POINT,
	NDZ_RADIUS,
} from "../utils/constants";

function euclideanDistance(
	startX: number,
	endX: number,
	startY: number,
	endY: number
): number {
	return Math.hypot(endX - startX, endY - startY);
}

async function refreshViolations(savedViolations: Violation[]) {
	const response = await fetch(API_URL_DRONES);
	const result = await response.text();
	let updateData: ApiData = { updated: false, violations: null };
	await parseStringPromise(result, { explicitArray: false })
		.then(async (parseResult) => {
			const drones = parseResult.report.capture.drone;
			updateData = await getUpdatedViolations(drones, [
				...savedViolations,
			]);
		})
		.catch((reason) => {
			console.log(reason);
		});
	return updateData;
}

async function getUpdatedViolations(
	drones: Drone[],
	savedViolations: Violation[]
) {
	const newViolations: (Violation | void)[] = await Promise.all(
		drones.map(async (drone: Drone) => {
			const distance = euclideanDistance(
				NDZ_MID_POINT.x,
				drone.positionX,
				NDZ_MID_POINT.y,
				drone.positionY
			);
			if (distance <= NDZ_RADIUS) {
				const response = await fetch(
					API_URL_PILOTS + drone.serialNumber
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
			savedViolationMap.set(violation.drone.mac, {
				violation: violation,
				index: index,
			});
			updated = true;
		}
	});

	newViolations.forEach((violation: Violation | void) => {
		if (violation) {
			const existingViolation = savedViolationMap.get(
				violation.drone.mac
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

export { refreshViolations, getUpdatedViolations };
