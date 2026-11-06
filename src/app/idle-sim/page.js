"use client";

import AgentsTab from "./AgentsTab";
import ExpeditionTab from "./ExpeditionTab";
import FacilityTab from "./FacilityTab";
import styles from "./idleSim.module.css";
import { IdleSimTooltip } from "./idleSimTooltip";
import InventoryTab from "./InventoryTab";
import ManualTab from "./ManualTab";
import QuestBar from "./QuestBar";
import ReportsTab from "./ReportTab";
import SettingsTab from "./SettingsTab";
import SubjectsTab from "./SubjectsTab";
import useIdleSim from "./useIdleSim";
import { toCurrencyStr } from "./util";
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
                <div className={`tab-header ${tab === "reports" ? "active" : ""}`} onClick={() => setTab("reports")}
                    {...getGeneralTooltipProps("Check how efficiently your facility is running.\nView a summary of work results, events, and XP and Ahn earned.")}
                >
                    Reports
                </div>
                <div className={`tab-header ${tab === "facility" ? "active" : ""}`} onClick={() => setTab("facility")}
                    {...getGeneralTooltipProps("Manage your facility.\nAssign subjects and agents to departments and plan out their schedules.")}
                >
                    Facility
                </div>
                <div className={`tab-header ${tab === "agents" ? "active" : ""}`} onClick={() => setTab("agents")}
                    {...getGeneralTooltipProps("Manage your agents.\nHire agents, equip them with gear, and assign stat points from leveling up.")}
                >
                    Agents
                </div>
                <div className={`tab-header ${tab === "subjects" ? "active" : ""}`} onClick={() => setTab("subjects")}
                    {...getGeneralTooltipProps("View your available research subjects.\nCheck their stats, mechanics, current research levels and what they can unlock.")}
                >
                    Research Subjects
                </div>
                <div className={`tab-header ${tab === "inventory" ? "active" : ""}`} onClick={() => setTab("inventory")}
                    {...getGeneralTooltipProps("View your available gear.\nCheck their stats and mechanics. Also buy purchaseable gear that you have unlocked.")}
                >
                    Inventory
                </div>
                <div className={`tab-header ${tab === "expedition" ? "active" : ""}`} onClick={() => setTab("expedition")}
                    {...getGeneralTooltipProps("Spend money to send agents out on expeditions.\nSuccessful expeditions can give XP, gear, and unlock new Research Subjects.")}
                >
                    Expedition
                </div>
                <div className={`tab-header ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}
                    {...getGeneralTooltipProps("Adjust some optional game settings.")}
                >
                    Settings
                </div>
                <div className={`tab-header ${tab === "manual" ? "active" : ""}`} onClick={() => setTab("manual")}
                    {...getGeneralTooltipProps("View details for how the game works.")}
                >
                    Manual
                </div>
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
            {tab === "manual" && <ManualTab />}
        </>}

        <IdleSimTooltip idleSim={idleSim} />
    </div>
}