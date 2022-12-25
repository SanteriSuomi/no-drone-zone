const PORT = 4000;

const NDZ_MID_POINT = {
	x: 250000,
	y: 250000,
};

const NDZ_RADIUS = 100000;

const EXPIRATION_TIME = 600000;

const REFRESH_SPEED = 2000;

const API_URL_DRONES = "https://assignments.reaktor.com/birdnest/drones";

const API_URL_PILOTS = "https://assignments.reaktor.com/birdnest/pilots/";

const DATABASE_FILE_PATH = "data/db.json";

const API_URL_HEALTH = "/health";

const MAX_ERROR_COUNT = 10;

export {
	PORT,
	NDZ_MID_POINT,
	NDZ_RADIUS,
	EXPIRATION_TIME,
	REFRESH_SPEED,
	API_URL_DRONES,
	API_URL_PILOTS,
	DATABASE_FILE_PATH,
	API_URL_HEALTH,
	MAX_ERROR_COUNT,
};
