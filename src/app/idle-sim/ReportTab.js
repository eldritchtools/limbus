export default function ReportsTab({ idleSim }) {
    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {idleSim.state.reports.map((x, i) => <span key={i}>{JSON.stringify(x)}</span>)}
    </div>;
}