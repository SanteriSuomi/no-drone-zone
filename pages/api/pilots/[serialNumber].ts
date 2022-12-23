import type { NextApiRequest, NextApiResponse } from "next";
import { API_URL_PILOTS } from "../../../utils/constants";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
	const { serialNumber } = req.query;
	fetch(API_URL_PILOTS + serialNumber)
		.then((response: Response) => {
			if (!response.ok) {
				res.status(404).json({ error: response.statusText });
			} else {
				return response.json();
			}
		})
		.then((result: any) => {
			res.status(200).json(result);
		});
}
