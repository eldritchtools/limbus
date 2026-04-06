"use client";

import { useFloorsForPack } from "../dataHooks/mdFloors";
import { useData } from "../DataProvider";
import TooltipTemplate from "./TooltipTemplate";
import ThemePackIcon from "../icons/ThemePackIcon";

const TOOLTIP_ID = "theme-pack-tooltip";

function ThemePackTooltipContent({ id, themePack }) {
    const { normal, hard } = useFloorsForPack(id);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", padding: "0.75rem" }}>
        <div style={{ fontSize: "1.5em", fontWeight: "bold" }}>{themePack.name}</div>
        <ThemePackIcon themePack={themePack} scale={0.5} />
        <div style={{ display: "grid", width: "190px", gridTemplateColumns: "1fr 1fr" }} >
            <div style={{ color: "#4ade80" }}>Normal</div>
            <div style={{ color: "#f87171" }}>Hard</div>
            <div>{normal.length ? normal.map(f => `F${f}`).join(", ") : "None"}</div>
            <div>{hard.length ? hard.map(f => `F${f}`).join(", ") : "None"}</div>
        </div>
    </div>
}

function TooltipLoader({ themePackId }) {
    const [themePacks, themePacksLoading] = useData("md_theme_packs");
    if (!themePackId || themePacksLoading) return null;

    return <ThemePackTooltipContent id={themePackId} themePack={themePacks[themePackId]} />
}

export function ThemePackTooltip() {
    return <TooltipTemplate id={TOOLTIP_ID} contentFunc={id => <TooltipLoader themePackId={id} />} />
}

export function getThemePackTooltipProps(id) {
    return {
        "data-tooltip-id": TOOLTIP_ID,
        "data-tooltip-content": id
    }
}
