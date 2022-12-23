import type { NextApiRequest, NextApiResponse } from "next";
import { API_URL_DRONES } from "../../utils/constants";

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
	fetch(API_URL_DRONES)
		.then((response: Response) => {
			if (!response.ok) {
				res.status(404).json({ error: response.statusText });
			} else {
				return response.text();
			}
		})
		.then((result: any) => {
			res.status(200).json(result);
		});
}
