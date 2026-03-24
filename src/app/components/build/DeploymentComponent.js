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

export default function DeploymentComponent({ order, setOrder, activeSinners, sinnerId }) {
    const index = order.findIndex(x => x === sinnerId);
    if (index === -1) {
        if (setOrder)
            return <button onClick={() => setOrder(p => [...p, sinnerId])} style={deploymentComponentStyle}>
                <span>Deploy</span>
            </button>;
        else
            return <div style={deploymentComponentStyle} />;
    } else if (index < activeSinners) {
        if (setOrder)
            return <button onClick={() => setOrder(p => p.filter(x => x !== sinnerId))} style={deploymentComponentStyle}>
                <span style={{ color: "#fefe3d" }}>Active {index + 1}</span>
            </button>;
        else
            return <div style={deploymentComponentStyle}>
                <span style={{ color: "#fefe3d" }}>Active {index + 1}</span>
            </div>;
    } else {
        if (setOrder)
            return <button onClick={() => setOrder(p => p.filter(x => x !== sinnerId))} style={deploymentComponentStyle}>
                <span style={{ color: "#29fee9" }}>Backup {index + 1}</span>
            </button>;
        else
            return <div style={deploymentComponentStyle}>
                <span style={{ color: "#29fee9" }}>Backup {index + 1}</span>
            </div>
    }
}
