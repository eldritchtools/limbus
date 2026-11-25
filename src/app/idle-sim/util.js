import { HP_PER_LEVEL, MAX_AGENT_LEVEL, MAX_DEPARTMENT_AGENTS, MAX_DEPARTMENT_SUBJECTS, MAX_SP, START_HP, START_WE, STARTER_SUBJECT_IDS, TICK_DURATION, WE_PER_LEVEL } from "./constants";
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

export function evaluateTarget(options, targeting) {
    if (options.length === 0) return [];

    if (targeting === "all") return options;
    if (targeting === "random") return [options[Math.floor(Math.random() * options.length)]];
    if (targeting === "highest_hp") {
        const target = Math.max(...options.map(x => x.hp)) - 1e-7;
        const optionsFiltered = options.filter(x => x.hp >= target);
        return [optionsFiltered[Math.floor(Math.random() * optionsFiltered.length)]];
    }

    return [];
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

export function createInitialDevState(data, serverTick) {
    return {
        game_tick: 0,
        latest_simulated_tick: serverTick,
        currency: 1_000_000_000,
        inventory: {
            weapons: Object.fromEntries(Object.entries(data.weapons).map(([id, weapon]) => [id, weapon.max_copies ?? 5])),
            armor: Object.fromEntries(Object.entries(data.armor).map(([id, armor]) => [id, armor.max_copies ?? 5])),
            gifts: Object.fromEntries(Object.entries(data.gifts).map(([id, gift]) => [id, gift.max_copies ?? 5]))
        },
        claimed_quests: [...Object.keys(data.quests)],
        hiring: null,
        next_agent_id: 2,
        agents: {
            1: {
                id: 1,
                name: "Default",
                level: 100,
                xp: 0,
                unspent_points: 0,
                max_hp: START_HP + (100 - 1) * HP_PER_LEVEL,
                work_efficiency: START_WE + (100 - 1) * WE_PER_LEVEL,
                offense: new Array(7).fill(100),
                hp: START_HP + (100 - 1) * HP_PER_LEVEL,
                sp: MAX_SP,
                statuses: [],
                weapon: null,
                armor: null,
                gifts: [],
            }
        },
        subjects: Object.fromEntries(
            Object.entries(data.subjects).map(([id,]) => [id, { research_level: 0, research_xp: 0 }])
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
        cleared_expeditions: [...Object.keys(data.expeditions)],
        pending_events: [],
        reports: [],
        settings: {}
    };
}