import { HP_PER_LEVEL, POINTS_PER_LEVEL, WE_PER_LEVEL, MAX_AGENT_LEVEL } from "./constants";
import { agentXpToNext, isAgentOnExpedition, sum } from "./util";

export function assignAgentPoints(state, agentId, points) {
    const agent = state.agents[agentId];
    if (!agent || points.length !== 7 || sum(points) > agent.unspent_points) return null;
    if (!points.every(x => Number.isInteger(x) && x >= 0)) return null;
    if (isAgentOnExpedition(state, agentId)) return null;

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
        agent.hp += HP_PER_LEVEL;
        agent.work_efficiency += WE_PER_LEVEL;
        agent.unspent_points += POINTS_PER_LEVEL;
    }

    if (agent.level >= MAX_AGENT_LEVEL) agent.xp = 0;
    return agent.level > startLevel;
}