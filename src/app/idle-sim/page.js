"use client";

import { useMemo } from "react";

import AgentsTab from "./AgentsTab";
import ExpeditionTab from "./ExpeditionTab";
import FacilityTab from "./FacilityTab";
import HiringTab from "./HiringTab";
import styles from "./idleSim.module.css";
import { IdleSimTooltip } from "./idleSimTooltip";
import IntroScreen from "./IntroScreen";
import InventoryTab from "./InventoryTab";
import ManualTab from "./ManualTab";
import QuestBar from "./QuestBar";
import ReportsTab from "./ReportTab";
import SettingsTab from "./SettingsTab";
import SubjectsTab from "./SubjectsTab";
import useIdleSim from "./useIdleSim";
import { toCurrencyStr } from "./util";
import NitroAd from "../components/ads/NitroAd";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { uiColors } from "../lib/colors";

function DevPanel({ idleSim }) {
    if (process.env.NODE_ENV !== "development") return null;
    return <div className={styles.tile}>
        {idleSim.error &&
            <span>Error: {idleSim.error}</span>
        }

        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
            <span>Game Tick: {idleSim.state?.game_tick}</span>
            <button onClick={() => idleSim.forceTick()}>Advance Game Time</button>
            <button onClick={() => idleSim.resetGame()}>Reset Game</button>
        </div>
    </div>
}

export default function IdleSimPage() {
    const idleSim = useIdleSim();

    const tab = idleSim.uiState.tab;
    const setTab = tab => idleSim.setUiState({ tab });

    const agentsUnspentPoints = useMemo(() => {
        if (!idleSim.loaded) return false;
        return Object.values(idleSim.state.agents).some(agent => agent.unspent_points > 0);
    }, [idleSim]);

    if (idleSim.uiState.intro)
        return <IntroScreen idleSim={idleSim} />

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <NitroAd id={"minigame-top-ad"} height={90} adLevel={"min"} style={{ width: "100%" }} />

        <div style={{ width: "100%", textAlign: "center", fontSize: "1.6rem", fontWeight: "bold", letterSpacing: "1px", padding: "1rem 0" }}>
            L.C. Idle Management Simulator
        </div>

        <DevPanel idleSim={idleSim} />

        {idleSim.loaded && <>
            <div className={styles.tile} style={{ flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <div style={{ display: "flex", gap: "1rem" }}>
                    <span>Money: {toCurrencyStr(idleSim.state.currency)}</span>
                    {idleSim.lastSaved ? <span>Last Saved: {idleSim.lastSaved.toLocaleString()}</span> : null}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <button onClick={() => idleSim.updateUiState({ intro: true })}>
                        Notices
                    </button>

                    <button
                        onClick={() => idleSim.updateUiState({ tab: "hiring" })}
                        style={{ borderColor: idleSim.state.hiring ? uiColors.green : undefined, fontWeight: idleSim.state.hiring ? "bold" : undefined }}
                        {...getGeneralTooltipProps(
                            idleSim.state.hiring
                                ? "Candidates are currently generated and waiting to be chosen."
                                : "Hire a new agent to work in departments or deploy on expeditions."
                        )}
                    >
                        {idleSim.state.hiring ? "Resume Hiring" : "Hire Agent"}
                    </button>

                    <button onClick={() => idleSim.saveGame()}
                        {...getGeneralTooltipProps("Your game is automatically saved every 5 minutes or whenever a time block is simulated. Use this to manually save any changes you've made. The game will try to autosave changes when leaving this page, but this may not always work.")}
                    >
                        Save Game
                    </button>
                </div>
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
                <div className={`tab-header ${tab === "agents" ? "active" : ""}`} onClick={() => setTab("agents")} style={{ position: "relative" }}
                    {...getGeneralTooltipProps("Manage your agents.\nHire agents, equip them with gear, and assign stat points from leveling up.")}
                >
                    {agentsUnspentPoints &&
                        <div style={{ position: "absolute", width: "10px", height: "10px", background: uiColors.red, top: "0px", right: "-10px", borderRadius: "50%", zIndex: 5 }} />
                    }
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
            {tab === "hiring" && <HiringTab idleSim={idleSim} />}
            {tab === "subjects" && <SubjectsTab idleSim={idleSim} />}
            {tab === "inventory" && <InventoryTab idleSim={idleSim} />}
            {tab === "expedition" && <ExpeditionTab idleSim={idleSim} />}
            {tab === "settings" && <SettingsTab idleSim={idleSim} />}
            {tab === "manual" && <ManualTab />}
        </>}

        <IdleSimTooltip idleSim={idleSim} />
    </div>
}