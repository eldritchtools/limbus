"use client";

import AgentsTab from "./AgentsTab";
import ExpeditionTab from "./ExpeditionTab";
import FacilityTab from "./FacilityTab";
import styles from "./idleSim.module.css";
import { IdleSimTooltip } from "./idleSimTooltip";
import InventoryTab from "./InventoryTab";
import QuestBar from "./QuestBar";
import ReportsTab from "./ReportTab";
import SettingsTab from "./SettingsTab";
import SubjectsTab from "./SubjectsTab";
import useIdleSim from "./useIdleSim";
import { toCurrencyStr } from "./util";
import DragContainer from "../components/objects/DragContainer";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";

export default function IdleSimPage() {
    const idleSim = useIdleSim();

    const tab = idleSim.uiState.tab;
    const setTab = tab => idleSim.setUiState({ tab });

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        {idleSim.error &&
            <span>Error: {idleSim.error}</span>
        }

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span>Game Tick: {idleSim.state?.game_tick}</span>
            <button onClick={() => idleSim.forceTick()}>Advance Game Time</button>
            <button onClick={() => idleSim.resetGame()}>Reset Game</button>
        </div>

        {idleSim.loaded && <>
            <div className={styles.tile} style={{ flexDirection: "row", gap: "1rem" }}>
                <span>Money: {toCurrencyStr(idleSim.state.currency)}</span>
                <button onClick={() => idleSim.saveGame()}
                    {...getGeneralTooltipProps("Your game is automatically saved every 5 minutes or whenever a time block is simulated. Use this to manually save any changes you've made.")}
                >
                    Save Game
                </button>
                {idleSim.lastSaved ? <span>Last Saved: {idleSim.lastSaved.toLocaleString()}</span> : null}
            </div>
            <QuestBar idleSim={idleSim} />
        </>
        }

        <div style={{ overflowX: "auto", maxWidth: "100%" }}>
            <div style={{ display: "flex", marginBottom: "1rem", gap: "1rem", width: "max-content" }}>
                <div className={`tab-header ${tab === "reports" ? "active" : ""}`} onClick={() => setTab("reports")}>Reports</div>
                <div className={`tab-header ${tab === "facility" ? "active" : ""}`} onClick={() => setTab("facility")}>Facility</div>
                <div className={`tab-header ${tab === "agents" ? "active" : ""}`} onClick={() => setTab("agents")}>Agents</div>
                <div className={`tab-header ${tab === "subjects" ? "active" : ""}`} onClick={() => setTab("subjects")}>Research Subjects</div>
                <div className={`tab-header ${tab === "inventory" ? "active" : ""}`} onClick={() => setTab("inventory")}>Inventory</div>
                <div className={`tab-header ${tab === "expedition" ? "active" : ""}`} onClick={() => setTab("expedition")}>Expedition</div>
                <div className={`tab-header ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}>Settings</div>
            </div>
        </div>

        {idleSim.loaded && <>
            {tab === "reports" && <ReportsTab idleSim={idleSim} />}
            {tab === "facility" && <FacilityTab idleSim={idleSim} />}
            {tab === "agents" && <AgentsTab idleSim={idleSim} />}
            {tab === "subjects" && <SubjectsTab idleSim={idleSim} />}
            {tab === "inventory" && <InventoryTab idleSim={idleSim} />}
            {tab === "expedition" && <ExpeditionTab idleSim={idleSim} />}
            {tab === "settings" && <SettingsTab idleSim={idleSim} />}
        </>}

        <IdleSimTooltip idleSim={idleSim} />
    </div>
}