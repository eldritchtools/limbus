import { useFloorsForPack } from "../dataHooks/mdFloors";
import ThemePackIcon from "../icons/ThemePackIcon";

import { uiColors } from "@/app/lib/colors";

export default function ThemePackWithFloors({ id, scale = 0.5 }) {
    const { normal, hard } = useFloorsForPack(id);
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <ThemePackIcon id={id} displayName={true} scale={scale} />
        <div style={{ display: "grid", width: `${scale * 400}px`, gridTemplateColumns: "1fr 1fr" }} >
            <div style={{ color: uiColors.green }}>Normal</div>
            <div style={{ color: uiColors.red }}>Hard</div>
            <div>{normal.length ? normal.map(f => `F${f}`).join(", ") : "None"}</div>
            <div>{hard.length ? hard.map(f => `F${f}`).join(", ") : "None"}</div>
        </div>
    </div>
}