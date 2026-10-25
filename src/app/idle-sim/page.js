"use client";

import { useState } from "react";

import AgentsTab from "./AgentsTab";
import ExpeditionTab from "./ExpeditionTab";
import FacilityTab from "./FacilityTab";
import ReportsTab from "./ReportTab";
import SettingsTab from "./SettingsTab";
import SubjectsTab from "./SubjectsTab";
import useIdleSim from "./useIdleSim";

export default function IdleSimPage() {
    const idleSim = useIdleSim();
    const [tab, setTab] = useState("reports");

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <span>Error: {idleSim.error}</span>

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span>Game Tick: {idleSim.state?.game_tick}</span>
            <button onClick={() => idleSim.forceTick()}>Force tick</button>
            <button onClick={() => idleSim.resetGame()}>Reset Game</button>
        </div>

        <div style={{ display: "flex", marginBottom: "1rem", gap: "1rem" }}>
            <div className={`tab-header ${tab === "reports" && "active"}`} onClick={() => setTab("reports")}>Reports</div>
            <div className={`tab-header ${tab === "facility" && "active"}`} onClick={() => setTab("facility")}>Facility</div>
            <div className={`tab-header ${tab === "agents" && "active"}`} onClick={() => setTab("agents")}>Agents</div>
            <div className={`tab-header ${tab === "subjects" && "active"}`} onClick={() => setTab("subjects")}>Research Subjects</div>
            <div className={`tab-header ${tab === "expedition" && "active"}`} onClick={() => setTab("expedition")}>Expedition</div>
            <div className={`tab-header ${tab === "settings" && "active"}`} onClick={() => setTab("settings")}>Settings</div>
        </div>

        {idleSim.loaded && <>
            {tab === "reports" && <ReportsTab idleSim={idleSim} />}
            {tab === "facility" && <FacilityTab idleSim={idleSim} />}
            {tab === "agents" && <AgentsTab idleSim={idleSim} />}
            {tab === "subjects" && <SubjectsTab idleSim={idleSim} />}
            {tab === "expedition" && <ExpeditionTab idleSim={idleSim} />}
            {tab === "settings" && <SettingsTab idleSim={idleSim} />}
        </>}
    </div>
}