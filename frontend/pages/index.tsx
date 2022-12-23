import styles from "../styles/Home.module.css";
import Violations from "../components/violations";

export default function Home() {
	return (
		<div className={styles.content}>
			<div className={styles.title}>No Drone Zone</div>
			<Violations></Violations>
		</div>
	);
}
