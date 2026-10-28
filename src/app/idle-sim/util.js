import { STARTER_SUBJECT_IDS, TICK_DURATION } from "./constants";
import { affinities } from "../lib/constants";

export function sum(values) {
    return values.reduce((total, value) => total + value, 0);
}

export function toCurrencyStr(val) {
    return `${val} Ahn`;
}

export function agentXpToNext(level) {
    return Math.round(120 * level ** 1.15);
}

export function researchXpToNext(level) {
    return 25 * (level + 1);
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
                agent_ids: [],
                subject_ids: [],
                schedule: {}
            },
        ],
        expeditions: [],
        cleared_expeditions: [],
        pending_events: [],
        reports: [],
        settings: {}
    };
}
