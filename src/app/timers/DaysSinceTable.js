import React from "react";

import EgoIcon from "../components/icons/EgoIcon";
import IdentityIcon from "../components/icons/IdentityIcon";
import { keywords } from "../lib/constants";
import KeywordIcon from "../components/icons/KeywordIcon";
import SinnerIcon from "../components/icons/SinnerIcon";
import RarityIcon from "../components/icons/RarityIcon";
import { useBreakpoint } from "@eldritchtools/shared-components";
import NoPrefetchLink from "../components/NoPrefetchLink";

const DAY_MS = 24 * 60 * 60 * 1000;

export default function DaysSinceTable({ entries, identities, egos }) {
    const stickyHeaderStyle = { position: "sticky", top: 0, background: "#333", padding: "0.25rem", zIndex: 1 };
    const { isMobile } = useBreakpoint();

    const currentDateTime = useMemo(() => (new Date()).getTime(), []);

    const computeDaysSince = dateStr => {
        const [y, m, d] = dateStr.split("-").map(Number);
        const date = new Date(Date.UTC(y, m - 1, d, 3, 0, 0)); // 12pm KST boundary

        return Math.floor((currentDateTime - date.getTime()) / DAY_MS);
    }

    const constructCell = (key, key2) => {
        if (!entries[key][key2]) return null;
        const id = String(entries[key][key2]);
        if (id[0] === '1') {
            const since = computeDaysSince(identities[id].date);
            return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0.2rem" }}>
                <NoPrefetchLink href={`/identities/${id}`} style={{ width: isMobile ? "96px" : "128px", gap: "0.2rem" }}>
                    <IdentityIcon id={id} uptie={4} displayName={true} displayRarity={true} includeTooltip={true} />
                </NoPrefetchLink>
                <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{since} {since === 1 ? "Day" : "Days"}</span>
            </div>
        } else {
            const since = computeDaysSince(egos[id].date);
            return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "0.2rem", width: isMobile ? "96px" : "128px", gap: "0.2rem" }}>
                <NoPrefetchLink href={`/egos/${id}`} style={{ width: isMobile ? "96px" : "128px", gap: "0.2rem" }}>
                    <EgoIcon id={id} type={"awaken"} displayName={true} displayRarity={true} includeTooltip={true} />
                </NoPrefetchLink>
                <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{since} {since === 1 ? "Day" : "Days"}</span>
            </div>
        }
    }

    const constructRow = id => {
        return <tr key={id} style={{ borderTop: "1px #777 solid" }}>
            <td>
                {isNaN(Number(id)) ? <KeywordIcon id={id} size={48} /> : <SinnerIcon num={id} style={{ width: "48px", height: "48px" }} />}
            </td>
            <td>{constructCell(id, "identity")}</td>
            <td>{constructCell(id, "00")}</td>
            <td>{constructCell(id, "000")}</td>
            <td>{constructCell(id, "ego")}</td>
            <td>{constructCell(id, "ZAYIN")}</td>
            <td>{constructCell(id, "TETH")}</td>
            <td>{constructCell(id, "HE")}</td>
            <td>{constructCell(id, "WAW")}</td>
        </tr>
    }

    return <div style={{ overflowX: "auto", maxWidth: "95vw", border: "1px #aaa solid", borderRadius: "0.5rem" }}>
        <table style={{ borderCollapse: "collapse" }}>
            <thead>
                <tr>
                    <th style={stickyHeaderStyle}></th>
                    <th style={stickyHeaderStyle}>Identity</th>
                    <th style={stickyHeaderStyle}><RarityIcon rarity={"00"} /></th>
                    <th style={stickyHeaderStyle}><RarityIcon rarity={"000"} /></th>
                    <th style={stickyHeaderStyle}>E.G.O</th>
                    <th style={stickyHeaderStyle}><RarityIcon rarity={"ZAYIN"} style={{ height: "1.5rem" }} /></th>
                    <th style={stickyHeaderStyle}><RarityIcon rarity={"TETH"} style={{ height: "1.5rem" }} /></th>
                    <th style={stickyHeaderStyle}><RarityIcon rarity={"HE"} style={{ height: "1.5rem" }} /></th>
                    <th style={stickyHeaderStyle}><RarityIcon rarity={"WAW"} style={{ height: "1.5rem" }} /></th>
                </tr>
            </thead>
            <tbody>
                {Array.from({ length: 12 }, (_, i) => constructRow(i + 1))}
                {keywords.slice(0, 7).map(kw => constructRow(kw))}
            </tbody>
        </table>
    </div>
}