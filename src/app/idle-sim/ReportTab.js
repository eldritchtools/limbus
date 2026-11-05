import React, { useLayoutEffect, useMemo, useRef, useState } from "react";

import { getIdleSimTooltipProps } from "./idleSimTooltip";
import { getReportEventText, getReportRange, summarizeReports } from "./reports";
import { formatNumber, toCurrencyStr } from "./util";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import useLocalState from "../lib/useLocalState";

const TICK_COLORS = {
    good: "#3c9d5d",
    avg: "#d4b43a",
    bad: "#c0463c",
    break: "#34506b",
    incapacitated: "#6b1d1d",
    panic: "#8a4fb3",
    down: "#555"
};

const STRIPES = "repeating-linear-gradient(45deg, rgba(0,0,0,.35) 0 3px, transparent 3px 6px)";
const CELL_WIDTH = 18;
const CELL_HEIGHT = 36;

function Timeline({ idleSim, summary, scrollKey }) {
    const ref = useRef(null);
    useLayoutEffect(() => {
        ref.current.scrollLeft = ref.current.scrollWidth;
    }, [scrollKey]);

    const stickyStyle = { position: "sticky", left: 0, zIndex: 2, paddingRight: 6, background: "var(--bg-primary)" };
    return <>
        <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Summary</span>
        <div ref={ref} style={{ overflowX: "auto", maxWidth: "100%" }}>
            <div style={{ display: "grid", gridTemplateColumns: `120px repeat(${summary.ticks}, ${CELL_WIDTH}px)`, gap: 1, alignItems: "center", width: "max-content" }}>
                <div style={stickyStyle} />
                {Array.from({ length: summary.ticks }, (_, i) => {
                    const ago = idleSim.state.game_tick - 1 - (summary.from + i);
                    return <div key={i} style={{ fontSize: "0.6rem", textAlign: "center", overflow: "visible", whiteSpace: "nowrap" }}>
                        {ago % 6 === 0 ? `${ago}h` : ""}
                    </div>;
                })}
                {Object.entries(summary.agents).map(([id, agent]) => <React.Fragment key={id}>
                    <div style={{ ...stickyStyle, textAlign: "end", display: "flex", flexDirection: "column" }} {...getIdleSimTooltipProps("agent", id)}>
                        <span>{idleSim.state.agents[id]?.name ?? `Agent ${id}`}</span>
                        <span style={{ fontSize: "0.8rem" }}>Avg XP: {formatNumber(agent.xp / summary.ticks)}</span>
                        <span style={{ fontSize: "0.8rem" }}>Avg Earned: {formatNumber(agent.currency / summary.ticks)}</span>
                    </div>
                    {agent.cells.map((cell, i) => <div key={i}
                        style={{
                            height: CELL_HEIGHT, background: cell ? TICK_COLORS[cell.entryType] : "transparent", borderRadius: "0.2rem",
                            backgroundImage: ["incapacitated", "panic", "down"].includes(cell?.entryType) ? STRIPES : undefined,
                        }}
                        {...(cell ? getGeneralTooltipProps(cell.subject_id ? `${idleSim.data.subjects[cell.subject_id].name}: ${cell.entryType}, +${toCurrencyStr(cell.currency)}` : cell.entryType) : {})}
                    />)}
                </React.Fragment>)}
            </div>
        </div>
    </>;
}

function Events({ idleSim, summary }) {
    return <>
        <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Events</span>
        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: "0.5rem", rowGap: "0.2rem", alignItems: "center" }}>
            <span style={{ textAlign: "center" }}>Time Ago</span>
            <span>Event</span>
            {summary.events.notable.toReversed().map((event, i) => {
                const { time, text } = getReportEventText(idleSim.data, idleSim.state, event);
                return <React.Fragment key={i}>
                    <span style={{ textAlign: "center" }}>{time}</span>
                    <span>{text}</span>
                </React.Fragment>
            })}
        </div>
    </>
}

export default function ReportsTab({ idleSim }) {
    const [interval, setInterval] = useLocalState("idleSimReportsInterval", 24);
    const [from, to] = getReportRange(idleSim.state, idleSim.arrivalTick, interval);
    const summary = useMemo(() => summarizeReports(idleSim.state.reports, from, to), [idleSim.state.reports, from, to]);

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", maxWidth: "1600px" }}>
        <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
            Time Interval:
            <select value={interval} onChange={e => setInterval(e.target.value)}>
                <option value={24}>24h</option>
                <option value={48}>2d</option>
                <option value={100}>100h</option>
                <option value={168}>7d</option>
                <option value={200}>200h</option>
            </select>
        </div>

        <Timeline idleSim={idleSim} summary={summary} scrollKey={`${from}-${to}`} />

        <Events idleSim={idleSim} summary={summary} />
    </div>;
}