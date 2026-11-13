import { addAgentXp, canWork } from "./agents";
import { MAX_EXPEDITION_AGENTS } from "./constants";
import { gearTypeToText, getOwnedCopies, grantGear } from "./gear";
import { isAgentOnExpedition } from "./util";

export function createEnemy(data, enemyId) {
    return { id: enemyId, hp: data.enemies[enemyId].max_hp }
}

export function constructEnemyState(data, expeditionId, wave) {
    return data.expeditions[expeditionId].waves[wave].map(enemyId => createEnemy(data, enemyId));
}

export function getExpeditionCost(expData, agents) {
    return expData.base_cost + agents * expData.agent_cost;
}

const REQUIREMENTS = {
    expedition_cleared: (state, requirement) => state.cleared_expeditions.includes(requirement.id)
}

export function checkExpeditionUnlocked(data, state, expeditionId) {
    const expedition = data.expeditions[expeditionId];
    if (!expedition) return false;

    for (const requirement of (expedition.requires ?? [])) {
        const handler = REQUIREMENTS[requirement.type];
        if (!handler || !handler(state, requirement)) return false;
    }

    return true;
}

const REQUIREMENTS_TEXT = {
    expedition_cleared: (data, state, requirement) => {
        const expedition = data.expeditions[requirement.id];
        const unlocked = checkExpeditionUnlocked(data, state, requirement.id);
        if (!unlocked) return `Clear Expedition: ???`;
        return `Clear Expedition: ${expedition.name}`
    }
}

export function expeditionRequirementsText(data, state, expeditionId) {
    const expedition = data.expeditions[expeditionId];
    return (expedition.requires ?? []).map(requirement => {
        const handler = REQUIREMENTS_TEXT[requirement.type];
        if (handler) return handler(data, state, requirement);
        else return null;
    }).filter(Boolean);
}

export function startExpedition(data, state, expeditionId, agentIds) {
    const expedition = data.expeditions[expeditionId];
    if (!expedition || !Array.isArray(agentIds)) return null;
    if (agentIds.length < 1 || agentIds.length > MAX_EXPEDITION_AGENTS) return null;
    if (new Set(agentIds).size !== agentIds.length) return null;
    const cost = getExpeditionCost(expedition, agentIds.length);
    if (state.currency < cost) return null;

    for (const agentId of agentIds) {
        const agent = state.agents[agentId];
        if (!agent || !canWork(agent) || isAgentOnExpedition(state, agentId)) return null;
        if (state.departments.some(department => department.agent_ids.includes(agentId))) return null;
    }

    const nextState = structuredClone(state);
    nextState.currency -= cost;
    nextState.expeditions.push({
        id: state.next_expedition_id,
        expedition_id: expeditionId,
        agent_ids: [...agentIds],
        wave: 0,
        enemy_state: constructEnemyState(data, expeditionId, 0),
        ticks: 0,
    });
    nextState.next_expedition_id += 1;

    return nextState;
}

function grantExpeditionRewards(data, state, expedition) {
    for (const reward of expedition.rewards ?? []) {
        if (reward.type === "xp") {
            for (const agentId of expedition.agent_ids) {
                const agent = state.agents[agentId];
                if (!agent) continue;
                addAgentXp(agent, reward.value);
            }
        } else if (reward.type === "drop") {
            grantGear(data, state, reward.drop_type, reward.drop_id);
        } else if (reward.type === "subject") {
            state.subjects[reward.id] ??= { research_level: 0, research_xp: 0 };
        }
    }
}

export function claimExpedition(data, state, id) {
    const expedition = state.finished_expeditions.find(ex => ex.id === id);
    if (!expedition) return null;

    const nextState = structuredClone(state);
    nextState.finished_expeditions = nextState.finished_expeditions.filter(ex => ex.id !== expedition.id);

    if (expedition.result === "failed") return nextState;

    grantExpeditionRewards(data, nextState, expedition);

    if (expedition.event) {
        nextState.pending_events.push({
            id: expedition.id,
            event_id: expedition.event,
            expedition_id: expedition.expedition_id,
            agent_ids: [...expedition.agent_ids],
            eligible_options: expedition.eligible_options
        });
    }

    return nextState;
}

export function rewardToText(data, state, reward) {
    switch (reward.type) {
        case "xp":
            return `Agents gained ${reward.value} xp.`;
        case "drop": {
            const item = data[reward.drop_type][reward.drop_id];
            if (getOwnedCopies(state, reward.drop_type, reward.drop_id) >= item.max_copies) return null;
            return `Gained ${gearTypeToText(reward.drop_type)}: ${item.name}.`;
        }
        case "subject":
            const subject = data.subjects[reward.id];
            return `Unlocked Research Subject: ${subject.name}`;
        default:
            return null;
    }
}
