"use client";

import { StatTable } from "./components";
import { getAgentEffectiveStats, getAgentGearEffectList } from "./gear";
import { EnemySprite, GiftSprite } from "./icons";
import { formatSp } from "./util";
import TooltipTemplate from "../components/tooltips/TooltipTemplate";

const TOOLTIP_ID = "idle-sim-tooltip";

function IdleSimTooltipContent({ idleSim, type, id }) {
    if (type === "agent") {
        const agent = idleSim.state.agents[Number(id)];
        const effectiveStats = getAgentEffectiveStats(idleSim.data, idleSim.state, agent, false);
        const effectList = getAgentGearEffectList(idleSim.data, agent);
        const statuses = agent.statuses.map((x, i) => {
            const st = idleSim.data.statuses[x.id];
            if (!st) return null;
            return `${st.name} (${x.value})`
        }).filter(Boolean);

        return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", padding: "0.5rem", maxWidth: "400px" }}>
            {agent.name}
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <span>Lv. {agent.level}</span>
                <span>HP: {Math.round(agent.hp)}/{agent.max_hp}</span>
                <span>SP: {formatSp(agent.sp)}</span>
                <span>WE: {effectiveStats.work_efficiency}</span>
            </div>
            <StatTable data={effectiveStats} />
            {effectList.map((x, i) => <span key={i} style={{ alignSelf: "start" }}>{x}</span>)}
            {statuses.length > 0 && <>
                <span>Statuses:</span>
                {statuses.join(", ")}
            </>}
        </div>
    }

    if (type === "subject") {
        const subject = idleSim.state.subjects[id];
        const data = idleSim.data.subjects[id];

        return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", padding: "0.5rem", maxWidth: "400px" }}>
            {data.name}
            <EnemySprite key={id} width={150} height={150} src={data.src} />
            <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
                <span>Lv. {subject.research_level}</span>
                <span>WE Req: {data.we_req}</span>
                <span>SP Cost: {data.sp_cost}</span>
            </div>
            <StatTable data={data} />
            <span>{data.desc}</span>
            {(data.statuses ?? []).map(st => {
                const status = idleSim.data.statuses[st];
                return <span key={st} style={{ fontSize: "0.7rem" }}>{status.name}: {status.desc}</span>
            })}
        </div>
    }

    if (type === "enemy") {
        const enemy = idleSim.data.enemies[id];

        return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", padding: "0.5rem", maxWidth: "400px" }}>
            <span>{enemy.name}</span>
            <EnemySprite key={id} width={150} height={150} src={enemy.src} />
            <StatTable data={enemy} />
            <span>{enemy.desc}</span>
            {(enemy.statuses ?? []).map(st => {
                const status = idleSim.data.statuses[st];
                return <span key={st} style={{ fontSize: "0.7rem" }}>{status.name}: {status.desc}</span>
            })}
        </div>
    }

    if (type === "weapons") {
        const data = idleSim.data[type][id];

        return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", padding: "0.5rem", maxWidth: "400px" }}>
            {data.name}
            <StatTable data={data} />
            <span>{data.desc}</span>
            {(data.statuses ?? []).map(st => {
                const status = idleSim.data.statuses[st];
                return <span key={st} style={{ fontSize: "0.7rem" }}>{status.name}: {status.desc}</span>
            })}
        </div>
    }

    if (type === "armor") {
        const data = idleSim.data[type][id];

        return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", padding: "0.5rem", maxWidth: "400px" }}>
            {data.name}
            <StatTable data={data} />
            <span>{data.desc}</span>
            {(data.statuses ?? []).map(st => {
                const status = idleSim.data.statuses[st];
                return <span key={st} style={{ fontSize: "0.7rem" }}>{status.name}: {status.desc}</span>
            })}
        </div>
    }

    if (type === "gifts") {
        const data = idleSim.data[type][id];

        return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", padding: "0.5rem", maxWidth: "400px" }}>
            {data.name}
            <GiftSprite width={100} height={100} src={data.src} />
            <span>{data.desc}</span>
            {(data.statuses ?? []).map(st => {
                const status = idleSim.data.statuses[st];
                return <span key={st} style={{ fontSize: "0.7rem" }}>{status.name}: {status.desc}</span>
            })}
        </div>
    }

    return null;
}

export function IdleSimTooltip({ idleSim }) {
    return <TooltipTemplate id={TOOLTIP_ID} contentFunc={data => {
        if (!data) return;
        const [type, id] = data.split("|");
        return <IdleSimTooltipContent idleSim={idleSim} type={type} id={id} />
    }} />
}

export function getIdleSimTooltipProps(type, id) {
    return {
        "data-tooltip-id": TOOLTIP_ID,
        "data-tooltip-content": `${type}|${id}`
    }
}
