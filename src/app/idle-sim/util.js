import { MAX_DEPARTMENT_AGENTS, MAX_DEPARTMENT_SUBJECTS, STARTER_SUBJECT_IDS, TICK_DURATION } from "./constants";
import { affinities } from "../lib/constants";

export function sum(values) {
    return values.reduce((total, value) => total + value, 0);
}

export function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export function toCurrencyStr(val) {
    return `${val} Ahn`;
}

export function formatSp(val) {
    return Number(val.toFixed(2));
}

export function agentXpToNext(level) {
    if (level < 30) return Math.round(40 * Math.pow(level - 0.7, 1.4));
    return Math.round(100 * Math.pow(level - 0.7, 1.15));
}

export function researchXpToNext(level) {
    return 20 * (level + 1);
}

export function getCurrentLocalTick(offsetMs = 0) {
    return Math.floor((Date.now() + offsetMs) / TICK_DURATION);
}

export function getClockOffset(serverTime) {
    return Date.parse(serverTime) - Date.now();
}

export function getAffinityIndex(affinity) {
    return affinities.findIndex(x => x === affinity);
}

export function formatNumber(value) {
    if (Math.abs(value) < 1000) return String(Number(value.toPrecision(3)));

    const units = ["k", "m", "b", "t"];
    const tier = Math.floor(Math.log10(Math.abs(value)) / 3) - 1;
    const scaled = value / Math.pow(1000, tier + 1);

    return `${Number(scaled.toPrecision(3))}${units[tier] || ""}`;
}

export function numberCompare(a, b, comp = "lt") {
    switch (comp) {
        case "lt": return a < b;
        case "le": return a <= b;
        case "gt": return a > b;
        case "ge": return a >= b;
        case "eq": return a === b;
        case "ne": return a !== b;
        default: return false;
    }
}

export function checkConditions(data, state, conditionsTable, conditions, op = "and") {
    if (!conditions) return true;

    if (op === "and") {
        return conditions.every(condition => conditionsTable[condition.type]?.(data, state, condition))
    } else if (op === "or") {
        return conditions.some(condition => conditionsTable[condition.type]?.(data, state, condition))
    }

    return false;
}

export function isAgentOnExpedition(state, agentId) {
    return state.expeditions.some(expedition => expedition.agent_ids.includes(agentId));
}

export function findAgentExpedition(state, agentId) {
    for (const expedition of state.expeditions) {
        if (expedition.agent_ids.includes(agentId)) return expedition;
    }
    return null;
}

export function createInitialState(serverTick) {
    return {
        game_tick: 0,
        latest_simulated_tick: serverTick,
        currency: 50_000,
        inventory: { weapons: {}, armor: {}, gifts: {} },
        claimed_quests: [],
        hiring: null,
        next_agent_id: 1,
        agents: {},
        subjects: Object.fromEntries(
            STARTER_SUBJECT_IDS.map(id => [id, { research_level: 0, research_xp: 0 }])
        ),
        departments: [
            {
                label: "Department 1",
                cycle_length: 8,
                cycle_block: 0,
                agent_ids: Array.from({ length: MAX_DEPARTMENT_AGENTS }, () => null),
                subject_ids: Array.from({ length: MAX_DEPARTMENT_SUBJECTS }, () => null),
                schedule: {}
            },
        ],
        next_expedition_id: 1,
        expeditions: [],
        finished_expeditions: [],
        cleared_expeditions: [],
        pending_events: [],
        reports: [],
        settings: {}
    };
}