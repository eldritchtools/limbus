import {
    MAX_OFFLINE_TICKS, MAX_REPORTS, OUTCOMES, SP_EFFICIENCY_SWING, PAYOUT_PER_WE,
    MAX_SP, MIN_SP, BREAK_HP_PERCENT_HEAL, BREAK_SP_HEAL, INCAPACITATION_TICKS,
    HP_PER_LEVEL, POINTS_PER_LEVEL, WE_PER_LEVEL, MAX_AGENT_LEVEL,
} from "./constants";
import { agentXpToNext, researchXpToNext } from "./util";

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

function sum(values) {
    return values.reduce((total, value) => total + value, 0);
}

export function getEffectiveWE(data, agent, subject) {
    let result = agent.work_efficiency;
    const weaponStats = agent.weapon ? data.weapons[agent.weapon] : null;
    for (let i = 0; i < agent.offense.length; i++) {
        result += agent.offense[i] * (weaponStats?.affinities?.[i] ?? 1) * subject.defense[i];
    }
    return result;
}

export function getOutcomeChances(data, agent, subject) {
    const ratio = getEffectiveWE(data, agent, subject) / subject.we_req * (1 + (agent.sp / MAX_SP) * SP_EFFICIENCY_SWING);
    const d = ratio - 1;

    const good = clamp(0.4 + 1.2 * d, 0, 0.95);
    const bad = clamp(0.2 - 1.2 * d, 0, 0.85);

    return { good, avg: 1 - good - bad, bad };
}

export function rollOutcome(chances, roll = Math.random()) {
    if (roll < chances.good) return "good";
    if (roll < chances.good + chances.bad) return "bad";
    return "avg";
}

export function getDefenseFactor(subject) {
    const averageDefense = sum(subject.defense) / subject.defense.length;
    return clamp(1.5 - 0.5 * averageDefense, 0.5, 1.5);
}

function takeBreak(agent) {
    agent.hp += agent.max_hp * BREAK_HP_PERCENT_HEAL;
    agent.sp += BREAK_SP_HEAL;

    return { action: "break" };
}

function addAgentXp(agent, xp) {
    agent.xp += xp;
    const startLevel = agent.level;

    while (agent.level < MAX_AGENT_LEVEL && agent.xp >= agentXpToNext(agent.level)) {
        agent.xp -= agentXpToNext(agent.level);
        agent.level += 1;
        agent.max_hp += HP_PER_LEVEL;
        agent.hp += HP_PER_LEVEL;
        agent.work_efficiency += WE_PER_LEVEL;
        agent.unspent_points += POINTS_PER_LEVEL;
    }

    if (agent.level >= MAX_AGENT_LEVEL) agent.xp = 0;
    return agent.level > startLevel;
}

function addResearchXp(research, subject, xp) {
    research.research_xp += xp;
    const startLevel = research.research_level;

    while (research.research_level < subject.max_level && research.research_xp >= researchXpToNext(research.research_level)) {
        research.research_xp -= researchXpToNext(research.research_level);
        research.research_level += 1;
    }

    if (research.research_level >= subject.max_level) research.research_xp = 0;
    return research.research_level > startLevel;
}

function doWork(data, state, agent, subject, report) {
    const outcome = rollOutcome(getOutcomeChances(data, agent, subject));
    const mult = OUTCOMES[outcome];

    const payoutBase = PAYOUT_PER_WE * subject.we_req * getDefenseFactor(subject) * subject.reward_mult;
    const currency = Math.round(payoutBase * mult.reward);
    const xp = Math.round(payoutBase / 100 * mult.reward);

    let damage = 0;
    const armorStats = agent.armor ? data.armor[agent.armor] : null;
    for (let i = 0; i < subject.offense.length; i++) {
        damage += subject.offense[i] * (armorStats?.defense?.[i] ?? 1);
    }
    agent.hp -= damage * mult.damage;
    agent.sp -= subject.sp_cost * mult.damage;
    state.currency += currency;

    if (addAgentXp(agent, xp)) {
        report.events.push({ type: "level_up", agent_id: agent.id, level: agent.level });
    }

    const research = state.subjects[subject.id];
    if (addResearchXp(research, subject, mult.subject_xp)) {
        report.events.push({ type: "research_level_up", subject_id: subject.id, level: research.research_level });
    }

    return {
        action: "work",
        subject_id: subject.id,
        outcome,
        currency,
        xp,
    };
}

function recoverAgents(state, tick, report) {
    for (const agent of state.agents) {
        if (agent.incapacitated_until !== null && tick >= agent.incapacitated_until) {
            agent.incapacitated_until = null;
            agent.hp = agent.max_hp;
            agent.sp = MAX_SP;
            report.events.push({ type: "recovered", agent_id: agent.id });
        }
    }
}

function resolveDepartment(data, state, department, departmentIndex, report) {
    const slot = department.cycle_block % department.cycle_length;
    const workersBySubject = {};

    for (const agentId of department.agent_ids) {
        const agent = state.agents.find((a) => a.id === agentId);
        if (!agent) continue;

        let entry;

        if (agent.incapacitated_until !== null) {
            entry = { action: "incapacitated" };
        } else {
            const subjectId = department.schedule[agentId]?.[slot] ?? null;
            const subject = data.subjects[subjectId];
            const workers = workersBySubject[subjectId] ?? 0;

            if (subject && state.subjects[subjectId] && department.subject_ids.includes(subjectId) && workers < subject.max_agents) {
                workersBySubject[subjectId] = workers + 1;
                entry = doWork(data, state, agent, subject, report);
            } else {
                entry = takeBreak(agent);
            }
        }

        report.entries.push({ agent_id: agent.id, department_id: departmentIndex, ...entry });
    }

    department.cycle_block = (slot + 1) % department.cycle_length;
}

function restUnassignedAgents(state) {
    const assigned = new Set();
    for (const department of state.departments) {
        for (const agentId of department.agent_ids) assigned.add(agentId);
    }

    for (const agent of state.agents) {
        if (!assigned.has(agent.id) && agent.incapacitated_until === null) {
            takeBreak(agent);
        }
    }
}

function finishTick(state, tick, report) {
    for (const agent of state.agents) {
        if (agent.incapacitated_until !== null) continue;

        agent.hp = clamp(agent.hp, 0, agent.max_hp);
        agent.sp = clamp(agent.sp, MIN_SP, MAX_SP);

        if (agent.hp <= 0 || agent.sp <= MIN_SP) {
            agent.incapacitated_until = tick + INCAPACITATION_TICKS;
            report.events.push({ type: "incapacitated", agent_id: agent.id, cause: agent.hp <= 0 ? "hp" : "sp" });
        }
    }
}

function runTick(data, state) {
    const tick = state.game_tick;
    const report = { tick, entries: [], events: [] };

    recoverAgents(state, tick, report);

    for (let i = 0; i < state.departments.length; i++) {
        resolveDepartment(data, state, department, i, report);
    }

    restUnassignedAgents(state);
    finishTick(state, tick, report);

    state.reports.push(report);
    if (state.reports.length > MAX_REPORTS) {
        state.reports.splice(0, state.reports.length - MAX_REPORTS);
    }

    state.game_tick += 1;
}

export function simulateTick(data, state) {
    const nextState = structuredClone(state);
    runTick(data, nextState);
    return nextState;
}

export function simulateUntil(data, state, targetTick) {
    const elapsed = Math.max(0, targetTick - state.latest_simulated_tick);
    const count = Math.min(elapsed, MAX_OFFLINE_TICKS);

    const nextState = structuredClone(state);

    for (let i = 0; i < count; i++) {
        runTick(data, nextState);
    }

    nextState.latest_simulated_tick = Math.max(state.latest_simulated_tick, targetTick);
    return nextState;
}
