import React, { useLayoutEffect, useMemo, useRef, useState } from "react";

import { EnemySprite } from "./icons";
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

function workTypeLabel(type) {
    if (type === "avg") return "Average";
    return type.charAt(0).toUpperCase() + type.slice(1);
}

function ResultBar({ counts, keys = Object.keys(TICK_COLORS), height = 10 }) {
    const parts = keys.filter(k => counts[k] > 0);
    if (parts.length === 0) return null;
    const total = parts.reduce((acc, k) => acc + counts[k], 0);
    return <div
        style={{ display: "flex", height, width: "100%", borderRadius: 3, overflow: "hidden" }}
        {...getGeneralTooltipProps(parts.map(k => `${counts[k]} ${workTypeLabel(k)}`).join(" / "))}
    >
        {parts.map(k => <div key={k} style={{
            flex: counts[k],
            backgroundColor: k ? TICK_COLORS[k] : "transparent",
            backgroundImage: ["incapacitated", "panic", "down"].includes(k) ? STRIPES : undefined,
        }}
            {...getGeneralTooltipProps(`${workTypeLabel(k)}: ${counts[k]}/${total} (${(100 * counts[k] / total).toFixed(2)}%)`)}
        />)}
    </div>;
}

function Timeline({ idleSim, summary, scrollKey }) {
    const ref = useRef(null);
    useLayoutEffect(() => {
        ref.current.scrollLeft = ref.current.scrollWidth;
    }, [scrollKey]);

    const stickyStyle = { position: "sticky", left: 0, zIndex: 2, paddingRight: 6, background: "var(--bg-primary)" };
    return <>
        <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Summary</span>
        <div style={{ display: "flex", gap: 1, width: "100%", height: `${CELL_HEIGHT / 2}px`, alignItems: "center" }}>
            <span style={{ width: "120px", textAlign: "end" }}>Overall:</span>
            <div style={{ flex: 1, width: "100%", height: `${CELL_HEIGHT / 2}px` }}>
                <ResultBar counts={summary.totals.entryTypes} height={CELL_HEIGHT / 2} />
            </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${Object.keys(summary.subjects).length}, 100px)`, rowGap: "0.2rem", columnGap: "0.5rem", maxWidth: "100%", overflowX: "auto", overflowY: "hidden", alignItems: "center", justifyItems: "center", textAlign: "center" }}>
            {Object.keys(summary.subjects).map(id => <EnemySprite key={`${id}-s`} width={48} height={48} src={idleSim.data.subjects[id].src} />)}
            {Object.keys(summary.subjects).map(id => <span key={`${id}-n`}>{idleSim.data.subjects[id].name}</span>)}
            {Object.keys(summary.subjects).map(id => <ResultBar key={`${id}-r`} counts={summary.subjects[id]} keys={["good", "avg", "bad"]} height={CELL_HEIGHT / 2} />)}
            {Object.keys(summary.subjects).map(id => <span key={`${id}-m`} style={{ fontSize: "0.8rem" }}>XP/h: {formatNumber(((summary.subjects[id].good ?? 0) * 2 + (summary.subjects[id].avg ?? 0)) / summary.ticks)}</span>)}
            {Object.keys(summary.subjects).map(id => <span key={`${id}-m`} style={{ fontSize: "0.8rem" }}>Ahn/h: {formatNumber(summary.subjects[id].currency / summary.ticks)}</span>)}
        </div>
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
                        <span style={{ fontSize: "0.8rem" }}>XP/h: {formatNumber(agent.xp / summary.ticks)}</span>
                        <span style={{ fontSize: "0.8rem" }}>Ahn/h: {formatNumber(agent.currency / summary.ticks)}</span>
                    </div>
                    {agent.cells.map((cell, i) => <div key={i}
                        style={{
                            height: CELL_HEIGHT, borderRadius: "0.2rem",
                            backgroundColor: cell ? TICK_COLORS[cell.entryType] : "transparent",
                            backgroundImage: ["incapacitated", "panic", "down"].includes(cell?.entryType) ? STRIPES : undefined,
                        }}
                        {...(cell ? getGeneralTooltipProps(cell.subject_id ? `${idleSim.data.subjects[cell.subject_id].name}: ${workTypeLabel(cell.entryType)}, +${toCurrencyStr(cell.currency)}` : workTypeLabel(cell.entryType)) : {})}
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
    const [from, to] = getReportRange(idleSim.state, interval);
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