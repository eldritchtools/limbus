import { addAgentXp, canWork } from "./agents";
import { MAX_EXPEDITION_AGENTS } from "./constants";
import { grantGear } from "./gear";
import { isAgentOnExpedition } from "./util";

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
            grantGear(data, state, reward.dropType, reward.dropId);
        } else if (reward.type === "subject") {
            state.subjects[reward.id] ??= { research_level: 0, research_xp: 0 };
        }
    }
}

export function claimExpedition(data, state, expeditionId) {
    const expedition = state.finished_expeditions.find(ex => ex.id === expeditionId);
    if (!expedition) return null;

    const nextState = structuredClone(state);
    nextState.finished_expeditions = nextState.finished_expeditions.filter(ex => ex.id !== expedition.id)

    if (expedition.result === "failed") return nextState;

    grantExpeditionRewards(data, nextState, expedition);

    if (expedition.event) {
        nextState.pending_events.push({
            id: expedition.id,
            event_id: expedition.event,
            expedition_id: expedition.expedition_id,
            agent_ids: [...expedition.agent_ids],
        });
    }

    return nextState;
}