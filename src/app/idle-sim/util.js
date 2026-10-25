import { MAX_SP, TICK_DURATION } from "./constants";

export function agentXpToNext(level) {
    return Math.round(120 * level ** 1.25);
}

export function researchXpToNext(level) {
    return 25 * level;
}

export function getCurrentLocalTick(offsetMs = 0) {
    return Math.floor((Date.now() + offsetMs) / TICK_DURATION);
}

export function getClockOffset(serverTime) {
    return Date.parse(serverTime) - Date.now();
}

export function createAgent(id, name, offense) {
    return {
        id,
        name,
        level: 1,
        xp: 0,
        unspent_points: 0,
        max_hp: 100,
        work_efficiency: 25,
        offense,
        hp: 100,
        sp: MAX_SP,
        incapacitated_until: null,
        weapon: null,
        armor: null,
        gifts: [],
    };
}



export function createInitialState(serverTick) {
    return {
        game_tick: 0,
        latest_simulated_tick: serverTick,
        currency: 0,
        inventory: { weapons: {}, armor: {}, gifts: {} },
        hiring: null,
        next_agent_id: 2,
        agents: [createAgent(1, "Agent 1", [5, 5, 5, 3, 3, 3, 3])],
        subjects: {
            "S-P01": { research_level: 1, research_xp: 0 },
        },
        departments: [
            {
                label: "Department 1",
                cycle_length: 8,
                cycle_block: 0,
                agent_ids: [1],
                subject_ids: ["S-P01"],
                schedule: {
                    1: ["S-P01", "S-P01", "S-P01", "S-P01", "S-P01", "S-P01", null, null],
                },
            },
        ],
        reports: [],
    };
}
