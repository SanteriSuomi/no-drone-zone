import { Drone, Violation } from "../types/types";
import {
	API_URL_PILOTS,
	EXPIRATION_TIME,
	NDZ_MID_POINT,
	NDZ_RADIUS,
} from "../utils/constants";

export function euclideanDistance(
	startX: number,
	endX: number,
	startY: number,
	endY: number
): number {
	return Math.hypot(endX - startX, endY - startY);
}

export async function getUpdatedViolations(
	drones: Drone[],
	savedViolations: Violation[]
): Promise<Violation[]> {
	const retrievedViolations: (Violation | void)[] = await Promise.all(
		drones.map(async (drone: Drone) => {
			const distance = euclideanDistance(
				NDZ_MID_POINT.x,
				drone.positionX[0],
				NDZ_MID_POINT.y,
				drone.positionY[0]
			);
			if (distance < NDZ_RADIUS) {
				const res = await fetch(API_URL_PILOTS + drone.serialNumber[0]);
				const pilot = await res.json();
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

	const savedViolationMap = new Map<
		string,
		{ violation: Violation; index: number }
	>();
	savedViolations.forEach((violation: Violation, index: number) => {
		if (violation.timestamp + EXPIRATION_TIME > new Date().getTime()) {
			updatedViolations.push(violation);
			savedViolationMap.set(violation.drone.mac[0], {
				violation: violation,
				index: index,
			});
		}
	});

	retrievedViolations.forEach((violation: Violation | void) => {
		if (violation) {
			const existingViolation = savedViolationMap.get(
				violation.drone.mac[0]
			);
			if (existingViolation) {
				updatedViolations[existingViolation.index] = violation;
			} else {
				updatedViolations.push(violation);
			}
		}
	});

	return updatedViolations.sort((a: Violation, b: Violation) =>
		a.distance > b.distance ? 1 : -1
	);
}
