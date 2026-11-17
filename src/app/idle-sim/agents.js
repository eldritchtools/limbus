import { HP_PER_LEVEL, POINTS_PER_LEVEL, WE_PER_LEVEL, MAX_AGENT_LEVEL } from "./constants";
import { agentXpToNext, isAgentOnExpedition, sum } from "./util";

export function assignAgentPoints(state, agentId, points) {
    const agent = state.agents[agentId];
    if (!agent || points.length !== 7 || sum(points) > agent.unspent_points) return null;
    if (!points.every(x => Number.isInteger(x) && x >= 0)) return null;

    const nextState = structuredClone(state);
    const target = nextState.agents[agentId];
    target.unspent_points -= sum(points);
    target.offense = target.offense.map((x, i) => x + points[i]);

    return nextState;
}

export function canWork(agent) {
    if (agent.hp <= 0) return false;
    if (agent.statuses.find(x => ["incapacitated", "panic"].includes(x.type))) return false;
    return true;
}

export function renameAgent(state, agentId, name) {
    const nextState = structuredClone(state);
    const target = nextState.agents[agentId];
    target.name = name;
    return nextState;
}

export function isIncapacitated(agent) {
    return agent.statuses.some(x => x.type === "incapacitated");
}

export function isPanicked(agent) {
    return agent.statuses.some(x => x.type === "panic");
}

export function addAgentXp(agent, xp) {
    agent.xp += xp;
    const startLevel = agent.level;

    while (agent.level < MAX_AGENT_LEVEL && agent.xp >= agentXpToNext(agent.level)) {
        agent.xp -= agentXpToNext(agent.level);
        agent.level += 1;
        agent.max_hp += HP_PER_LEVEL;
        if (agent.hp > 0) agent.hp += HP_PER_LEVEL;
        agent.work_efficiency += WE_PER_LEVEL;
        agent.unspent_points += POINTS_PER_LEVEL;
    }

    if (agent.level >= MAX_AGENT_LEVEL) agent.xp = 0;
    return agent.level > startLevel;
}

export function moveAgent(state, id, offset) {
    const agentsOrder = state.agentsOrder ?? Object.keys(state.agents);
    const index = agentsOrder.findIndex(k => k === String(id));

    if (index === -1) return null;

    const nextState = structuredClone(state);
    let newAgentsOrder = nextState.agentsOrder ?? Object.keys(nextState.agents);

    let other = index + offset;
    if (other >= agentsOrder.length) {
        newAgentsOrder = [newAgentsOrder[index], ...newAgentsOrder.slice(0, -1)];
    } else if (other < 0) {
        newAgentsOrder = [...newAgentsOrder.slice(1), newAgentsOrder[0]];
    } else {
        if (!agentsOrder[index] || !agentsOrder[other]) return null;
        const tmp = newAgentsOrder[index];
        newAgentsOrder[index] = newAgentsOrder[other];
        newAgentsOrder[other] = tmp;
    }

    nextState.agentsOrder = newAgentsOrder;
    return nextState;
}

export function assignAgentGroup(state, id, group) {
    if (!(id in state.agents)) return null;
    if (group !== null && typeof group !== 'string') return null;

    const nextState = structuredClone(state);
    const agent = nextState.agents[id];

    if (group === null) delete agent.group;
    else agent.group = group;

    return nextState;
}

export function assignAgentSprite(state, agentId, spriteId) {
    if (!(agentId in state.agents) || !spriteId) return null;

    const nextState = structuredClone(state);
    const agent = nextState.agents[agentId];

    if(!agent) return null;

    agent.sprite = spriteId;
    return nextState;
}