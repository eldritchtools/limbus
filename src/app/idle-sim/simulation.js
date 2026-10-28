import { canWork, isIncapacitated, isPanicked } from "./agents";
import {
    MAX_OFFLINE_TICKS, MAX_REPORTS, OUTCOMES, SP_EFFICIENCY_SWING, PAYOUT_PER_WE,
    MAX_SP, MIN_SP, BREAK_HP_PERCENT_HEAL, BREAK_SP_HEAL, INCAPACITATION_TICKS, PANIC_TICKS,
    HP_PER_LEVEL, POINTS_PER_LEVEL, WE_PER_LEVEL, MAX_AGENT_LEVEL,
    SP_COMBAT_SWING, MAX_EXPEDITION_TICKS,
} from "./constants";
import { resolveGearDamageEffects } from "./effects";
import { resolveEnemyDamageStatEffects, resolveEnemyDamageEffects, resolveEnemyTickEndEffects } from "./enemies";
import { constructEnemyState } from "./expeditions";
import { getAgentEffectiveStats, grantGear } from "./gear";
import { getSetting } from "./settings";
import { resolveSubjectPostWorkEffects } from "./subjects";
import { agentXpToNext, researchXpToNext, sum } from "./util";

function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export function getEffectiveWE(data, state, agent, subject, stats = getAgentEffectiveStats(data, state, agent)) {
    let result = stats.work_efficiency;
    for (let i = 0; i < stats.length; i++) {
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
            entry = { action: "cannot_work" };
        }

        report.entries.push({ agent_id: agent.id, department_id: departmentIndex, ...entry });
    }

    department.cycle_block = (slot + 1) % department.cycle_length;
}

function getDamage(offense, defense) {
    let damage = 0;
    for (let i = 0; i < offense.length; i++) damage += offense[i] * defense[i];
    return damage;
}

function resolveExpedition(data, state, expedition, report) {
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
            offense: enemyData.offense,
            defense: enemyData.defense,
        };
    });

    resolveEnemyDamageStatEffects(data, { enemyState: expedition.enemy_state }, enemyStats);

    const damageToEnemies = enemyStats.map(() => 0);
    const damageToAgents = agents.map(() => 0);

    agentStats.forEach((agent, a) => {
        enemyStats.forEach((enemy, e) => {
            const { damageToEnemy, damageToAgent } = resolveEnemyDamageEffects(
                data,
                { enemyState: expedition.enemy_state, enemyIndex: e, agentState: agents, agentIndex: a },
                getDamage(agent.offense / enemyStats.length, enemy.defense),
                getDamage(enemy.offense / agents.length, agent.defense)
            );
            
            const { damageToEnemy: dte, damageToAgent: dta } = resolveGearDamageEffects(
                data,
                { enemyState: expedition.enemy_state, enemyIndex: e, agentState: agents, agentIndex: a },
                damageToEnemy,
                damageToAgent
            );

            damageToEnemies[e] += dte;
            damageToAgents[a] += dta;
        });
    });

    resolveGearExpeditionEffects(data, { enemyState: expedition.enemy_state, agents, defeated });

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

    resolveEnemyTickEndEffects(data, { enemyState: expedition.enemy_state });
    resolveGearExpeditionEffects(data, { enemyState: expedition.enemy_state, agents, defeated });

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

    report.expeditions.push({
        expedition_id: expedition.expedition_id,
        wave,
        damage_dealt: sum(damageToEnemies),
        damage_taken: sum(damageToAgents),
        enemies_defeated: defeated,
        result,
    });

    if (result) finishExpedition(state, expedition, result, report);
}

function grantExpeditionRewards(data, state, expedition, rewards, report) {
    if (rewards.xp) {
        for (const agentId of expedition.agent_ids) {
            const agent = state.agents[agentId];
            if (agent && addAgentXp(agent, rewards.xp)) {
                report.events.push({ type: "level_up", agent_id: agent.id, level: agent.level });
            }
        }
    }

    for (const drop of rewards.drops ?? []) {
        if (Math.random() < drop.chance && grantGear(data, state, drop.type, drop.id)) {
            report.events.push({ type: "drop", gear_type: drop.type, id: drop.id });
        }
    }

    for (const subjectId of rewards.subjects ?? []) {
        if (!state.subjects[subjectId]) {
            state.subjects[subjectId] = { research_level: 1, research_xp: 0 };
            report.events.push({ type: "subject_unlocked", subject_id: subjectId });
        }
    }
}

function finishExpedition(data, state, expedition, result, report) {
    expedition.finished = true;

    if (result === "failed") {
        report.events.push({ type: "expedition_failed", expedition_id: expedition.expedition_id });
        return;
    }

    const expeditionData = data.expeditions[expedition.expedition_id];
    grantExpeditionRewards(data, state, expedition, expeditionData.reward, report);

    if (!state.cleared_expeditions.includes(expedition.expedition_id)) {
        state.cleared_expeditions.push(expedition.expedition_id);

        if (expeditionData.first_clear_reward)
            grantExpeditionRewards(data, state, expedition, expeditionData.first_clear_reward, report);
    }

    report.events.push({ type: "expedition_cleared", expedition_id: expedition.expedition_id });

    if (expeditionData.events) {
        let rand = Math.random();
        for (const event of expeditionData.events) {
            rand -= event.chance;
            if (rand > 0) continue;

            state.pending_events.push({
                event_id: event.id,
                expedition_id: expedition.expedition_id,
                agent_ids: [...expedition.agent_ids],
            });
            report.events.push({ type: "event_triggered", expedition_id: expedition.expedition_id, event_id: event.id });
            break;
        }
    }
}

function resolveExpeditions(data, state, report) {
    for (const expedition of state.expeditions) resolveExpedition(data, state, expedition, report);
    state.expeditions = state.expeditions.filter(expedition => !expedition.finished);
}

function restUnassignedAgents(state) {
    const assigned = new Set();
    for (const department of state.departments) {
        for (const agentId of department.agent_ids) assigned.add(agentId);
    }
    for (const expedition of state.expeditions) {
        for (const agentId of expedition.agent_ids) assigned.add(agentId);
    }

    for (const agent of Object.values(state.agents)) {
        if (!assigned.has(agent.id) && canWork(agent) && agent.hp > 0) {
            takeBreak(agent);
        }
    }
}

function removeAgent(state, agent, report) {
    delete state.agents[agent.id];

    for (const department of state.departments) {
        department.agent_ids = department.agent_ids.filter(id => id !== agent.id);
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

        if (onExpedition.has(agent.id)) continue;

        if (agent.hp <= 0) {
            if (getSetting(state, "permadeath")) {
                dead.push(agent);
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

    resolveExpeditions(data, state, report);

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
