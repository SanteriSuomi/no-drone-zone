import { useEffect, useState } from "react";
import { parseStringPromise } from "xml2js";
import styles from "../styles/Violations.module.css";
import { Violation } from "../types/types";
import { getUpdatedViolations } from "../utils/functions";
import { REFRESH_SPEED } from "../utils/constants";
import ViolationComponent from "./violation";

let jobID: number | null;

export default function Violations() {
	const [violations, setViolations] = useState<Violation[]>([]);

	useEffect(() => {
		if (jobID) {
			return;
		}

		const violationUpdateJob = () => {
			fetch("/api/drones")
				.then((response) => response.json())
				.then(async (xmlResult) => {
					const parseResult = await parseStringPromise(xmlResult);
					const drones = parseResult.report.capture[0].drone;
					const updatedViolations = await getUpdatedViolations(
						drones
					);
					setViolations(updatedViolations);
					localStorage.setItem(
						"violations",
						JSON.stringify(updatedViolations)
					);
				});
		};

		jobID = window.setInterval(() => {
			violationUpdateJob();
		}, REFRESH_SPEED);
	}, []);

	useEffect(() => {
		const violations: Violation[] = JSON.parse(
			localStorage.getItem("violations") ?? "[]"
		);
		setViolations(violations);
	}, []);

	const getViolationComponents = () => {
		return violations.map((violation: Violation) => (
			<ViolationComponent
				key={violation.timestamp}
				violation={violation}
			></ViolationComponent>
		));
	};

	return (
		<div className={styles.content}>
			<div className={styles.title}>
				Violations (in the past 10 minutes)
			</div>
			<div className={styles.violationList}>
				{getViolationComponents()}
			</div>
		</div>
	);
}
