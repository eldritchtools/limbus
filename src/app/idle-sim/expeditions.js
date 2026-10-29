import { canWork } from "./agents";
import { MAX_EXPEDITION_AGENTS } from "./constants";

export function findAgentExpedition(state, agentId) {
    for (const expedition of state.expeditions) {
        if (expedition.agent_ids.includes(agentId)) return expedition;
    }
    for (const event of state.pending_events) {
        if (event.agent_ids.includes(agentId) && !event.result) return event;
    }
    return null;
}

export function isAgentOnExpedition(state, agentId) {
    return state.expeditions.some(expedition => expedition.agent_ids.includes(agentId)) ||
        state.pending_events.some(event => event.agent_ids.includes(agentId) && !event.result);
}

export function createEnemy(data, enemyId) {
    return { id: enemyId, hp: data.enemies[enemyId].max_hp }
}

export function constructEnemyState(data, expeditionId, wave) {
    return data.expeditions[expeditionId].waves[wave].map(enemyId => createEnemy(data, enemyId));
}

export function startExpedition(data, state, expeditionId, agentIds) {
    const expedition = data.expeditions[expeditionId];
    if (!expedition || !Array.isArray(agentIds)) return null;
    if (agentIds.length < 1 || agentIds.length > MAX_EXPEDITION_AGENTS) return null;
    if (new Set(agentIds).size !== agentIds.length) return null;
    if (state.currency < expedition.cost) return null;

    for (const agentId of agentIds) {
        const agent = state.agents[agentId];
        if (!agent || !canWork(agent) || isAgentOnExpedition(state, agentId)) return null;
        if (state.departments.some(department => department.agent_ids.includes(agentId))) return null;
    }

    const nextState = structuredClone(state);
    nextState.currency -= expedition.cost;
    nextState.expeditions.push({
        expedition_id: expeditionId,
        agent_ids: [...agentIds],
        wave: 0,
        enemy_state: constructEnemyState(data, expeditionId, 0),
        ticks: 0,
    });

    return nextState;
}