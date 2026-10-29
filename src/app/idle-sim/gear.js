import { DEFAULT_GEAR_COST_GROWTH } from "./constants";
import { resolveGearStatEffects } from "./effects";
import { isAgentOnExpedition } from "./expeditions";


export function getAgentEffectiveStats(data, state, agent) {
    const stats = {
        work_efficiency: agent.work_efficiency,
        offense: [...agent.offense],
        defense: [1, 1, 1, 1, 1, 1, 1],
        off_mult: [1, 1, 1, 1, 1, 1, 1]
    };

    const weapon = data.weapons[agent.weapon];
    if (weapon) stats.off_mult = [...weapon.offense];

    const armor = data.armor[agent.armor];
    if (armor) stats.defense = [...armor.defense];

    resolveGearStatEffects(data, state, agent, stats);

    stats.offense = stats.offense.map((v, i) => v * stats.off_mult[i]);
    delete stats.off_mult;

    return stats;
}

export function getSubjectGearUnlocks(data, subjectId) {
    const unlocks = [];

    for (const type of ["weapons", "armor", "gifts"]) {
        for (const [id, gear] of Object.entries(data[type])) {
            for (const unlock of gear.unlocks) {
                if (unlock.subject === subjectId) {
                    unlocks.push({ type, id, name: gear.name, level: unlock.level, copies: unlock.copies });
                }
            }
        }
    }

    return unlocks.sort((a, b) => a.level - b.level);
}

export function getOwnedCopies(state, type, id) {
    return state.inventory[type][id] ?? 0;
}

export function getPurchaseLimit(data, state, type, id) {
    if (!["weapons", "armor"].includes(type)) return 0;

    const gear = data[type][id];
    let limit = 0;

    for (const unlock of gear.unlocks) {
        if ((state.subjects[unlock.subject]?.research_level ?? 0) >= unlock.level) limit += unlock.copies;
    }

    return gear.max_copies === undefined ? limit : Math.min(limit, gear.max_copies);
}

export function getGearCost(data, state, type, id) {
    if (!["weapons", "armor"].includes(type)) return undefined;

    const gear = data[type][id];
    return Math.round(gear.price * (gear.price_growth ?? DEFAULT_GEAR_COST_GROWTH) ** getOwnedCopies(state, type, id));
}

function getEquippedCopies(state, type, id) {
    let count = 0;

    for (const agent of Object.values(state.agents)) {
        switch (type) {
            case "weapons":
                if (agent.weapon === id) count += 1;
                break;
            case "armor":
                if (agent.armor === id) count += 1;
                break;
            case "gifts":
                count += agent.gifts.filter(giftId => giftId === id).length;
                break;
            default:
                break;
        }
    }

    return count;
}

export function grantGear(data, state, type, id) {
    if (!["weapons", "armor", "gifts"].includes(type)) return false;

    const gear = data[type][id];
    if (!gear) return false;

    const owned = getOwnedCopies(state, type, id);
    if (gear.max_copies !== undefined && owned >= gear.max_copies) return false;

    state.inventory[type][id] = owned + 1;
    return true;
}

export function buyGear(data, state, type, id) {
    if (!data[type]?.[id]) return null;
    if (getOwnedCopies(state, type, id) >= getPurchaseLimit(data, state, type, id)) return null;

    const cost = getGearCost(data, state, type, id);
    if (state.currency < cost) return null;

    const nextState = structuredClone(state);
    nextState.currency -= cost;
    nextState.inventory[type][id] = getOwnedCopies(state, type, id) + 1;
    return nextState;
}

export function equipGear(data, state, agentId, type, id) {
    const agent = state.agents[agentId];
    if (!agent || !data[type]?.[id] || isAgentOnExpedition(state, agentId)) return null;
    if (getOwnedCopies(state, type, id) - getEquippedCopies(state, type, id) < 1) return null;

    switch (type) {
        case "weapons":
            if (agent.weapon === id) return null;
            break;
        case "armor":
            if (agent.armor === id) return null;
            break;
        case "gifts":
            if (agent.gifts.includes(id) || agent.gifts.length >= MAX_GIFTS_PER_AGENT) return null;
            break;
        default:
            break;
    }

    const nextState = structuredClone(state);
    const target = nextState.agents[agentId];

    switch (type) {
        case "weapons":
            target.weapon = id;
            break;
        case "armor":
            target.armor = id;
            break;
        case "gifts":
            target.gifts.push(id);
            break;
        default:
            break;
    }

    return nextState;
}

export function unequipGear(data, state, agentId, type, id) {
    const agent = state.agents[agentId];
    if (!agent || !data[type]?.[id] || isAgentOnExpedition(state, agentId)) return null;

    switch (type) {
        case "weapons":
            if (agent.weapon !== id) return null;
            break;
        case "armor":
            if (agent.armor !== id) return null;
            break;
        case "gifts":
            if (!agent.gifts.includes(id)) return null;
            break;
        default:
            break;
    }

    const nextState = structuredClone(state);
    const target = nextState.agents[agentId];

    switch (type) {
        case "weapons":
            target.weapon = null;
            break;
        case "armor":
            target.armor = null;
            break;
        case "gifts":
            target.gifts = target.gifts.filter(giftId => giftId !== id);
            break;
        default:
            break;
    }

    return nextState;
}