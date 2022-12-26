import { useEffect, useState } from "react";
import styles from "../styles/Violations.module.css";
import { Violation } from "../types/types";
import ViolationComponent from "./violation";

export default function Violations() {
	const [violations, setViolations] = useState<Violation[]>([]);

	const openConnection = () => {
		if (
			!process.env.NEXT_PUBLIC_WS_API_URL ||
			!process.env.NEXT_PUBLIC_WS_ACCESS_KEY
		) {
			return console.error("ENV keys not defined");
		}
		const socket = new WebSocket(
			process.env.NEXT_PUBLIC_WS_API_URL,
			process.env.NEXT_PUBLIC_WS_ACCESS_KEY
		);
		socket.onmessage = (event) => {
			try {
				setViolations(JSON.parse(event.data));
			} catch (error) {
				console.log(error);
			}
			socket.send("keep-alive");
		};
		socket.onclose = () => {
			openConnection();
		};
	};

	useEffect(() => {
		openConnection();
	}, []);

	const getViolationComponents = () => {
		return violations?.map((violation: Violation, index: number) => {
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
						(ascending)
					</span>
				</div>
				<div className={styles.violationList}>
					{getViolationComponents()}
				</div>
			</div>
		</>
	);
}
