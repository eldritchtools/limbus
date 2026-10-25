export default function AgentsTab({ idleSim }) {
    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {idleSim.state.agents.map((x, i) => <span key={i}>{JSON.stringify(x)}</span>)}
    </div>;
}