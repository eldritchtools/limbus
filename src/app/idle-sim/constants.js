// Meta
export const SAVE_VERSION = 1;
export const TICK_CHECK_INTERVAL = 10_000;
export const AUTOSAVE_INTERVAL = 300_000;
export const TICK_DURATION = 3_600_000;
export const MAX_OFFLINE_TICKS = 24 * 7;

// Simulation
export const OUTCOMES = {
    good: { reward: 1.25, damage: 0.75, subject_xp: 2 },
    avg: { reward: 1.0, damage: 1.0, subject_xp: 1 },
    bad: { reward: 0.5, damage: 1.5, subject_xp: 0 },
};
export const SP_EFFICIENCY_SWING = 0.25;
export const PAYOUT_PER_WE = 20;
export const BREAK_HP_PERCENT_HEAL = 0.2;
export const BREAK_SP_HEAL = 15;
export const INCAPACITATION_TICKS = 24;

// Reports
export const MAX_REPORTS = 200;

// Facility
export const MAX_DEPARTMENT_AGENTS = 5;
export const MAX_DEPARTMENT_SUBJECTS = 4;
export const MAX_CYCLE_LENGTH = 48;

export const DEPARTMENT_BASE_COST = 150_000;
export const DEPARTMENT_COST_GROWTH = 2.5;

// Agents
export const MAX_AGENT_LEVEL = 30;
export const POINTS_PER_LEVEL = 3;
export const HP_PER_LEVEL = 5;
export const WE_PER_LEVEL = 3;
export const MAX_SP = 45;
export const MIN_SP = -45;
export const MAX_AGENT_GIFTS = 5;

// Gear
export const DEFAULT_GEAR_COST_GROWTH = 1.25;

// Hiring
export const BASE_OFFENSE = 3;
export const BOOSTED_OFFENSE = 5;

export const AGENT_BASE_COST = 20_000;
export const AGENT_COST_GROWTH = 1.15;
export const AGENT_REROLL_COST_RATIO = 0.1;

export const XP_SKIP_COST = 100;
export const CATCHUP_LEVEL_GAP = 3;

export const BOOSTED_POINT_CHANCE = 0.9;

// Subjects

