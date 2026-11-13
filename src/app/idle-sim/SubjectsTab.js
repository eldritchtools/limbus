import React, { useMemo, useState } from "react";

import { StatTable } from "./components";
import { OUTCOMES } from "./constants";
import { checkExpeditionUnlocked } from "./expeditions";
import { gearTypeToText, getSubjectGearUnlocks } from "./gear";
import { EnemySprite } from "./icons";
import styles from "./idleSim.module.css";
import { researchXpToNext } from "./util";
import DropdownButton from "../components/objects/DropdownButton";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { uiColors } from "../lib/colors";

function getSource(data, state, subjectId) {
    for (const [id, exp] of Object.entries(data.expeditions ?? {})) {
        if (exp.first_clear_reward?.subjects?.includes(subjectId)) {
            const unlocked = checkExpeditionUnlocked(data, state, id);
            return { id, name: unlocked ? exp.name : "???", unlocked };
        }
    }
    return null;
}

function Subject({ idleSim }) {
    const subjectId = idleSim.uiState.subject;
    const subjectData = idleSim.data.subjects[subjectId];
    const subjectState = idleSim.state.subjects[subjectId];

    const unlocks = subjectState ? getSubjectGearUnlocks(idleSim.data, subjectId) : null;
    const assignment = idleSim.state.departments.findIndex(dept => dept.subject_ids.some(id => id === subjectId));
    const source = !subjectState ? getSource(idleSim.data, idleSim.state, subjectId) : null;

    const xpToNext = subjectState ? researchXpToNext(subjectState.research_level) : 1;
    const xpPercent = subjectState
        ? (subjectState.research_level >= subjectData.max_level ? 100 : Math.min(100, Math.round((subjectState.research_xp / xpToNext) * 100)))
        : 0;

    return <>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "center" }}>
            <div className={styles.tile} style={{ position: "relative", flex: 1, minWidth: "320px", maxWidth: "380px", gap: "0.6rem" }}>
                <button
                    style={{ position: "absolute", border: "none", background: "transparent", color: uiColors.red, cursor: "pointer", padding: "0 2px", top: "3px", right: "3px" }}
                    onClick={() => idleSim.updateUiState({ subject: null })}
                >
                    ✕
                </button>

                <EnemySprite width={200} height={200} src={subjectData.src} style={{ filter: subjectState ? "" : "brightness(0)" }} />
                <span style={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>{subjectState ? subjectData.name : "???"}</span>
                {subjectState ? <>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem", width: "100%", textAlign: "center" }}>
                        <div className={styles.tile} style={{ padding: "0.4rem" }}
                            {...getGeneralTooltipProps("Work Efficiency Requirement\nEstimated effective work efficiency expected from the agent doing work on this subject to achieve good results.")}
                        >
                            <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>WE Requirement</span>
                            <span style={{ fontSize: "1.3rem", fontWeight: "bold" }}>{subjectData.we_req}</span>
                        </div>
                        <div className={styles.tile} style={{ padding: "0.4rem" }}
                            {...getGeneralTooltipProps("Research Level\nCurrent research level of the subject. Higher research levels give small boosts to the work efficiency of agents that work on this subject and may unlock weapons and armor for purchase.")}
                        >
                            <span style={{ fontSize: "0.8rem", opacity: 0.8 }}>Research Level</span>
                            <span style={{ fontSize: "1.3rem", fontWeight: "bold" }}>
                                {subjectState.research_level >= subjectData.max_level ? "MAX" : `Lv. ${subjectState.research_level}`}
                            </span>
                        </div>
                    </div>

                    {subjectState.research_level < subjectData.max_level && (
                        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem" }}>
                                <span>Research Progress</span>
                                <span>{subjectState.research_xp} / {xpToNext} XP ({xpPercent}%)</span>
                            </div>
                            <div style={{ width: "100%", height: "8px", background: "rgba(0,0,0,0.5)", borderRadius: "4px", overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${xpPercent}%`, background: "#3c9d5d", transition: "width 0.3s" }} />
                            </div>
                        </div>
                    )}

                    <span>{subjectData.desc}</span>
                    {(subjectData.statuses ?? []).map(st => {
                        const status = idleSim.data.statuses[st];
                        <span key={st} style={{ fontSize: "0.85rem" }}>{status.name}: {status.desc}</span>
                    })}
                </> :
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", padding: "1rem 0" }}>
                        {source && source.unlocked ?
                            <div style={{ textAlign: "center", fontSize: "0.9rem" }}>
                                <button
                                    style={{ marginTop: "0.5rem", cursor: "pointer" }}
                                    onClick={() => idleSim.updateUiState({ tab: "expedition", dispatching: true, dispatchingId: source.id })}
                                >
                                    Expedition: {source.name} ↗
                                </button>
                            </div> :
                            <span style={{ fontSize: "0.85rem", opacity: 0.7 }}>Discovery method unknown.</span>
                        }
                    </div>
                }
            </div>

            {subjectState &&
                <div className={styles.tile} style={{ flex: 1, minWidth: "320px", gap: "0.75rem", alignItems: "stretch" }}>
                    <span style={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>Stats</span>
                    <StatTable data={subjectData} />
                    <span style={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>Unlocks</span>
                    {unlocks && unlocks.length > 0 ?
                        <div style={{ display: "grid", gridTemplateColumns: "30px 40px 70px 1fr 30px", gap: "0.4rem", alignItems: "center", fontSize: "0.9rem", justifyItems: "center" }}>
                            <div />
                            <span>Req</span>
                            <span>Type</span>
                            <span>Name</span>
                            <span>Num</span>
                            {unlocks.map((unlock, i) => <React.Fragment key={i}>
                                <div>{subjectState.research_level >= unlock.level ? "✔" : ""}</div>
                                <span>{unlock.level}</span>
                                <span>{gearTypeToText(unlock.type)}</span>
                                <span
                                    style={{ cursor: "pointer", textDecoration: "underline" }}
                                    onClick={() => idleSim.updateUiState({ tab: "inventory", invTab: unlock.type, item: unlock.id })}
                                >
                                    {unlock.name}
                                </span>
                                <span>x{unlock.copies}</span>
                            </React.Fragment>)}
                        </div> :
                        <span style={{ textAlign: "center" }}>None</span>
                    }
                </div>
            }
        </div>

        {subjectState &&
            <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                <span style={{ fontWeight: "bold" }}>Facility Assignment: </span>
                {assignment >= 0 ?
                    <button style={{ border: "none" }} onClick={() => idleSim.setUiState({ tab: "facility", department: assignment })}>
                        {idleSim.state.departments[assignment]?.label} ↗
                    </button> : "Unassigned"
                }
            </div>
        }
    </>
}

function SubjectsGrid({ idleSim, subjectsList }) {
    return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "0.5rem", width: "100%" }}>
        {subjectsList.map(id => {
            const subject = idleSim.data.subjects[id];
            const owned = id in idleSim.state.subjects;
            return <div key={id} className={styles.clickableTile} onClick={() => idleSim.updateUiState({ subject: id })}>
                <EnemySprite width={150} height={150} src={subject.src} style={{ filter: owned ? "" : "brightness(0)" }} />
                <span style={{ fontWeight: "bold", fontSize: "1.2rem", textAlign: "center" }}>{owned ? subject.name : "???"}</span>
            </div>
        })}
    </div>
}

export default function SubjectsTab({ idleSim }) {
    const [filter, setFilter] = useState("all");

    const subjectsList = useMemo(() => {
        if (filter === "owned")
            return Object.keys(idleSim.state.subjects);

        if (filter === "unowned")
            return Object.entries(idleSim.data.subjects).filter(([k, v]) => !v.enemy_only && !(k in idleSim.state.subjects)).map(([k]) => k);

        if (filter === "all")
            return Object.entries(idleSim.data.subjects).filter(([, v]) => !v.enemy_only).map(([k]) => k);

        return [];
    }, [idleSim, filter]);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "100%" }}>
        {idleSim.uiState.subject ?
            <Subject idleSim={idleSim} /> :
            <>
                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    Filter:
                    <DropdownButton value={filter} setValue={setFilter}
                        options={{ owned: "Owned", unowned: "Unowned", all: "All" }}
                    />
                </div>
                <SubjectsGrid idleSim={idleSim} subjectsList={subjectsList} />
            </>
        }
    </div>;
}