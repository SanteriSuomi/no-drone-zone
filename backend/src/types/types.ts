interface Drone {
	serialNumber: string;
	model: string;
	manufacturer: string;
	mac: string;
	ipv4: string;
	ipv6: string;
	firmware: string;
	positionY: number;
	positionX: number;
	altitude: number;
}

interface Pilot {
	pilotId: string;
	firstName: string;
	lastName: string;
	phoneNumber: string;
	createDt: string;
	email: string;
}

interface Violation {
	timestamp: number;
	distance: number;
	drone: Drone;
	pilot?: Pilot;
}

interface ApiData {
	updated: boolean;
	violations?: Violation[];
}

export type { Drone, Pilot, Violation, ApiData };
