import { useEffect, useState } from "react";
import styles from "../styles/Violations.module.css";
import { Violation } from "../types/types";
import { REFRESH_SPEED } from "../utils/constants";
import ViolationComponent from "./violation";

let jobID: number | null;

export default function Violations() {
	const [violations, setViolations] = useState<Violation[]>([]);

	const updateViolations = async () => {
		try {
			const response = await fetch("/api/violations");
			const result = await response.json();
			setViolations(JSON.parse(result));
		} catch (error) {
			console.log(error);
		}
	};

	useEffect(() => {
		if (jobID) return;
		updateViolations();
		jobID = window.setInterval(() => {
			updateViolations();
		}, REFRESH_SPEED);
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
		<>
			<div className={styles.marginElement}></div>
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
		</>
	);
}
