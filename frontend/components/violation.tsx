import styles from "../styles/Violation.module.css";
import { Violation } from "../types/types";

export default function ViolationComponent({
	violation,
}: {
	violation: Violation;
}) {
	const getPilotDetails = () => {
		if (violation.pilot) {
			return (
				<>
					<div className={styles.infoText}>
						{violation.pilot.firstName +
							" " +
							violation.pilot.lastName}
					</div>
					<div className={styles.infoText}>
						{violation.pilot.email}
					</div>
					<div className={styles.infoText}>
						{violation.pilot.phoneNumber}
					</div>
				</>
			);
		}
		return <div className={styles.infoText}>No pilot details found</div>;
	};

	return (
		<div className={styles.content}>
			{getPilotDetails()}
			<div className={styles.infoText}>
				{Math.round(violation.distance / 1000)} meters
			</div>
			<div className={styles.infoText}>
				{new Date(violation.timestamp).toLocaleTimeString()}
			</div>
		</div>
	);
}
