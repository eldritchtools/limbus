import { gearTypeToText, getAgentEffectiveStats, grantGear } from "./gear";
import { getAffinityIndex } from "./util";

const CONDITIONS = {
    agent_any_offense: (data, state, agents, condition) => {
        return agents.some(agent => {
            const stats = getAgentEffectiveStats(data, state, agent, false);
            return condition.affinities.some(affinity => stats.offense[getAffinityIndex(affinity)] >= condition.target);
        });
    }
}

const CONDITIONS_TEXT = {
    agent_any_offense: (data, condition) => {
        return `A participating agent must have at least ${condition.target} offense rating for at least one of the following affinities: ${condition.affinities.join(", ")}.`
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

export function getEligibleEventOptions(data, state, agentIds, eventId) {
    const event = data.events[eventId];
    const agents = agentIds.map(id => state.agents[id]).filter(Boolean);
    const list = [];
    for (const option of event.options) {
        if (option.conditions) {
            const valid = option.conditions.every(cond => {
                const handler = CONDITIONS[cond.type];
                if (!handler) return false;
                return handler(data, state, agents, cond);
            });
            if (valid) list.push(option.id);
        } else {
            list.push(option.id);
        }
    }
    return list;
}

export function eventOptionConditionText(data, option) {
    const list = [];
    for (const condition of (option.conditions ?? [])) {
        const handler = CONDITIONS_TEXT[condition.type];
        if (handler) list.push(handler(data, condition))
    }
    if (list.length === 0) list.push("None");
    return list;
}

export function chooseEventOption(data, state, id, optionIndex) {
    const pending = state.pending_events.find(event => event.id === id);
    const option = data.events[pending?.event_id]?.options[optionIndex];
    if (!pending || pending.result || !option || !pending.eligible_options.includes(option.id)) return null;

    const nextState = structuredClone(state);

    const agents = pending.agent_ids
        .map(id => nextState.agents[id])
        .filter(Boolean);

    const result = [];
    for (const effect of (option.effects ?? [])) {
        const handler = EFFECTS[effect.type];
        if (handler) result.push(handler(data, nextState, agents, effect));
        else console.warn(`Unknown event effect type: ${effect.type}`);
    }

    if (nextState.currency < 0) return null;

    const event = nextState.pending_events.find(event => event.id === id);
    event.result = { option_index: optionIndex, effects: result.filter(Boolean) };
    event.agent_ids = [];
    return nextState;
}

export function dismissEvent(state, id) {
    const pending = state.pending_events.find(event => event.id === id);
    if (!pending) return null;

    const nextState = structuredClone(state);
    nextState.pending_events = nextState.pending_events.filter(event => event.id !== id);
    return nextState;
}

export function eventEffectToText(data, effect) {
    switch (effect.type) {
        case "drop":
            if (effect.granted) return `Gained a ${gearTypeToText(effect.drop_type)}: ${data[effect.drop_type][effect.id].name}`
            else return `Failed to gain a ${gearTypeToText(effect.drop_type)} due to having the max allowed copies: ${data[effect.drop_type][effect.id].name}`
        default:
            return "";
    }
}