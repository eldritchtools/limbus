import { deploymentColors } from "@/app/lib/colors";

export default function DeploymentPositionOverlay({ sinnerId, deploymentOrder, activeSinners, scale = 1 }) {
    const index = deploymentOrder.indexOf(sinnerId);

    if (index === -1) return null;

    const color = index < activeSinners ? deploymentColors.active : deploymentColors.backup;
    const num = index + 1;

    return <div style={{
        position: "absolute",
        top: `${0 * scale}px`,
        left: `${15 * scale}px`,
        textShadow: "2px 2px 6px #000, -2px 2px 6px #000, 2px -2px 6px #000, -2px -2px 6px #000, 0px 0px 12px rgba(0, 0, 0, 0.75), 0px 0px 18px rgba(0, 0, 0, 0.5)",
        color: color,
        fontWeight: "bold",
    }}>
        {num}
    </div>
}