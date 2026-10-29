import { isAgentOnExpedition } from "./expeditions";
import { sum } from "./util";

export function assignAgentPoints(state, agentId, points) {
    const agent = state.agents[agentId];
    if (!agent || points.length !== 7 || sum(points) > agent.unspent_points) return null;
    if (isAgentOnExpedition(state, agentId)) return null;

    const nextState = structuredClone(state);
    const target = nextState.agents[agentId];
    target.unspent_points -= sum(points);
    target.offense = target.offense.map((x, i) => x + points[i]);

    return nextState;
}

export function canWork(agent) {
    if (agent.statuses.find(x => ["incapacitated", "panic"].includes(x.type))) return false;
    return true;
}

export function isIncapacitated(agent) {
    return agent.statuses.some(x => x.type === "incapacitated");
}

export function isPanicked(agent) {
    return agent.statuses.some(x => x.type === "panic");
}