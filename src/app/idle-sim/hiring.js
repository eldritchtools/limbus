import {
    BASE_OFFENSE, BOOSTED_OFFENSE,
    POINTS_PER_LEVEL, HP_PER_LEVEL, WE_PER_LEVEL,
    XP_SKIP_COST, AGENT_BASE_COST, AGENT_COST_GROWTH, AGENT_REROLL_COST_RATIO, CATCHUP_LEVEL_GAP,
    BOOSTED_POINT_CHANCE,
    MAX_SP,
    START_HP,
    START_WE
} from "./constants";
import { agentXpToNext } from "./util";

function pickAffinity(boosted) {
    const options = Math.random() < BOOSTED_POINT_CHANCE ?
        boosted : [0, 1, 2, 3, 4, 5, 6].filter(x => !boosted.includes(x));
    return options[Math.floor(Math.random() * options.length)];
}

export function getMaxStartLevel(state) {
    const highest = Math.max(1, ...Object.values(state.agents).map(agent => agent.level));
    return Math.max(1, highest - CATCHUP_LEVEL_GAP);
}

function getSkippedXp(startLevel) {
    let xp = 0;
    for (let level = 1; level < startLevel; level++) xp += agentXpToNext(level);
    return xp;
}

function getBaseAgentCost(state) {
    return Math.round(AGENT_BASE_COST * AGENT_COST_GROWTH ** Object.keys(state.agents).length);
}

export function getAgentHireCost(state, startLevel = 1) {
    return getBaseAgentCost(state) + Math.round(getSkippedXp(startLevel) * XP_SKIP_COST);
}

export function getRerollCost(state, startLevel = 1) {
    return Math.round(getAgentHireCost(state, startLevel) * AGENT_REROLL_COST_RATIO);
}

function createCandidate(startLevel) {
    const indexes = [0, 1, 2, 3, 4, 5, 6];
    for (let i = indexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [indexes[i], indexes[j]] = [indexes[j], indexes[i]];
    }

    const boosted = indexes.slice(0, 3);
    const offense = Array(7).fill(BASE_OFFENSE);
    for (const i of boosted) offense[i] = BOOSTED_OFFENSE;

    for (let i = 0; i < POINTS_PER_LEVEL * (startLevel - 1); i++) {
        offense[pickAffinity(boosted)] += 1;
    }

    return { offense };
}

export function createCandidates(startLevel) {
    return Array.from({ length: 3 }, () => createCandidate(startLevel));
}

export function startHiring(state, startLevel = 1) {
    if (state.hiring) return null;
    if (!Number.isInteger(startLevel) || startLevel < 1 || startLevel > getMaxStartLevel(state)) return null;

    const cost = getAgentHireCost(state, startLevel);
    if (state.currency < cost) return null;

    const nextState = structuredClone(state);
    nextState.currency -= cost;
    nextState.hiring = { start_level: startLevel, candidates: createCandidates(startLevel) };
    return nextState;
}

export function rerollCandidates(state) {
    if (!state.hiring) return null;

    const cost = getRerollCost(state);
    if (state.currency < cost) return null;

    const nextState = structuredClone(state);
    nextState.currency -= cost;
    nextState.hiring.candidates = createCandidates(state.hiring.start_level);
    return nextState;
}

function createAgent(id, name, offense) {
    return {
        id,
        name,
        level: 1,
        xp: 0,
        unspent_points: 0,
        max_hp: START_HP,
        work_efficiency: START_WE,
        offense,
        hp: START_HP,
        sp: MAX_SP,
        statuses: [],
        weapon: null,
        armor: null,
        gifts: [],
    };
}

export function chooseCandidate(state, index) {
    if (!state.hiring?.candidates[index]) return null;

    const nextState = structuredClone(state);
    const { start_level, candidates } = nextState.hiring;
    const id = nextState.next_agent_id;
 
    const agent = createAgent(id, `Agent ${id}`, candidates[index].offense);
    const levelsGained = start_level - 1;
    agent.level = start_level;
    agent.max_hp += HP_PER_LEVEL * levelsGained;
    agent.hp = agent.max_hp;
    agent.work_efficiency += WE_PER_LEVEL * levelsGained;
 
    nextState.agents[id] = agent;
    nextState.next_agent_id = id + 1;
    nextState.hiring = null;
    return nextState;
}