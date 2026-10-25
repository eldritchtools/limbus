export default function SubjectsTab({ idleSim }) {
    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {Object.entries(idleSim.state.subjects).map(([id, x]) => <span key={id}>{JSON.stringify(x)}</span>)}
    </div>;
}