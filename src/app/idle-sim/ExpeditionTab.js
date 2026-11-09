/* eslint-disable @next/next/no-img-element */
import React, { useEffect, useState } from "react";

import { uiColors } from "../lib/colors";
import { ASSETS_ROOT } from "../paths";
import { canWork } from "./agents";
import { StatTable } from "./components";
import { MAX_EXPEDITION_AGENTS } from "./constants";
import { canChooseEventOption, eventEffectToText, eventOptionConditionText } from "./events";
import { checkExpeditionUnlocked, expeditionRequirementsText, rewardToText } from "./expeditions";
import { getAgentEffectiveStats, getAgentGearEffectList } from "./gear";
import { EnemySprite } from "./icons";
import styles from "./idleSim.module.css";
import { getIdleSimTooltipProps } from "./idleSimTooltip";
import { AgentMenuSelector } from "./selectors";
import { formatSp, toCurrencyStr } from "./util";
import KeywordIcon from "../components/icons/KeywordIcon";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";

const overlayTextStyle = { color: "#ddd", textShadow: "0 0 4px #000, 0 0 12px #000, 2px 2px 4px #000, -2px -2px 4px #000" };

function getSrc(expedition, wave = 0) {
    let src = expedition.src;
    if (Array.isArray(src)) {
        src = src[Math.max(wave, 0)];
        if (Array.isArray(src)) {
            if (wave === -1) return src[0];
            return src[Math.floor(Math.random() * src.length)];
        }
        return src;
    }
    return src;
}

function KwList({ list }) {
    if (!list || list.length === 0) return <span style={{ opacity: 0.6 }}>None</span>;
    return <div style={{ display: "flex", gap: "2px" }}>
        {list.map(kw => <KeywordIcon key={kw} id={kw} size={24} />)}
    </div>;
}

function ExpeditionTileBase({ expeditionData, wave, children }) {
    const [src, setSrc] = useState(getSrc(expeditionData, wave));

    useEffect(() => {
        setSrc(getSrc(expeditionData, wave));
    }, [expeditionData, wave]);

    return <div className={styles.tile} style={{ position: "relative", aspectRatio: "5 / 3", padding: "0", overflow: "hidden" }}>
        <img src={`${ASSETS_ROOT}/backgrounds/${src}.webp`} alt={""} title={""} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        <span style={{ ...overlayTextStyle, position: "absolute", display: "block", left: "4px", top: "4px", fontSize: "1.2rem", fontWeight: "bold", maxWidth: "70%" }}>{expeditionData.name}</span>
        {children}
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

    if (expedition.result) {
        const isCleared = expedition.result === "cleared";
        const rewardList = (expedition.rewards ?? [])
            .map(reward => rewardToText(idleSim.data, idleSim.state, reward))
            .filter(Boolean);

        return <ExpeditionTileBase expeditionData={data} wave={data.waves.length - 1}>
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem",
                position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
                background: "rgba(0, 0, 0, 0.6)", padding: "1rem", borderRadius: "0.5rem",
                minWidth: "260px", textAlign: "center"
            }}>
                <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: isCleared ? uiColors.green : uiColors.red }}>
                    {isCleared ? "EXPEDITION CLEARED" : "EXPEDITION FAILED"}
                </span>

                {!isCleared &&
                    <span style={{ fontSize: "0.85rem", opacity: 0.9 }}>Defeated on Wave {expedition.wave + 1} of {data.waves.length}</span>
                }

                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center", fontSize: "0.85rem", margin: "0.2rem 0" }}>
                    {expedition.agent_ids.map(id => {
                        const a = idleSim.state.agents[id];
                        const down = !a || a.hp <= 0;
                        return <span key={id} style={{ color: down ? uiColors.red : undefined, textDecoration: down ? "line-through" : undefined }}>
                            {a?.name ?? `Agent ${id}`}
                        </span>;
                    })}
                </div>

                {isCleared &&
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", fontSize: "0.85rem" }}>
                        <span style={{ fontWeight: "bold" }}>Rewards:</span>
                        {rewardList.length > 0 ?
                            rewardList.map((text, i) => <span key={i}>{text}</span>) :
                            <span style={{ opacity: 0.8 }}>No Rewards.</span>
                        }
                    </div>
                }

                <div className={styles.clickableTile}
                    onClick={() => idleSim.claimExpedition(expedition.id)}
                >
                    Confirm
                </div>
            </div>
        </ExpeditionTileBase>
    }

    const [x0, x1] = [0, 1];
    const progress = expeditionProgress(idleSim.data, data, expedition);
    const visibleEnemies = expedition.enemy_state.slice(0, 5);

    return <ExpeditionTileBase expeditionData={data} wave={expedition.wave}>
        {visibleEnemies.map((enemy, i) => {
            const { x, y, h } = ENEMY_LAYOUTS[visibleEnemies.length][i];
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
                    const isDown = !agent || agent.hp <= 0;
                    const fill = agent ? 100 * Math.max(0, agent.hp) / agent.max_hp : 0;

                    return <div key={agentId}
                        style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.2rem", opacity: isDown ? 0.6 : 1 }}
                        {...getIdleSimTooltipProps("agent", agentId)}
                    >
                        <span style={{
                            flex: 1, fontSize: "0.8rem", textAlign: "center",
                            color: isDown ? uiColors.red : undefined,
                            textDecoration: isDown ? "line-through" : undefined
                        }}>
                            {agent?.name}
                        </span>
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
        return <ExpeditionTileBase expeditionData={expeditionData} wave={expeditionData.waves.length - 1}>
            <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem",
                position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)",
                background: "rgba(0, 0, 0, 0.6)", padding: "1rem", borderRadius: "0.5rem",
                minWidth: "240px", textAlign: "center"
            }}>
                <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Event Result</span>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", fontSize: "0.85rem" }}>
                    {event.result.effects.length > 0 ?
                        event.result.effects.map((effect, i) => (
                            <span key={i}>{eventEffectToText(idleSim.data, effect)}</span>
                        )) :
                        <span style={{ opacity: 0.8 }}>Nothing happened.</span>
                    }
                </div>

                <div className={styles.clickableTile}
                    onClick={() => idleSim.dismissEvent(event.id)}
                >
                    Confirm
                </div>
            </div>
        </ExpeditionTileBase>

    return <ExpeditionTileBase expeditionData={expeditionData} wave={expeditionData.waves.length - 1}>
        <span style={{
            ...overlayTextStyle, position: "absolute", left: "4px", top: "20%",
            maxWidth: "60%", maxHeight: "70%", overflowY: "auto", overflowX: "hidden",
            background: "rgba(0, 0, 0, 0.5)", whiteSpace: "pre-wrap"
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

function ExpeditionPrepScreen({ idleSim, expeditionId, onBack }) {
    const data = idleSim.data.expeditions[expeditionId];
    const [agents, setAgents] = useState(new Array(MAX_EXPEDITION_AGENTS).fill(null));

    const freeAgents = useMemo(() => {
        const assignedAgents = new Set(agents.filter(Boolean));

        idleSim.state.departments.forEach(dept => dept.agent_ids.forEach(id => assignedAgents.add(id)));
        idleSim.state.expeditions.forEach(exp => exp.agent_ids.forEach(id => assignedAgents.add(id)));
        idleSim.state.finished_expeditions.forEach(exp => exp.agent_ids.forEach(id => assignedAgents.add(id)));
        idleSim.state.pending_events.forEach(ev => ev.agent_ids.forEach(id => assignedAgents.add(id)));

        return Object.values(idleSim.state.agents).filter(a => !assignedAgents.has(a.id) && canWork(a));
    },
        [idleSim.state, agents]
    );

    const chosenAgents = agents.filter(Boolean).map(id => idleSim.state.agents[id]);
    const canAfford = idleSim.state.currency >= data.cost;
    const canDispatch = canAfford && chosenAgents.length > 0 && chosenAgents.length <= MAX_EXPEDITION_AGENTS;
    const isFirstClear = !idleSim.state.cleared_expeditions.includes(expeditionId);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "850px", gap: "0.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <button onClick={onBack}>Go Back</button>
            <span style={{ fontSize: "1.1rem", fontWeight: "bold" }}>
                Cost: <span style={{ color: canAfford ? null : uiColors.red }}>{toCurrencyStr(data.cost)}</span>
            </span>
        </div>

        <div className={styles.tile} style={{ position: "relative", width: "100%", padding: 0, overflow: "hidden", minHeight: "140px" }}>
            <img
                src={`${ASSETS_ROOT}/backgrounds/${getSrc(data, -1)}.webp`} alt=""
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.4)" }}
            />
            <div style={{ position: "relative", zIndex: 1, padding: "1rem", display: "flex", flexDirection: "column", gap: "0.4rem", width: "100%", boxSizing: "border-box" }}>
                <span style={{ ...overlayTextStyle, fontSize: "1.4rem", fontWeight: "bold" }}>{data.name}</span>
                <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", ...overlayTextStyle }}>
                    <span>Recommended Level: <strong>{data.rec_level}</strong></span>
                    <span>Recommended Agents: <strong>{data.rec_agents}</strong></span>
                    <span>Waves: <strong>{data.waves.length}</strong></span>
                </div>
                <div style={{ display: "flex", gap: "2rem", alignItems: "center", marginTop: "0.4rem", ...overlayTextStyle }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span>Recommended Offense:</span>
                        <KwList list={data.rec_offense} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <span>Recommended Defense:</span>
                        <KwList list={data.rec_defense} />
                    </div>
                </div>
            </div>
        </div>

        <div className={styles.tile} style={{ width: "100%", alignItems: "stretch", gap: "0.5rem", boxSizing: "border-box" }}>
            <span style={{ fontWeight: "bold", fontSize: "1.1rem" }}>Enemies</span>
            <div style={{ display: "flex", gap: "1rem", overflowX: "auto", paddingBottom: "0.4rem" }}>
                {data.waves.map((waveEnemies, wIdx) => (
                    <div key={wIdx} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.4rem", minWidth: "140px", background: "rgba(0,0,0,0.2)", padding: "0.5rem", borderRadius: "0.4rem" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: "bold", opacity: 0.8 }}>Wave {wIdx + 1}</span>
                        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
                            {waveEnemies.map((enemyId, eIdx) => {
                                const enemy = idleSim.data.enemies[enemyId];
                                return <div key={eIdx} style={{ display: "flex", flexDirection: "column", alignItems: "center" }} {...getIdleSimTooltipProps("enemy", enemyId)}>
                                    <EnemySprite width={56} height={56} src={enemy.src} />
                                    <span style={{ fontSize: "0.8rem", textAlign: "center", maxWidth: "90px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                        {enemy.name}
                                    </span>
                                    <span style={{ fontSize: "0.9rem" }}>HP: {enemy.max_hp}</span>
                                </div>;
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px var(--primary-border-color) solid", paddingTop: "0.5rem", fontSize: "0.85rem" }}>
                <span>Clear XP: <strong>+{data.reward?.xp ?? 0} per Agent</strong></span>
                {isFirstClear && data.first_clear_reward && <span style={{ fontWeight: "bold" }}>First Clear Reward Available</span>}
            </div>
        </div>

        <div className={styles.tile} style={{ width: "100%", alignItems: "stretch", gap: "0.5rem", boxSizing: "border-box" }}>
            <span style={{ fontWeight: "bold", fontSize: "1rem" }}>
                Assign Agents ({chosenAgents.length} / {MAX_EXPEDITION_AGENTS})
            </span>

            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", rowGap: "0.4rem", columnGap: "0.6rem", alignItems: "center" }}>
                {agents.map((agentId, i) => {
                    const agent = idleSim.state.agents[agentId];
                    return <React.Fragment key={i}>
                        <AgentMenuSelector
                            value={agent}
                            setValue={x => setAgents(p => p.map((v, j) => (j === i ? (x ? Number(x) : null) : v)))}
                            options={freeAgents}
                            textOnly={true}
                        />
                        {agent ?
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", background: "rgba(0,0,0,0.2)", padding: "0.4rem", borderRadius: "0.3rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                                    <span><strong>{agent.name}</strong> (Lv. {agent.level})</span>
                                    <span>HP: {Math.round(agent.hp)}/{agent.max_hp}</span>
                                    <span>SP: {formatSp(agent.sp)}</span>
                                </div>
                                <StatTable data={getAgentEffectiveStats(idleSim.data, idleSim.state, agent, false)} />
                                {getAgentGearEffectList(idleSim.data, agent).map((eff, k) => <span key={k}>{eff}</span>)}
                            </div> :
                            <div style={{ fontSize: "0.85rem", opacity: 0.4, paddingLeft: "0.5rem" }}>Empty Slot</div>
                        }
                    </React.Fragment>;
                })}
            </div>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
            <button
                disabled={!canDispatch}
                onClick={() => {
                    idleSim.startExpedition(expeditionId, agents.filter(Boolean));
                    idleSim.updateUiState({ dispatching: false, dispatchingId: null });
                }}
                style={{ fontWeight: "bold", cursor: canDispatch ? "pointer" : "not-allowed" }}
            >
                {!canAfford ? "Insufficient Ahn" : chosenAgents.length === 0 ? "Assign at least 1 agent" : `Start Expedition (${toCurrencyStr(data.cost)})`}
            </button>
        </div>
    </div>
}

function ExpeditionSelectScreen({ idleSim, onSelectExpedition, onBack }) {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "850px", gap: "0.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
            <button onClick={onBack}>Go Back</button>
            <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Select Expedition</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
            {Object.keys(idleSim.data.expeditions)
                .sort((a, b) => Number(a.split("-")[1]) - Number(b.split("-")[1]))
                .map(id => {
                    const unlocked = checkExpeditionUnlocked(idleSim.data, idleSim.state, id);
                    if (!unlocked) {
                        return <div key={id} className={styles.tile} style={{ flexDirection: "row", opacity: 0.6 }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>???</span>
                                <span>
                                    {expeditionRequirementsText(idleSim.data, idleSim.state, id).join(" · ")}
                                </span>
                            </div>
                        </div>
                    }

                    const data = idleSim.data.expeditions[id];
                    return <div key={id} className={styles.clickableTile}
                        style={{ flexDirection: "row", gap: "0.75rem", width: "100%", boxSizing: "border-box" }}
                        onClick={() => onSelectExpedition(id)}
                    >
                        <img
                            src={`${ASSETS_ROOT}/backgrounds/${getSrc(data, -1)}.webp`} alt=""
                            style={{ width: "160px", height: "100px", objectFit: "cover", borderRadius: "0.3rem" }}
                        />
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", flex: 1 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{data.name}</span>
                                <span style={{ fontWeight: "bold" }}>{toCurrencyStr(data.cost)}</span>
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", width: "100%", textAlign: "center" }}>
                                <span>Recommended Level: <strong>{data.rec_level}</strong></span>
                                <span>Recommended Agents: <strong>{data.rec_agents}</strong></span>
                                <span>Waves: <strong>{data.waves.length}</strong></span>
                            </div>

                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", alignItems: "center", justifyItems: "center", textAlign: "center" }}>
                                <span>Recommended Offense:</span>
                                <span>Recommended Defense:</span>
                                <div style={{ display: "flex", width: "auto" }}><KwList list={data.rec_offense} /></div>
                                <div style={{ display: "flex", width: "auto" }}><KwList list={data.rec_defense} /></div>
                            </div>
                        </div>
                    </div>
                })}
        </div>
    </div>
}

function OngoingExpeditionsScreen({ idleSim, onStartDispatch }) {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "850px", gap: "0.5rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Expeditions</span>
            <button onClick={onStartDispatch} style={{ fontWeight: "bold", cursor: "pointer" }}>
                + Dispatch Expedition
            </button>
        </div>

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

export default function ExpeditionTab({ idleSim }) {
    const dispatching = idleSim.uiState.dispatching ?? false;
    const dispatchingId = idleSim.uiState.dispatchingId ?? null;

    if (dispatching && dispatchingId) {
        return <ExpeditionPrepScreen idleSim={idleSim} expeditionId={dispatchingId}
            onBack={() => idleSim.updateUiState({ dispatching: true, dispatchingId: null })}
        />;
    }

    if (dispatching) {
        return <ExpeditionSelectScreen idleSim={idleSim}
            onSelectExpedition={id => idleSim.updateUiState({ dispatching: true, dispatchingId: id })}
            onBack={() => idleSim.updateUiState({ dispatching: false, dispatchingId: null })}
        />;
    }

    return <OngoingExpeditionsScreen idleSim={idleSim}
        onStartDispatch={() => idleSim.updateUiState({ dispatching: true, dispatchingId: null })}
    />;
}
