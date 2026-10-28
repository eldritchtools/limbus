import { getAgentEffectiveStats, grantGear } from "./gear";
import { getAffinityIndex } from "./util";

const CONDITIONS = {
    agent_any_offense: (data, state, agents, condition) => {
        return agents.some(agent => {
            const stats = getAgentEffectiveStats(data, state, agent);
            return condition.affinities.some(affinity => stats.offense[getAffinityIndex(affinity)] >= condition.value);
        });
    }
}

const EFFECTS = {
    // currency: (state, agents, effect) => { state.currency += effect.value; return { type: "currency", value: effect.value }; },
    // agent_xp: (state, agents, effect) => ({ type: "agent_xp", value: effect.value,
    //     level_ups: agents.filter((agent) => addAgentXp(agent, effect.value)).map((a) => ({ agent_id: a.id, level: a.level })) }),
    drop: (data, state, agents, effect) => ({
        type: "drop",
        drop_type: effect.drop_type,
        id: effect.id,
        granted: grantGear(data, state, effect.drop_type, effect.id)
    })
};

export function chooseEventOption(data, state, pendingIndex, optionIndex) {
    const pending = state.pending_events[pendingIndex];
    const option = data.events[pending?.event_id]?.options[optionIndex];
    if (pending.result || !option) return null;

    const nextState = structuredClone(state);

    const agents = pending.agent_ids
        .map(id => nextState.agents[id])
        .filter(Boolean);

    for (const condition of option.conditions) {
        const handler = CONDITIONS[condition.type];
        if (!handler || !handler(data, state, agents, condition)) return null;
    }

    const result = [];
    for (const effect of option.effects) {
        const handler = EFFECTS[effect.type];
        if (handler) result.push(handler(data, nextState, agents, effect));
        else console.warn(`Unknown event effect type: ${effect.type}`);
    }

    if (nextState.currency < 0) return null;

    pending.result = { option_index: optionIndex, effects: result.filter(Boolean) };
    return nextState;
}

export function dismissEvent(state, pendingIndex) {
    if (!state.pending_events[pendingIndex]?.result) return null;
    const nextState = structuredClone(state);
    nextState.pending_events.splice(pendingIndex, 1);
    return nextState;
}