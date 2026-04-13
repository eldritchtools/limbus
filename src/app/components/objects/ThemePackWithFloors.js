import { useFloorsForPack } from "../dataHooks/mdFloors";
import ThemePackIcon from "../icons/ThemePackIcon";

export default function ThemePackWithFloors({ id }) {
    const { normal, hard } = useFloorsForPack(id);
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <ThemePackIcon id={id} displayName={true} scale={0.5} />
        <div style={{ display: "grid", width: "200px", gridTemplateColumns: "1fr 1fr" }} >
            <div style={{ color: "#4ade80" }}>Normal</div>
            <div style={{ color: "#f87171" }}>Hard</div>
            <div>{normal.length ? normal.map(f => `F${f}`).join(", ") : "None"}</div>
            <div>{hard.length ? hard.map(f => `F${f}`).join(", ") : "None"}</div>
        </div>
    </div>
}