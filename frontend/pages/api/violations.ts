import type { NextApiRequest, NextApiResponse } from "next";
import { API_URL_VIOLATIONS } from "../../utils/constants";

export default async function handler(
	_req: NextApiRequest,
	res: NextApiResponse
) {
	const response: Response = await fetch(API_URL_VIOLATIONS);
	if (!response.ok) {
		return res.status(404).json({ error: response.statusText });
	}
	const result = await response.json();
	return res.status(200).json(result);
}
