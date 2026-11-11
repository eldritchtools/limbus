import { PencilIcon } from "@heroicons/react/24/solid";
import React, { useEffect, useMemo, useState } from "react";

import { StatTable } from "./components";
import { MAX_AGENT_LEVEL, MIN_SP } from "./constants";
import { findAgentDepartment } from "./facility";
import { gearTypeToText, getAgentEffectiveStats, getEquippedCopies, getOwnedCopies } from "./gear";
import { GiftSprite } from "./icons";
import styles from "./idleSim.module.css";
import { getIdleSimTooltipProps } from "./idleSimTooltip";
import { agentXpToNext, findAgentExpedition, formatSp, sum } from "./util";
import Icon from "../components/icons/Icon";
import KeywordIcon from "../components/icons/KeywordIcon";
import { HorizontalDivider } from "../components/objects/Dividers";
import { uiColors } from "../lib/colors";
import { affinities } from "../lib/constants";

function AgentDetails({ idleSim, agent }) {
    const [statToggle, setStatToggle] = useState(false);
    const [pointsSpent, setPointsSpent] = useState(new Array(7).fill(0));
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

    const stats = getAgentEffectiveStats(idleSim.data, idleSim.state, agent, false);
    const gearData = assignGearType && selectedGear ? idleSim.data[assignGearType][selectedGear] : null;
    const xpToNext = agentXpToNext(agent.level);
    const xpPercent = Math.min(100, Math.round((agent.xp / xpToNext) * 100));

    return <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "0.2rem", border: "1px var(--primary-border-color) solid", borderRadius: "0.5rem", padding: "0.5rem", boxSizing: "border-box" }}>
        <button
            style={{ position: "absolute", border: "none", background: "transparent", color: uiColors.red, cursor: "pointer", padding: "0 2px", top: "3px", right: "3px" }}
            onClick={() => idleSim.updateUiState({ agent: null })}
        >
            ✕
        </button>

        <div style={{ display: "flex", gap: "0.2rem", justifyContent: "center" }}>
            {editingName ? <>
                <input value={name} onChange={e => {if(e.target.value.length <= 50) setName(e.target.value)}} />
                <button onClick={() => { setEditingName(false); idleSim.renameAgent(agent.id, name); }} style={{ padding: "2px", border: "none" }}>
                    ✔
                </button>
                <button onClick={() => { setEditingName(false); setName(""); }} style={{ padding: "2px", border: "none" }}>
                    ✘
                </button>
            </> : <>
                <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{agent.name}</span>
                <button onClick={() => { setEditingName(true); setName(agent.name); }} style={{ padding: "2px", border: "none" }}>
                    <PencilIcon style={{ width: "16px", height: "16px" }} />
                </button>
            </>
            }
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", gap: "1rem", justifyContent: "space-between" }}>
                    <span>Level: {agent.level}</span>
                    <span>XP: {agent.xp} / {agent.level === MAX_AGENT_LEVEL ? 0 : agentXpToNext(agent.level)} </span>
                </div>

                <div style={{ height: 3, width: "100%", background: "rgba(0,0,0,0.4)", borderRadius: 2, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${xpPercent}%`, background: "#3c9d5d" }} />
                </div>

                <div style={{ display: "flex", gap: "1rem", justifyContent: "space-between" }}>
                    <span>HP: {Math.round(agent.hp)} / {agent.max_hp}</span>
                    <span>SP: {formatSp(agent.sp)} </span>
                    <span>WE: {stats.work_efficiency}</span>
                </div>
                {!statToggle ?
                    <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                        <StatTable data={stats} />
                        <button style={{ border: "none", fontWeight: agent.unspent_points > 0 ? "bold" : null }}
                            onClick={() => { setStatToggle(p => !p); setPointsSpent(new Array(7).fill(0)); }}
                        >
                            {agent.unspent_points > 0 ? `+${agent.unspent_points}` : "↺"}
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
                                        style={{ padding: "0 4px", border: "none" }}
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
                                        style={{ padding: "0 4px", border: "none" }}
                                        onClick={() => setPointsSpent(p => p.map((x, j) => i === j ? x - 1 : x))}
                                    >∨</button>)
                                }
                            </>}
                        </div>
                        {agent.unspent_points ?
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                <button style={{ border: "none" }} onClick={() => { idleSim.assignAgentPoints(agent.id, pointsSpent); setStatToggle(false); }}>✔</button>
                                <button style={{ border: "none" }} onClick={() => { setStatToggle(false); }}>✘</button>
                            </div> :
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                <button style={{ border: "none" }} onClick={() => { setStatToggle(false); }}>↺</button>
                            </div>
                        }
                    </div>
                }
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: "0.2rem" }}>
                <div style={{ display: "flex", gap: "0.2rem" }}>
                    <div className={styles.clickableTile} style={{ flex: 1, flexDirection: "row", alignItems: "center", width: "160px" }}
                        onClick={() => {
                            if (assignGearType === "weapons") { setAssignGear(null); return; }
                            setAssignGear("weapons"); setSelectedGear(agent.weapon); setCurrentGear(agent.weapon);
                        }}
                        {...(agent.weapon ? getIdleSimTooltipProps("weapons", agent.weapon) : {})}
                    >
                        <Icon path={"offense level"} size={32} />
                        {agent.weapon ? idleSim.data.weapons[agent.weapon].name : "None"}
                    </div>
                    <div className={styles.clickableTile} style={{ flex: 1, flexDirection: "row", alignItems: "center", width: "160px" }}
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
                    {Array.from({ length: 5 }, (x, i) => {
                        const giftId = agent.gifts[i];
                        const isSelected = assignGear === `gifts-${i}`;

                        return <div key={i} className={styles.clickableTile} style={{ width: "64px", height: "64px", alignItems: "center", justifyContent: "center", borderColor: isSelected ? "var(--secondary-border-color)" : undefined }}
                            onClick={() => {
                                if (assignGearType === "gifts") { setAssignGear(null); return; }
                                setAssignGear(`gifts-${i}`); setSelectedGear(giftId); setCurrentGear(giftId);
                            }}
                            {...(giftId ? getIdleSimTooltipProps("gifts", giftId) : {})}
                        >
                            {giftId ?
                                <GiftSprite width={64} height={64} src={idleSim.data.gifts[giftId].src} /> :
                                <span style={{ fontSize: "0.9rem", opacity: 0.8 }}>
                                    None
                                </span>
                            }
                        </div>
                    })}
                </div>
            </div>
        </div>

        {
            assignGear && <>
                <div style={{ width: "100%", border: "1px var(--primary-border-color) solid", margin: "4px 0" }} />

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%", padding: "0 0.2rem" }}>
                    <span style={{ fontWeight: "bold" }}>
                        Assigning {gearTypeToText(assignGearType)}
                    </span>
                    <button
                        onClick={() => { setAssignGear(null); setSelectedGear(null); }}
                        style={{ border: "none", background: "transparent", cursor: "pointer", color: uiColors.red }}
                    >
                        ✕
                    </button>
                </div>

                {equippable.length > 0 || currentGear ?
                    <div style={{ display: "flex", gap: "0.2rem", height: "100%", minHeight: "160px" }}>
                        <div style={{ display: "flex", flexDirection: "column", maxHeight: "400px", overflowY: "auto", overflowX: "hidden", paddingRight: "0.4rem", borderRight: "1px var(--primary-border-color) solid", minWidth: "180px", gap: "0.2rem" }}>
                            {currentGear && <div className={styles.clickableTile} onClick={() => setSelectedGear(currentGear)}
                                style={{ background: selectedGear === currentGear ? "var(--bg-hover)" : undefined }}
                            >
                                <span>{idleSim.data[assignGearType][currentGear].name}</span>
                                <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>(Equipped)</span>
                            </div>}
                            {equippable.filter(id => id !== currentGear)
                                .map(id => {
                                    const isSelected = selectedGear === id;
                                    const totalOwned = getOwnedCopies(idleSim.state, assignGearType, id);
                                    const equipped = getEquippedCopies(idleSim.state, assignGearType, id);
                                    const available = totalOwned - equipped;

                                    return <div key={id} className={styles.clickableTile} onClick={() => setSelectedGear(id)}
                                        style={{ background: isSelected ? "var(--bg-hover)" : undefined }}
                                    >
                                        <span>{idleSim.data[assignGearType][id].name}</span>
                                        {available > 1 && (
                                            <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>({available} available)</span>
                                        )}
                                    </div>
                                })
                            }
                        </div>

                        {assignGearType === "gifts" && selectedGear &&
                            <GiftSprite width={100} height={100} src={idleSim.data.gifts[selectedGear].src} />
                        }

                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", flex: 1 }}>
                            {selectedGear && gearData && <>
                                <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                                    <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{gearData.name}</span>
                                    <button style={{ border: "none" }} onClick={() => idleSim.setUiState({ tab: "inventory", invTab: assignGearType, item: selectedGear })}>
                                        ↗
                                    </button>
                                </div>
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

    const handleSelectAgent = id => {
        if (idleSim.uiState.agent === id) idleSim.updateUiState({ agent: null });
        else idleSim.updateUiState({ agent: id });
    }

    const selectedAgent = idleSim.uiState.agent ? idleSim.state.agents[idleSim.uiState.agent] : null;

    return <>
        {selectedAgent && <>
            <AgentDetails idleSim={idleSim} agent={selectedAgent} />
            <HorizontalDivider />
        </>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, 600px)", gap: "0.4rem", maxWidth: "100%" }}>
            {Object.values(idleSim.state.agents).map(agent => {
                const stats = getAgentEffectiveStats(idleSim.data, idleSim.state, agent, false);
                const isIncap = agent.hp <= 0;
                const isPanic = agent.sp <= MIN_SP;
                const className = `${styles.clickableTile} ${styles.agentTile} ${agent.hp <= 0 ? styles.incapacitated : agent.sp <= MIN_SP ? styles.panic : null}`

                const incapStatus = agent.statuses.find(x => x.type === "incapacitated");
                const panicStatus = agent.statuses.find(x => x.type === "panic");
                let statusTag = null;
                if (isIncap) {
                    const hours = incapStatus ? Math.max(0, incapStatus.until - idleSim.state.game_tick) : 0;
                    statusTag = <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>Incapacitated ({hours}h)</span>;
                } else if (isPanic) {
                    const hours = panicStatus ? Math.max(0, panicStatus.until - idleSim.state.game_tick) : 0;
                    const label = panicStatus.id === "corrosion" ? "Corroded" : "Panicked";
                    statusTag = <span style={{ fontSize: "0.9rem", fontWeight: "bold" }}>{label} ({hours}h)</span>;
                }

                const xpToNext = agentXpToNext(agent.level);
                const xpPercent = Math.min(100, Math.round((agent.xp / xpToNext) * 100));

                const statuses = agent.statuses.map((x, i) => {
                    const st = idleSim.data.statuses[x.id];
                    if (!st) return null;
                    return `${st.name} (${x.value})`
                }).filter(Boolean);

                return <div key={agent.id} className={className} onClick={() => handleSelectAgent(agent.id)} style={{ position: "relative", width: "100%", maxWidth: "600px" }}>
                    {agent.unspent_points > 0 &&
                        <div style={{ position: "absolute", width: "10px", height: "10px", background: uiColors.red, top: "5px", right: "5px", borderRadius: "50%", zIndex: 5 }} />
                    }

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                        <span style={{ fontWeight: "bold", fontSize: "1.2rem" }}>{agent.name}</span>
                        {statusTag}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <div style={{ display: "flex", gap: "1rem" }}>
                                <span>Level: {agent.level}</span>
                                <span>HP: {Math.round(agent.hp)} / {agent.max_hp}</span>
                                <span>SP: {formatSp(agent.sp)} </span>
                                <span>WE: {stats.work_efficiency}</span>
                            </div>

                            <div style={{ height: 3, width: "100%", background: "rgba(0,0,0,0.4)", borderRadius: 2, overflow: "hidden" }}>
                                <div style={{ height: "100%", width: `${xpPercent}%`, background: "#3c9d5d" }} />
                            </div>

                            <StatTable data={stats} />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
                            <span>Assignment:</span>
                            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", maxWidth: "100px" }}>
                                {assignments[agent.id]}
                            </div>
                        </div>
                    </div>

                    {statuses.length > 0 && <>
                        <span>Statuses:</span>
                        {statuses.join(", ")}
                    </>}
                </div>
            })}
        </div>
    </>
}

export default function AgentsTab({ idleSim }) {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem", width: "100%" }}>
        <AgentsScreen idleSim={idleSim} />
    </div>;
}