import { PencilIcon } from "@heroicons/react/24/solid";
import React, { useEffect, useMemo, useState } from "react";

import { StatTable } from "./components";
import { CATCHUP_LEVEL_GAP, HP_PER_LEVEL, MIN_SP, START_HP, START_WE, WE_PER_LEVEL } from "./constants";
import { findAgentDepartment } from "./facility";
import { gearTypeToText, getAgentEffectiveStats, getEquippedCopies, getOwnedCopies } from "./gear";
import { getAgentHireCost, getMaxStartLevel, getRerollCost } from "./hiring";
import { GiftSprite } from "./icons";
import styles from "./idleSim.module.css";
import { getIdleSimTooltipProps } from "./idleSimTooltip";
import { agentXpToNext, findAgentExpedition, sum, toCurrencyStr } from "./util";
import Icon from "../components/icons/Icon";
import KeywordIcon from "../components/icons/KeywordIcon";
import NumberInput from "../components/objects/NumberInput";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { uiColors } from "../lib/colors";
import { affinities } from "../lib/constants";

function HiringScreen({ idleSim }) {
    const hiring = idleSim.state.hiring;
    const [level, setLevel] = useState(1);

    if (hiring) {
        return <>
            <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <span className="hover-text"
                {...getGeneralTooltipProps(`You can hire agents up to ${CATCHUP_LEVEL_GAP} levels below your highest leveled agent. Higher leveled agents cost more to hire.`)}
            >
                Starting Level:
            </span>
            <NumberInput min={1} max={getMaxStartLevel(idleSim.state)} value={level} onChange={setLevel} style={{ width: "3ch" }} />
        </div>
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
            if (department) return [id, department.label];
            const expedition = findAgentExpedition(idleSim.state, id);
            if (expedition) return [id, idleSim.data.expeditions[expedition.expedition_id].name];
            return [id, "Idle"];
        })),
        [idleSim.state, idleSim.data]);

    const [statToggle, setStatToggle] = useState(false);
    const [pointsSpent, setPointsSpent] = useState(null);
    const [assignGear, setAssignGear] = useState(null);
    const assignGearType = useMemo(() => assignGear ? assignGear.split("-")[0] : null, [assignGear]);
    const [currentGear, setCurrentGear] = useState(null);
    const [selectedGear, setSelectedGear] = useState(null);

    const [editingName, setEditingName] = useState(false);
    const [name, setName] = useState("");

    const equippable = useMemo(() => {
        if (!assignGearType) return null;
        return Object.keys(idleSim.state.inventory[assignGearType])
            .filter(id => getEquippedCopies(idleSim.state, assignGearType, id) < getOwnedCopies(idleSim.state, assignGearType, id));
    }, [idleSim.state, assignGearType])

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStatToggle(false);
        setAssignGear(null);
        setSelectedGear(null);
    }, [idleSim.uiState.agent]);

    const gearData = assignGearType && selectedGear ? idleSim.data[assignGearType][selectedGear] : null;

    const handleSelectAgent = id => {
        if (idleSim.uiState.agent === id) idleSim.updateUiState({ agent: null });
        else {
            idleSim.updateUiState({ agent: id });
            setEditingName(false);
        }
    }

    return <>
        <div style={{ display: "flex" }}>
            <button onClick={() => idleSim.updateUiState({ hiring: true })}>{idleSim.state.hiring ? "Resume Hiring" : "Hire New Agent"}</button>
        </div>
        {Object.values(idleSim.state.agents).map(agent => {
            const stats = getAgentEffectiveStats(idleSim.data, idleSim.state, agent);
            const className = `${styles.clickableTile} ${styles.agentTile} ${agent.hp <= 0 ? styles.incapacitated : agent.sp <= MIN_SP ? styles.panic : null}`

            return <React.Fragment key={agent.id}>
                <div className={className} onClick={() => handleSelectAgent(agent.id)} style={{ position: "relative", width: "100%", maxWidth: "600px" }}>
                    {agent.unspent_points > 0 &&
                        <div style={{ position: "absolute", width: "10px", height: "10px", background: uiColors.red, top: "5px", right: "5px", borderRadius: "50%", zIndex: 5 }} />
                    }

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
                        <div style={{ display: "flex", gap: "0.2rem" }}>
                            {editingName ? <>
                                <input value={name} onChange={e => setName(e.target.value)} />
                                <button onClick={() => { setEditingName(false); idleSim.renameAgent(agent.id, name); }} style={{ padding: "2px" }}>
                                    ✔
                                </button>
                                <button onClick={() => { setEditingName(false); setName(""); }} style={{ padding: "2px" }}>
                                    ✘
                                </button>
                            </> : <>
                                <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{agent.name}</span>
                                <button onClick={() => { setEditingName(true); setName(agent.name); }} style={{ padding: "2px" }}>
                                    <PencilIcon style={{ width: "16px", height: "16px" }} />
                                </button>
                            </>
                            }
                        </div>
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
                                                    <button key={`${x}-down`} disabled={pointsSpent[i] <= 0}
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

                            <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: "0.2rem" }}>
                                <div style={{ display: "flex", gap: "0.2rem" }}>
                                    <div className={styles.clickableTile} style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                                        onClick={() => {
                                            if (assignGearType === "weapons") { setAssignGear(null); return; }
                                            setAssignGear("weapons"); setSelectedGear(agent.weapon); setCurrentGear(agent.weapon);
                                        }}
                                        {...(agent.weapon ? getIdleSimTooltipProps("weapons", agent.weapon) : {})}
                                    >
                                        <Icon path={"offense level"} size={32} />
                                        {agent.weapon ? idleSim.data.weapons[agent.weapon].name : "None"}
                                    </div>
                                    <div className={styles.clickableTile} style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
                                        onClick={() => {
                                            if (assignGearType === "armor") { setAssignGear(null); return; }
                                            setAssignGear("armor"); setSelectedGear(agent.armor); setCurrentGear(agent.armor);
                                        }}
                                        {...(agent.armor ? getIdleSimTooltipProps("armor", agent.armor) : {})}
                                    >
                                        <Icon path={"defense level"} size={32} />
                                        {agent.armor ? idleSim.data.armor[agent.armor].name : "None"}
                                    </div>
                                </div>
                                <div style={{ display: "flex", gap: "0.2rem" }}>
                                    {Array.from({ length: 5 }, (x, i) =>
                                        <div key={i} className={styles.clickableTile} style={{ width: "64px", height: "64px", alignItems: "center", justifyContent: "center" }}
                                            onClick={() => {
                                                if (assignGearType === "gifts") { setAssignGear(null); return; }
                                                setAssignGear(`gifts-${i}`); setSelectedGear(agent.gifts[i]); setCurrentGear(agent.gifts[i]);
                                            }}
                                            {...(agent.gifts[i] ? getIdleSimTooltipProps("gifts", agent.gifts[i]) : {})}
                                        >
                                            {agent.gifts[i] ?
                                                <GiftSprite width={64} height={64} src={idleSim.data.gifts[agent.gifts[i]].src} /> :
                                                "None"
                                            }
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {
                            assignGear && <>
                                <div style={{ width: "100%", border: "1px var(--primary-border-color) solid", margin: "2px 0" }} />
                                {equippable.length > 0 || currentGear ?
                                    <div style={{ display: "flex", gap: "0.2rem", height: "100%" }}>
                                        <div style={{ display: "flex", flexDirection: "column", maxHeight: "600px", overflowY: "auto", overflowX: "hidden", paddingRight: "0.2rem", borderRight: "1px var(--primary-border-color) solid" }}>
                                            {currentGear && <div className={styles.clickableTile} onClick={() => setSelectedGear(currentGear)}>
                                                {idleSim.data[assignGearType][currentGear].name}
                                            </div>}
                                            {equippable.map(id => <div key={id} className={styles.clickableTile} onClick={() => setSelectedGear(id)}>
                                                {idleSim.data[assignGearType][id].name}
                                            </div>)}
                                        </div>

                                        {assignGearType === "gifts" && selectedGear &&
                                            <GiftSprite width={100} height={100} src={idleSim.data.gifts[selectedGear].src} />
                                        }

                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                            {selectedGear && <>
                                                <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{gearData.name}</span>
                                                {assignGearType !== "gifts" && <StatTable data={gearData} />}
                                                <span style={{ maxWidth: "450px" }}>{gearData.desc}</span>
                                                <div className={styles.clickableTile} style={{ alignSelf: "center", marginTop: "0.5rem" }}
                                                    onClick={() => {
                                                        if (selectedGear === currentGear) idleSim.unequipGear(agent.id, assignGearType, selectedGear);
                                                        else idleSim.equipGear(agent.id, assignGearType, selectedGear);
                                                        setAssignGear(null); setSelectedGear(null);
                                                    }}
                                                >
                                                    {selectedGear === currentGear ? "Unequip" : "Equip"}
                                                </div>
                                            </>}
                                        </div>

                                    </div> :
                                    <div style={{ textAlign: "center", padding: "0.5rem" }}>
                                        No Available {gearTypeToText(assignGearType)}
                                    </div>
                                }
                            </>
                        }
                    </div>
                }
            </React.Fragment>
        })}
    </>
}

export default function AgentsTab({ idleSim }) {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "100%" }}>
        {idleSim.uiState.hiring ?
            <HiringScreen idleSim={idleSim} /> :
            <AgentsScreen idleSim={idleSim} />
        }
    </div>;
}