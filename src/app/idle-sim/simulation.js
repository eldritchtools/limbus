import { addAgentXp, canWork, isIncapacitated, isPanicked } from "./agents";
import {
    MAX_OFFLINE_TICKS, MAX_REPORTS, OUTCOMES, SP_EFFICIENCY_SWING, PAYOUT_PER_WE,
    MAX_SP, MIN_SP, BREAK_HP_PERCENT_HEAL, BREAK_SP_HEAL, INCAPACITATION_TICKS, PANIC_TICKS,
    SP_COMBAT_SWING, MAX_EXPEDITION_TICKS,
} from "./constants";
import { resolveGearDamageEffects, resolveGearExpeditionEffects } from "./effects";
import { resolveEnemyDamageStatEffects, resolveEnemyDamageEffects, resolveEnemyTickEndEffects } from "./enemies";
import { constructEnemyState } from "./expeditions";
import { getAgentEffectiveStats, } from "./gear";
import { getSetting } from "./settings";
import { resolveDamageStatuses } from "./statuses";
import { resolveSubjectPostWorkEffects } from "./subjects";
import { isAgentOnExpedition, researchXpToNext, sum } from "./util";

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export function getEffectiveWE(data, state, agent, subject, stats = getAgentEffectiveStats(data, state, agent)) {
    let result = stats.work_efficiency;
    for (let i = 0; i < stats.offense.length; i++) {
        result += stats.offense[i] * subject.defense[i];
    }
    return result;
}

export function getOutcomeChances(data, state, agent, subject, stats = getAgentEffectiveStats(data, state, agent)) {
    const ratioBonus = 1 + (agent.sp / MAX_SP) * SP_EFFICIENCY_SWING + (state.subjects[subject.id].research_level / 100);
    const ratio = getEffectiveWE(data, state, agent, subject, stats) / subject.we_req * ratioBonus;
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
    const stats = getAgentEffectiveStats(data, state, agent);
    const outcome = rollOutcome(getOutcomeChances(data, state, agent, subject, stats));
    const mult = OUTCOMES[outcome];

    const payoutBase = PAYOUT_PER_WE * subject.we_req * getDefenseFactor(subject) * subject.reward_mult;
    const currency = Math.round(payoutBase * mult.reward);
    const xp = Math.round(payoutBase / 100 * mult.reward);

    let damage = 0;
    for (let i = 0; i < subject.offense.length; i++) {
        damage += subject.offense[i] * stats.defense[i];
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
    for (const agent of Object.values(state.agents)) {
        if (isAgentOnExpedition(state, agent.id)) continue;

        const incapacitated = agent.statuses.find(x => x.type === "incapacitated");
        if (incapacitated && tick >= incapacitated.until) {
            agent.hp = agent.max_hp;
            agent.statuses = agent.statuses.filter(x => x.type !== "incapacitated");
            report.events.push({ type: "recovered", agent_id: agent.id, from: "incapacitated" });
        }

        const panic = agent.statuses.find(x => x.type === "panic");
        if (panic && tick >= panic.until) {
            agent.sp = 0;
            agent.statuses = agent.statuses.filter(x => x.type !== "panic");
            report.events.push({ type: "recovered", agent_id: agent.id, from: "panic" });
        }
    }
}

function resolveDepartment(data, state, department, departmentIndex, report) {
    const slot = department.cycle_block % department.cycle_length;
    const workersBySubject = {};

    for (const agentId of department.agent_ids) {
        const agent = state.agents[agentId];
        if (!agent) continue;

        let entry;

        if (canWork(agent)) {
            const subjectId = department.schedule[agentId]?.[slot] ?? null;
            const subject = data.subjects[subjectId];
            const workers = workersBySubject[subjectId] ?? 0;

            if (subject && state.subjects[subjectId] && department.subject_ids.includes(subjectId) && workers < subject.max_agents) {
                workersBySubject[subjectId] = workers + 1;
                entry = doWork(data, state, agent, subject, report);
            } else {
                entry = takeBreak(agent);
            }
        } else {
            entry = { action: "cannot_work", statuses: agent.statuses.filter(x => x.type === "incapacitated" || x.type === "panic") };
        }

        report.entries.push({ agent_id: agent.id, department_id: departmentIndex, ...entry });
    }

    department.cycle_block = (slot + 1) % department.cycle_length;
}

function getDamage(offense, defense, attackerState, defenderState) {
    const { offense: newOffense, defense: newDefense } = resolveDamageStatuses(offense, defense, attackerState, defenderState);
    let damage = 0;
    for (let i = 0; i < newOffense.length; i++) damage += newOffense[i] * newDefense[i];
    return damage;
}

function resolveExpedition(data, state, expedition) {
    const expeditionData = data.expeditions[expedition.expedition_id];
    const wave = expedition.wave;

    const agents = expedition.agent_ids
        .map(id => state.agents[id])
        .filter(agent => agent && agent.hp > 0);

    const agentStats = agents.map(agent => {
        const stats = getAgentEffectiveStats(data, state, agent);
        const spMultiplier = 1 + (agent.sp / MAX_SP) * SP_COMBAT_SWING;
        return { ...stats, offense: stats.offense.map(x => x * spMultiplier) };
    });

    const enemyStats = expedition.enemy_state.map(enemy => {
        const enemyData = data.enemies[enemy.id];

        return {
            offense: [...enemyData.offense],
            defense: [...enemyData.defense],
        };
    });

    resolveEnemyDamageStatEffects(data, { state, enemyState: expedition.enemy_state }, enemyStats);

    const damageToEnemies = enemyStats.map(() => 0);
    const damageToAgents = agents.map(() => 0);

    agentStats.forEach((agent, a) => {
        enemyStats.forEach((enemy, e) => {
            const { damageToEnemy, damageToAgent } = resolveEnemyDamageEffects(
                data,
                { state, enemyState: expedition.enemy_state, enemyIndex: e, agentState: agents, agentIndex: a },
                { enemy, agent },
                getDamage(agent.offense, enemy.defense, agents[a], expedition.enemy_state[e]) / enemyStats.length,
                getDamage(enemy.offense, agent.defense, expedition.enemy_state[e], agents[a]) / agents.length
            );

            const { damageToEnemy: dte, damageToAgent: dta } = resolveGearDamageEffects(
                data,
                { state, enemyState: expedition.enemy_state, enemyIndex: e, agentState: agents, agentIndex: a },
                { enemy, agent },
                damageToEnemy,
                damageToAgent
            );

            damageToEnemies[e] += dte;
            damageToAgents[a] += dta;
        });
    });

    let defeated = 0;
    expedition.enemy_state.forEach((enemy, e) => {
        enemy.hp -= damageToEnemies[e];
        if (enemy.hp <= 0) defeated += 1;
    })

    expedition.enemy_state = expedition.enemy_state.filter(enemy => enemy.hp > 0);

    agents.forEach((agent, a) => {
        agent.hp -= damageToAgents[a];
    });

    expedition.ticks += 1;

    resolveEnemyTickEndEffects(data, { state, enemyState: expedition.enemy_state });
    resolveGearExpeditionEffects(data, { state, enemyState: expedition.enemy_state, agents, defeated });

    const cleared = expedition.enemy_state.length === 0;
    const anyAgentUp = agents.some(agent => agent.hp > 0);
    let result = null;

    if (cleared && wave === expeditionData.waves.length - 1) {
        result = "cleared";
    } else if (cleared) {
        expedition.wave += 1;
        expedition.enemy_state = constructEnemyState(data, expedition.expedition_id, expedition.wave);
    } else if (!anyAgentUp || expedition.ticks >= MAX_EXPEDITION_TICKS) {
        result = "failed";
    }

    if (result) finishExpedition(data, state, expedition, result);
}

function generateExpeditionRewards(state, rewards, list = []) {
    if (rewards.xp) {
        const xp = list.find(x => x.type === "xp");
        if (xp) xp.value += rewards.xp;
        else list.push({ type: "xp", value: rewards.xp });
    }

    for (const drop of rewards.drops ?? []) {
        if (Math.random() < drop.chance) {
            list.push({ type: "drop", dropType: drop.type, dropId: drop.id });
        }
    }

    for (const subjectId of rewards.subjects ?? []) {
        if (!state.subjects[subjectId]) {
            list.push({ type: "subject", id: subjectId })
        }
    }

    return list;
}

function finishExpedition(data, state, expedition, result) {
    expedition.finished = true;
    expedition.result = result;

    state.finished_expeditions.push(expedition);

    if (result === "failed") return;

    const expeditionData = data.expeditions[expedition.expedition_id];

    expedition.rewards = generateExpeditionRewards(state, expeditionData.reward);

    if (!state.cleared_expeditions.includes(expedition.expedition_id)) {
        state.cleared_expeditions.push(expedition.expedition_id);

        if (expeditionData.first_clear_reward)
            expedition.rewards = generateExpeditionRewards(state, expeditionData.first_clear_reward, expedition.rewards);
    }

    if (expeditionData.events) {
        let rand = Math.random();
        for (const event of expeditionData.events) {
            rand -= event.chance;
            if (rand > 0) continue;

            expedition.event = event.id;
            break;
        }
    }
}

function resolveExpeditions(data, state) {
    for (const expedition of state.expeditions) resolveExpedition(data, state, expedition);

    const done = state.expeditions.filter(expedition => expedition.finished);
    state.expeditions = state.expeditions.filter(expedition => !expedition.finished);

    for (const expedition of done) {
        delete expedition.enemy_state;
        delete expedition.finished;
        delete expedition.wave;
        delete expedition.ticks;
    }
}

function restUnassignedAgents(state) {
    const assigned = new Set();
    for (const department of state.departments) {
        for (const agentId of department.agent_ids) if (agentId) assigned.add(agentId);
    }
    for (const expedition of state.expeditions) {
        for (const agentId of expedition.agent_ids) assigned.add(agentId);
    }
    for (const expedition of state.finished_expeditions) {
        for (const agentId of expedition.agent_ids) assigned.add(agentId);
    }
    for (const event of state.pending_events) {
        for (const agentId of event.agent_ids) assigned.add(agentId);
    }

    for (const agent of Object.values(state.agents)) {
        if (!assigned.has(agent.id) && !isAgentOnExpedition(state, agent.id) && canWork(agent) && agent.hp > 0) {
            takeBreak(agent);
        }
    }
}

function removeAgent(state, agent, report) {
    delete state.agents[agent.id];

    for (const department of state.departments) {
        department.agent_ids = department.agent_ids.map(id => id === agent.id ? null : id);
        delete department.schedule[agent.id];
    }

    report.events.push({ type: "died", agent_id: agent.id, name: agent.name });
}

function finishTick(state, tick, report) {
    const dead = [];
    const onExpedition = new Set(state.expeditions.flatMap(expedition => expedition.agent_ids));

    for (const agent of Object.values(state.agents)) {
        agent.hp = clamp(agent.hp, 0, agent.max_hp);
        agent.sp = clamp(agent.sp, MIN_SP, MAX_SP);

        agent.statuses = agent.statuses.filter(status =>
            status.type === "incapacitated" || status.type === "panic" || status.until > tick);

        if (onExpedition.has(agent.id)) continue;

        if (agent.hp <= 0) {
            if (getSetting(state, "permadeath")) {
                dead.push(agent);
                continue;
            } else if (!isIncapacitated(agent)) {
                agent.statuses.push({ type: "incapacitated", until: tick + 1 + INCAPACITATION_TICKS });
                report.events.push({ type: "incapacitated", agent_id: agent.id });
            }
        }

        if (agent.sp <= MIN_SP && !isPanicked(agent)) {
            agent.statuses.push({ type: "panic", until: tick + 1 + PANIC_TICKS });
            report.events.push({ type: "panic", agent_id: agent.id });
        }
    }

    for (const agent of dead) removeAgent(state, agent, report);
}

function runTick(data, state) {
    const tick = state.game_tick;
    const report = { tick, entries: [], events: [] };

    recoverAgents(state, tick, report);

    for (let i = 0; i < state.departments.length; i++) {
        resolveDepartment(data, state, state.departments[i], i, report);
    }
    resolveSubjectPostWorkEffects(data, state, report);

    resolveExpeditions(data, state);

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
