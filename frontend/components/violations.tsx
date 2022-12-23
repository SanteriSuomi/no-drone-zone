import { useEffect, useState } from "react";
import styles from "../styles/Violations.module.css";
import { Violation } from "../types/types";
import { REFRESH_SPEED } from "../utils/constants";
import ViolationComponent from "./violation";

let jobID: number | null;

export default function Violations() {
	const [violations, setViolations] = useState<Violation[]>([]);

	const updateViolations = () => {
		fetch("/api/violations")
			.then((response) => response.json())
			.then((result) => {
				setViolations(JSON.parse(result));
			});
	};

	useEffect(() => {
		if (jobID) return;
		jobID = window.setInterval(() => {
			updateViolations();
		}, REFRESH_SPEED);
		updateViolations();
	}, []);

	const getViolationComponents = () => {
		return violations.map((violation: Violation, index: number) => {
			if (!violation) return <></>;
			return (
				<ViolationComponent
					key={index}
					violation={violation}
				></ViolationComponent>
			);
		});
	};

	return (
		<div className={styles.content}>
			<div className={styles.title}>
				Violations{" "}
				<span className={styles.subtitle}>
					in the past 10 minutes sorted by distance to the nest
				</span>
			</div>
			<div className={styles.violationList}>
				{getViolationComponents()}
			</div>
		</div>
	);
}
