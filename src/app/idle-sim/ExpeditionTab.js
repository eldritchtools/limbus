/* eslint-disable @next/next/no-img-element */
import React, { useState } from "react";

import { uiColors } from "../lib/colors";
import { ASSETS_ROOT } from "../paths";
import { StatTable } from "./components";
import { MAX_EXPEDITION_AGENTS } from "./constants";
import { canChooseEventOption, eventEffectToText, eventOptionConditionText } from "./events";
import { checkExpeditionUnlocked, expeditionRequirementsText, rewardToText } from "./expeditions";
import { getAgentEffectiveStats, getAgentGearEffectList } from "./gear";
import { EnemySprite } from "./icons";
import styles from "./idleSim.module.css";
import { getIdleSimTooltipProps } from "./idleSimTooltip";
import { AgentMenuSelector } from "./selectors";
import { toCurrencyStr } from "./util";
import KeywordIcon from "../components/icons/KeywordIcon";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";

const overlayTextStyle = { color: "#ddd", textShadow: "0 0 4px #000, 0 0 12px #000, 2px 2px 4px #000, -2px -2px 4px #000" };

function ExpeditionTileBase({ expeditionData, children }) {
    return <div className={styles.tile} style={{ position: "relative", aspectRatio: "5 / 3", padding: "0", overflow: "hidden" }}>
        <img src={`${ASSETS_ROOT}/backgrounds/${expeditionData.src}.webp`} alt={""} title={""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <span style={{ ...overlayTextStyle, position: "absolute", display: "block", left: "4px", top: "4px", fontSize: "1.2rem", fontWeight: "bold", maxWidth: "70%" }}>{expeditionData.name}</span>
        {children}
    </div>
}

function KwList({ list }) {
    if (!list) return "None";
    return list.map(kw => <KeywordIcon key={kw} id={kw} />);
}

function ExpeditionTileDispatch({ idleSim, expeditionId, setDispatchingId }) {
    const data = idleSim.data.expeditions[expeditionId];

    return <div className={styles.clickableTile} style={{ flexDirection: "row", gap: "0.5rem", width: "100%" }} onClick={() => setDispatchingId(expeditionId)}>
        <img src={`${ASSETS_ROOT}/backgrounds/${data.src}.webp`} alt={""} title={""} style={{ width: "200%", maxWidth: "200px", height: "100%", maxHeight: "120px", objectFit: "cover" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", width: "100%" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{data.name}</span>
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", textAlign: "center" }}>
                <span>Cost: {toCurrencyStr(data.cost)}</span>
                <span>Recommended Level: {data.rec_level}</span>
                <span>Recommended Agents: {data.rec_agents}</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", justifyItems: "center", textAlign: "center" }}>
                <span>Recommended Offense:</span>
                <span>Recommended Defense:</span>
                <div style={{ display: "flex", width: "auto" }}><KwList list={data.rec_offense} /></div>
                <div style={{ display: "flex", width: "auto" }}><KwList list={data.rec_defense} /></div>
            </div>
        </div>
    </div>
}

function ExpeditionTileLocked({ idleSim, expeditionId }) {
    return <div className={styles.tile} style={{ flexDirection: "row", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: "bold", marginBottom: "0.5rem" }}>???</span>
            <span>Unlock Requirements:</span>
            {expeditionRequirementsText(idleSim.data, idleSim.state, expeditionId)}
        </div>
    </div>
}

const ENEMY_LAYOUTS = {
    1: [{ x: .50, y: .82, h: .45 }],
    2: [{ x: .30, y: .82, h: .33 }, { x: .70, y: .82, h: .33 }],
    3: [{ x: .20, y: .84, h: .30 }, { x: .50, y: .68, h: .30 }, { x: .80, y: .84, h: .30 }],
    4: [{ x: .15, y: .84, h: .30 }, { x: .38, y: .68, h: .30 }, { x: .62, y: .84, h: .30 }, { x: .85, y: .68, h: .30 }],
    5: [{ x: .12, y: .84, h: .30 }, { x: .31, y: .68, h: .30 }, { x: .50, y: .84, h: .30 }, { x: .69, y: .68, h: .30 }, { x: .88, y: .84, h: .30 }],
};

function expeditionProgress(data, expeditionData, expedition) {
    const missing = [...expeditionData.waves[expedition.wave]];
    let hp = 0, max = 0;
    for (const e of expedition.enemy_state) {
        hp += e.hp;
        max += data.enemies[e.id].max_hp;
        const i = missing.indexOf(e.id);
        if (i !== -1) missing.splice(i, 1);
    }
    const missingMax = missing.reduce((t, id) => t + data.enemies[id].max_hp, 0);
    const waveProgress = hp / (max + missingMax);
    return (expedition.wave + (1 - waveProgress)) / expeditionData.waves.length;
}

function ExpeditionTileOngoing({ idleSim, expedition }) {
    const data = idleSim.data.expeditions[expedition.expedition_id];

    if (expedition.result)
        return <ExpeditionTileBase expeditionData={data}>
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem",
                position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
                background: "rgba(0, 0, 0, 0.6)", padding: "0.5rem", borderRadius: "1rem"
            }}>
                <span>Result: {expedition.result === "cleared" ?
                    <span style={{ color: uiColors.green }}>SUCCESS</span> :
                    <span style={{ color: uiColors.red }}>FAILED</span>
                }</span>

                {expedition.result === "cleared" ? <>
                    <span>Rewards:</span>
                    {expedition.rewards.map((reward, i) => <span key={i}>{rewardToText(idleSim.data, idleSim.state, reward)}</span>)}
                </> : <>
                    All agents have been incapacitated.
                </>}

                <div className={styles.clickableTile}
                    onClick={() => idleSim.claimExpedition(expedition.id)}
                >
                    Confirm
                </div>
            </div>
        </ExpeditionTileBase>

    const [x0, x1] = [0, 1];
    const progress = expeditionProgress(idleSim.data, data, expedition);

    return <ExpeditionTileBase expeditionData={data}>
        {expedition.enemy_state.map((enemy, i) => {
            const { x, y, h } = ENEMY_LAYOUTS[expedition.enemy_state.length][i];
            const enemyData = idleSim.data.enemies[enemy.id];
            const size = `${h * 100 * (enemyData.boss ? 1.35 : 1)}%`;
            return <div key={`${i}-${enemy.id}`} style={{
                position: "absolute", left: `${(x0 + x * (x1 - x0)) * 100}%`, top: `${y * 100}%`,
                width: size, height: size, transform: "translate(-50%, -100%)", zIndex: Math.round(y * 100)
            }}
                {...getIdleSimTooltipProps("enemy", enemy.id)}
            >
                <EnemySprite src={idleSim.data.enemies[enemy.id].src} width={"100%"} height={"100%"} />
            </div>;
        })}

        <div style={{ position: "absolute", left: "2%", right: "2%", bottom: "3%", zIndex: 100, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ display: "flex", gap: 2 }}>
                {expedition.agent_ids.map(agentId => {
                    const agent = idleSim.state.agents[agentId];
                    const fill = agent ? 100 * Math.max(0, agent.hp) / agent.max_hp : 0;
                    return <div key={agentId}
                        style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.2rem" }}
                        {...getIdleSimTooltipProps("agent", agentId)}
                    >
                        <span key={agentId} style={{ flex: 1, fontSize: "0.8rem", textAlign: "center" }}>{agent.name}</span>
                        <div style={{ height: 8, background: "rgba(0,0,0,0.5)" }} >
                            <div style={{ height: "100%", width: `${fill}%`, background: "#2f6fd6" }} />
                        </div>
                    </div>
                })}
            </div>

            <div style={{ position: "relative" }}>
                <div style={{ position: "absolute", top: -4, height: 16, width: 2, marginLeft: -1, left: `${progress * 100}%`, background: "#fff", transition: "left 0.5s" }} />
                <div style={{ display: "flex", gap: 2 }}>
                    {data.waves.map((_, i) => <div key={i} style={{ flex: 1, height: 8, background: "darkred", opacity: i < expedition.wave ? 0.4 : 1 }} />)}
                </div>
            </div>

            <div style={{ textAlign: "center", color: "#ddd", fontSize: "0.8rem" }}>
                Wave {expedition.wave + 1}/{data.waves.length}
            </div>
        </div>
    </ExpeditionTileBase>
}

function ExpeditionTileEvent({ idleSim, event }) {
    const expeditionData = idleSim.data.expeditions[event.expedition_id];
    const eventData = idleSim.data.events[event.event_id];

    if (event.result)
        return <ExpeditionTileBase expeditionData={expeditionData}>
            <div style={{
                ...overlayTextStyle, position: "absolute", left: "4px", top: "20%",
                display: "flex", flexDirection: "column", alignItems: "stretch", gap: "0.2rem",
                maxWidth: "60%", maxHeight: "70%", overflowY: "auto", overflowX: "hidden",
                background: "rgba(0, 0, 0, 0.5)"
            }}>
                <span>Rewards:</span>
                {event.result.effects.length > 0 ?
                    event.result.effects.map(effect => eventEffectToText(idleSim.data, effect)) :
                    "None"
                }
            </div>

            <div className={styles.clickableTile}
                style={{ ...overlayTextStyle, position: "absolute", right: "5px", bottom: "5px" }}
                onClick={() => idleSim.dismissEvent(event.id)}
            >
                Confirm
            </div>
        </ExpeditionTileBase>

    return <ExpeditionTileBase expeditionData={expeditionData}>
        <span style={{
            ...overlayTextStyle, position: "absolute", left: "4px", top: "20%",
            maxWidth: "60%", maxHeight: "70%", overflowY: "auto", overFlowX: "hidden",
            background: "rgba(0, 0, 0, 0.5)"
        }}>
            {eventData.description}
        </span>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch", gap: "0.2rem", position: "absolute", right: "4px", maxWidth: "30%", maxHeight: "90%", top: "20%", overflowY: "auto", overflowX: "hidden" }}>
            {eventData.options.map((option, i) => {
                const available = canChooseEventOption(idleSim.data, idleSim.state, event, option);
                return <div key={i}
                    className={`${styles.clickableTile} ${!available ? styles.disabled : ""}`}
                    onClick={available ? () => { idleSim.chooseEventOption(event.id, i) } : null}
                    {...getGeneralTooltipProps(`Requirements:\n${eventOptionConditionText(idleSim.data, option).join("\n")}`)}
                >
                    <span style={overlayTextStyle}>{option.label}</span>
                </div>
            })}
        </div>
    </ExpeditionTileBase>
}

export default function ExpeditionTab({ idleSim }) {
    const [dispatching, setDispatching] = useState(false);
    const [dispatchingId, setDispatchingId] = useState(null);
    const [agents, setAgents] = useState(new Array(5).fill(null));

    const freeAgents = useMemo(() => {
        const assignedAgents = new Set(agents.filter(Boolean));

        idleSim.state.departments.forEach(dept => dept.agent_ids.forEach(id => assignedAgents.add(id)));
        idleSim.state.expeditions.forEach(exp => exp.agent_ids.forEach(id => assignedAgents.add(id)));
        idleSim.state.finished_expeditions.forEach(exp => exp.agent_ids.forEach(id => assignedAgents.add(id)));
        idleSim.state.pending_events.forEach(ev => ev.agent_ids.forEach(id => assignedAgents.add(id)));

        return Object.keys(idleSim.state.agents).filter(id => !assignedAgents.has(Number(id))).map(id => idleSim.state.agents[id]);
    },
        [idleSim.state, agents]
    );

    if (dispatching) {
        return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "800px", gap: "0.5rem" }}>
            <button onClick={() => { setDispatching(false); setDispatchingId(null); setAgents(new Array(5).fill(null)); }}>Go Back</button>
            {Object.keys(idleSim.data.expeditions).sort((a, b) => Number(a.split("-")[1]) - Number(b.split("-")[1])).map(id => {
                const unlocked = checkExpeditionUnlocked(idleSim.data, idleSim.state, id);
                const canDispatch = unlocked && 
                    agents.filter(Boolean).length > 0 && agents.length <= MAX_EXPEDITION_AGENTS && 
                    idleSim.state.currency >= idleSim.data.expeditions[id].cost;

                return <React.Fragment key={id}>
                    {
                        unlocked ?
                            <ExpeditionTileDispatch idleSim={idleSim} expeditionId={id} setDispatchingId={setDispatchingId} /> :
                            <ExpeditionTileLocked idleSim={idleSim} expeditionId={id} />
                    }
                    {dispatchingId === id && <>
                        <div style={{ display: "grid", gridTemplateColumns: "auto auto", rowGap: "0.2rem", columnGap: "0.5rem" }}>
                            {agents.map((agentId, i) => {
                                const agent = idleSim.state.agents[agentId];

                                return <React.Fragment key={i}>
                                    <AgentMenuSelector
                                        value={agent}
                                        setValue={x => setAgents(p => p.map((v, j) => j === i ? x : v))}
                                        options={freeAgents}
                                    />
                                    {agent ?
                                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span>Lv. {agent.level}</span>
                                                <span>HP: {agent.hp}/{agent.max_hp}</span>
                                                <span>SP: {agent.sp}</span>
                                            </div>
                                            <StatTable data={getAgentEffectiveStats(idleSim.data, idleSim.state, agent)} />
                                            {getAgentGearEffectList(idleSim.data, agent)}
                                        </div> :
                                        <div />
                                    }
                                </React.Fragment>
                            })}
                        </div>
                        <button disabled={!canDispatch} onClick={() => {
                            idleSim.startExpedition(dispatchingId, agents.filter(Boolean)); setDispatching(false);
                            setDispatchingId(null); setAgents(new Array(5).fill(null));
                        }}>
                            Start Expedition
                        </button>
                    </>}

                </React.Fragment>
            })}
        </div>
    }

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "0.2rem" }}>
        <button onClick={() => setDispatching(true)}>
            Dispatch Expedition
        </button>

        {idleSim.state.pending_events.length > 0 && <>
            <span style={{ fontSize: "1.2rem", fontWeight: "bold", marginTop: "0.3rem" }}>Pending Events</span>
            {idleSim.state.pending_events.map(event => <ExpeditionTileEvent key={event.id} idleSim={idleSim} event={event} />)}
        </>}
        {idleSim.state.finished_expeditions.length > 0 && <>
            <span style={{ fontSize: "1.2rem", fontWeight: "bold", marginTop: "0.3rem" }}>Finished Expeditions</span>
            {idleSim.state.finished_expeditions.map(expedition => <ExpeditionTileOngoing key={expedition.id} idleSim={idleSim} expedition={expedition} />)}
        </>}
        {idleSim.state.expeditions.length > 0 && <>
            <span style={{ fontSize: "1.2rem", fontWeight: "bold", marginTop: "0.3rem" }}>Ongoing Expeditions</span>
            {idleSim.state.expeditions.map(expedition => <ExpeditionTileOngoing key={expedition.id} idleSim={idleSim} expedition={expedition} />)}
        </>}
    </div>;
}