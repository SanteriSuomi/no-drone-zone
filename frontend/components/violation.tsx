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
						<span className={styles.infoTextTitle}>
							Name &nbsp; &nbsp; &nbsp; &nbsp;
						</span>
						{violation.pilot.firstName +
							" " +
							violation.pilot.lastName}
					</div>
					<div className={styles.infoText}>
						<span className={styles.infoTextTitle}>
							Email &nbsp; &nbsp; &nbsp; &nbsp;
						</span>
						{violation.pilot.email}
					</div>
					<div className={styles.infoText}>
						<span className={styles.infoTextTitle}>
							Phone &nbsp; &nbsp; &nbsp;
						</span>
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
				<span className={styles.infoTextTitle}>Distance &nbsp; </span>
				{Math.round(violation.distance / 1000)} meters
			</div>
			<div className={styles.infoText}>
				<span className={styles.infoTextTitle}>
					Time &nbsp; &nbsp; &nbsp; &nbsp;{" "}
				</span>
				{new Date(violation.timestamp).toLocaleTimeString()}
			</div>
		</div>
	);
}
