import React from "react";

import styles from "./idleSim.module.css";
import { getReportEventText } from "./reports";
import { formatNumber, toCurrencyStr } from "./util";

function FacilityStatus({ idleSim }) {
    const summary = idleSim.catchupSummary;

    if (!idleSim.loaded)
        return <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0" }}>
            <span style={{ display: "inline-block", animation: "pulse 1.5s infinite" }}>●</span>
            <span>Synchronizing facility records & resolving offline time...</span>
        </div>

    if (summary && summary.ticks > 0)
        return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", padding: "0.75rem", borderRadius: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                Offline Catch-up Complete: {summary.ticks} {summary.ticks === 1 ? "hour" : "hours"} Simulated
            </div>
            <div style={{ display: "flex", gap: "2rem", fontSize: "0.95rem" }}>
                <span>Revenue: <strong>+{toCurrencyStr(summary.totals.currency)}</strong></span>
                <span>Agent XP: <strong>+{formatNumber(summary.totals.xp)}</strong></span>
            </div>

            {summary.events.notable.length > 0 &&
                <div style={{ fontSize: "0.85rem", marginTop: "0.3rem" }}>
                    <span style={{ opacity: 0.8 }}>Recorded Events:</span>
                    <ul style={{ margin: "0.3rem 0 0 1.2rem", padding: 0 }}>
                        {summary.events.notable.slice(-5).map((e, idx) =>
                            <li key={idx} style={{ margin: "0.2rem 0" }}>
                                {getReportEventText(idleSim.data, idleSim.state, e).text}
                            </li>
                        )}
                        {summary.events.notable.length > 5 && (
                            <li style={{ opacity: 0.6 }}>...and {summary.events.notable.length - 5} more logged in Reports</li>
                        )}
                    </ul>
                </div>
            }
        </div>

    if (!idleSim.state || Object.keys(idleSim.state.agents).length === 0)
        return <div style={{ padding: "0.75rem", borderRadius: "0.5rem" }}>
            <strong>Welcome, our new Manager.</strong>
            <p style={{ margin: "0.4rem 0 0 0", lineHeight: "1.4" }}>
                Your facility has been initialized with 1 Department, starter research subjects, and 50,000 Ahn.<br />
                Begin by hiring agents in the top panel and assigning them work blocks in the Facility schedule.
            </p>
        </div>

    return <span>
        Facility is up to date. No offline hours have been simulated.
    </span>
}

export default function IntroScreen({ idleSim }) {
    return <div style={{
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: "850px", minHeight: "80vh",
        margin: "0 auto", gap: "1.2rem", padding: "1rem", boxSizing: "border-box"
    }}>
        <div className={styles.tile} style={{ width: "100%", textAlign: "center", gap: "0.3rem", padding: "1.2rem" }}>
            <span style={{ fontSize: "1.6rem", fontWeight: "bold", letterSpacing: "1px" }}>
                L.C. Idle Management Simulator
            </span>
        </div>

        <div className={styles.tile} style={{ width: "100%", alignItems: "stretch", gap: "0.75rem", padding: "1.2rem" }}>
            <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Facility Status</span>

            <FacilityStatus idleSim={idleSim} />
        </div>

        <div className={styles.tile} style={{ width: "100%", alignItems: "stretch", gap: "0.6rem", padding: "1.2rem" }}>
            <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Operational Disclaimers</span>
            <div>
                • <strong>Real Time Pacing:</strong> Time advances at a fixed rate of <strong>1 real world hour = 1 simulation tick</strong>. The facility simulates up to <strong>7 days (168 hours)</strong> of offline progress while you are away. This game is designed to be checked periodically, not played continuously.
            </div>
            <div>
                • <strong>Work Scheduling:</strong> Agents assigned to work will gradually lose HP and SP. Department schedules must balance work with regular breaks to recover HP and SP and avoid incapacitations.
            </div>
            <div>
                • <strong>Data & Persistence:</strong> Registered account progress is saved to the cloud and syncs across devices. Guest progress is stored locally in your browser and will be lost if site data or cache is cleared.
            </div>
            <div>
                • <strong>Game Manual:</strong> Detailed explanations of mechanics and formulas can be found in the <strong>Manual</strong> tab.
            </div>
        </div>

        <div style={{ marginTop: "0.5rem", width: "100%", display: "flex", justifyContent: "center" }}>
            <button
                disabled={!idleSim.loaded} onClick={() => idleSim.updateUiState({ intro: false })}
                style={{ fontSize: "1.15rem", fontWeight: "bold", cursor: idleSim.loaded ? "pointer" : "not-allowed" }}
            >
                {!idleSim.loaded ? "Synchronizing Facility..." : "Enter Facility"}
            </button>
        </div>
    </div>;
}