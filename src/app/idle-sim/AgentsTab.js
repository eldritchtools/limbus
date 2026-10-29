import React, { useMemo, useState } from "react";

import { StatTable } from "./components";
import { HP_PER_LEVEL, START_HP, START_WE, WE_PER_LEVEL } from "./constants";
import { findAgentExpedition } from "./expeditions";
import { findAgentDepartment } from "./facility";
import { getAgentEffectiveStats } from "./gear";
import { getAgentHireCost, getMaxStartLevel, getRerollCost } from "./hiring";
import { GiftSprite } from "./icons";
import styles from "./idleSim.module.css";
import { agentXpToNext, sum, toCurrencyStr } from "./util";
import Icon from "../components/icons/Icon";
import KeywordIcon from "../components/icons/KeywordIcon";
import NumberInput from "../components/objects/NumberInput";
import { affinities } from "../lib/constants";

function HiringScreen({ idleSim }) {
    const hiring = idleSim.state.hiring;
    const [level, setLevel] = useState(1);

    if (hiring) {
        return <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span>Choose an agent:</span>
                <button
                    style={{ display: "flex", flexDirection: "column", textAlign: "center" }}
                    onClick={() => idleSim.rerollCandidates()}
                >
                    <span>Reroll Candidates</span>
                    <span>{toCurrencyStr(getRerollCost(idleSim.state, hiring.start_level))}</span>
                </button>
            </div>
            {hiring.candidates.map((candidate, i) =>
                <div key={i} className={styles.clickableTile} style={{ gap: "0.5rem" }}
                    onClick={() => { idleSim.chooseCandidate(i); idleSim.updateUiState({ hiring: false }) }}
                >
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <span>Level: {hiring.start_level}</span>
                        <span>Max HP: {START_HP + (hiring.start_level - 1) * HP_PER_LEVEL}</span>
                        <span>WE: {START_WE + (hiring.start_level - 1) * WE_PER_LEVEL}</span>
                    </div>
                    <StatTable data={candidate} />
                </div>
            )}
        </>
    }

    return <>
        <span>Starting Level: <NumberInput min={1} max={getMaxStartLevel(idleSim.state)} value={level} onChange={setLevel} style={{ width: "3ch" }} /></span>
        <span>Cost: {toCurrencyStr(getAgentHireCost(idleSim.state, level))}</span>
        <div style={{ display: "flex", gap: "0.5rem" }}>
            <button onClick={() => idleSim.updateUiState({ hiring: false })}>Cancel</button>
            <button onClick={() => idleSim.startHiring(level)}>Hire Agent</button>
        </div>
    </>
}

function AgentsScreen({ idleSim }) {
    const assignments = useMemo(() =>
        Object.fromEntries(Object.values(idleSim.state.agents).map(({ id }) => {
            const department = findAgentDepartment(idleSim.state, id);
            if (department) return [id, department.name];
            const expedition = findAgentExpedition(idleSim.state, id);
            if (expedition) return [id, idleSim.data.expeditions[expedition.expedition_id].name];
            return [id, "Idle"];
        })),
        [idleSim.state, idleSim.data]);

    const handleSelectAgent = id => {
        if (idleSim.uiState.agent === id) idleSim.updateUiState({ agent: null });
        else idleSim.updateUiState({ agent: id })
    }

    const [statToggle, setStatToggle] = useState(false);
    const [pointsSpent, setPointsSpent] = useState(null);
    const [assignGear, setAssignGear] = useState(null);
    const [selectedGear, setSelectedGear] = useState(null);

    return <>
        <div style={{ display: "flex" }}>
            <button onClick={() => idleSim.updateUiState({ hiring: true })}>Hire New Agent</button>
        </div>
        {Object.values(idleSim.state.agents).map(agent => {
            const stats = getAgentEffectiveStats(idleSim.data, idleSim.state, agent);

            return <React.Fragment key={agent.id}>
                <div className={styles.clickableTile} onClick={() => handleSelectAgent(agent.id)}>
                    <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{agent.name}</span>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <span>Level: {agent.level}</span>
                                <span>HP: {agent.hp} / {agent.max_hp}</span>
                                <span>SP: {agent.sp} </span>
                                <span>WE: {stats.work_efficiency}</span>
                            </div>
                            <StatTable data={stats} />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                            <span>Assignment:</span>
                            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                {assignments[agent.id]}
                            </div>
                        </div>
                    </div>
                </div>
                {idleSim.uiState.agent === agent.id &&
                    <div style={{ display: "flex", flexDirection: "column", border: "1px var(--primary-border-color) solid", borderRadius: "0.5rem", padding: "0.5rem", boxSizing: "border-box" }}>
                        <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{agent.name}</span>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                                    <span>Level: {agent.level}</span>
                                    <span>XP: {agent.xp} / {agentXpToNext(agent.level)} </span>
                                </div>
                                <div style={{ display: "flex", gap: "1rem", justifyContent: "center" }}>
                                    <span>HP: {agent.hp} / {agent.max_hp}</span>
                                    <span>SP: {agent.sp} </span>
                                    <span>WE: {stats.work_efficiency}</span>
                                </div>
                                {!statToggle ?
                                    <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                                        <StatTable data={stats} />
                                        <button onClick={() => { setStatToggle(p => !p); setPointsSpent([0, 0, 0, 0, 0, 0, 0]); }}>
                                            {agent.unspent_points ? `+${agent.unspent_points}` : "↺"}
                                        </button>
                                    </div> :
                                    <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                                        <div style={{ display: "grid", gridTemplateColumns: "repeat(8, auto)", gap: "0.1rem", alignItems: "center", justifyItems: "center" }}>
                                            <div />
                                            {affinities.map(x => <KeywordIcon key={x} id={x} size={32} />)}

                                            {agent.unspent_points > 0 && <>
                                                <div />
                                                {affinities.map((x, i) =>
                                                    <button key={`${x}-up`} disabled={sum(pointsSpent) >= agent.unspent_points}
                                                        style={{ padding: "0 4px" }}
                                                        onClick={() => setPointsSpent(p => p.map((x, j) => i === j ? x + 1 : x))}
                                                    >∧</button>)
                                                }
                                            </>}

                                            <Icon path={"offense level"} size={32} />
                                            {agent.offense.map((x, i) =>
                                                <span key={`off-${i}`}>{x + pointsSpent[i]}</span>
                                            )}

                                            {agent.unspent_points > 0 && <>
                                                <div />
                                                {affinities.map((x, i) =>
                                                    <button key={`${x}-up`} disabled={pointsSpent[i] <= 0}
                                                        style={{ padding: "0 4px" }}
                                                        onClick={() => setPointsSpent(p => p.map((x, j) => i === j ? x - 1 : x))}
                                                    >∨</button>)
                                                }
                                            </>}
                                        </div>
                                        {agent.unspent_points ?
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                                <button onClick={() => { idleSim.assignAgentPoints(agent.id, pointsSpent); setStatToggle(false); }}>✔</button>
                                                <button onClick={() => { setStatToggle(false); }}>✘</button>
                                            </div> :
                                            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                                <button onClick={() => { setStatToggle(false); }}>↺</button>
                                            </div>
                                        }
                                    </div>
                                }
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <div className={styles.clickableTile} style={{ alignItems: "center", justifyContent: "center" }} onClick={() => setAssignGear("weapons")}>
                                        <Icon path={"offense level"} size={32} />
                                        {agent.weapon ? idleSim.data.weapons[agent.weapon].name : "None"}
                                    </div>
                                    <div className={styles.clickableTile} style={{ alignItems: "center", justifyContent: "center" }} onClick={() => setAssignGear("armor")}>
                                        <Icon path={"defense level"} size={32} />
                                        {agent.armor ? idleSim.data.armor[agent.armor].name : "None"}
                                    </div>
                                </div>
                                {Array.from({ length: 5 }, (x, i) =>
                                    <div key={i} className={styles.clickableTile} style={{ width: "64px", height: "64px", alignItems: "center", justifyContent: "center" }} onClick={() => setAssignGear(`gifts-${i}`)}>
                                        {agent.gifts[i] ?
                                            <GiftSprite width={64} height={64} src={idleSim.data.gifts[agent.gifts[i]].src} /> :
                                            "None"
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                        {/* agent.statuses */}
                        {
                            assignGear && <>
                                <div style={{ width: "100%", border: "1px var(--primary-border-color) solid", margin: "2px 0" }} />
                                <span>Assigning {assignGear}</span>
                            </>
                        }
                    </div>
                }
            </React.Fragment>
        })}
    </>
}

export default function AgentsTab({ idleSim }) {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
        {idleSim.uiState.hiring ?
            <HiringScreen idleSim={idleSim} /> :
            <AgentsScreen idleSim={idleSim} />
        }
    </div>;
}