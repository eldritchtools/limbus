import styles from "./DeploymentPositionOverlay.module.css";

export default function DeploymentPositionOverlay({ sinnerId, deploymentOrder, activeSinners, scale = 1 }) {
    const index = deploymentOrder.indexOf(sinnerId);

    if (index === -1) return null;

    const num = index + 1;

    return <div
        className={`${styles.position} ${index < activeSinners ? styles.active : styles.backup}`}
        style={{ top: `${0 * scale}px`, left: `${15 * scale}px` }}
    >
        {num}
    </div>
}