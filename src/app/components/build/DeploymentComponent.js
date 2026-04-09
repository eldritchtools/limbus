import { deploymentColors } from "@/app/lib/colors";

const deploymentComponentStyle = {
    flex: 1,
    textAlign: "center",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 0,
    margin: 0,
    containerType: "size",
    fontSize: "clamp(0.6rem, 20cqw, 1.5rem)"
}

export default function DeploymentComponent({ depType, depIndex, setOrder, sinnerId }) {
    if (depType === "none") {
        if (setOrder)
            return <button onClick={() => setOrder(p => [...p, sinnerId])} style={deploymentComponentStyle}>
                <span>Deploy</span>
            </button>;
        else
            return <div style={deploymentComponentStyle} />;
    } else if (depType === "active") {
        if (setOrder)
            return <button onClick={() => setOrder(p => p.filter(x => x !== sinnerId))} style={deploymentComponentStyle}>
                <span style={{ color: deploymentColors.active }}>Active {depIndex}</span>
            </button>;
        else
            return <div style={deploymentComponentStyle}>
                <span style={{ color: deploymentColors.active }}>Active {depIndex}</span>
            </div>;
    } else if (depType === "backup") {
        if (setOrder)
            return <button onClick={() => setOrder(p => p.filter(x => x !== sinnerId))} style={deploymentComponentStyle}>
                <span style={{ color: deploymentColors.backup }}>Backup {depIndex}</span>
            </button>;
        else
            return <div style={deploymentComponentStyle}>
                <span style={{ color: deploymentColors.backup }}>Backup {depIndex}</span>
            </div>
    } else {
        return null;
    }
}
