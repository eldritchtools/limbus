import { OUTCOMES, PAYOUT_PER_WE } from "./constants";
import { applyStatus } from "./statuses";
import { checkConditions, clamp, numberCompare, sum } from "./util";

function getDefenseFactor(subject) {
    const averageDefense = sum(subject.defense) / subject.defense.length;
    return clamp(1.5 - 0.5 * averageDefense, 0.5, 1.5);
}

export function getSubjectPayout(data, subjectId, outcome) {
    const subjectData = data.subjects[subjectId];
    const payoutBase = PAYOUT_PER_WE * subjectData.we_req * getDefenseFactor(subjectData) * subjectData.reward_mult;
    const mult = OUTCOMES[outcome];

    return {
        currency: Math.round(payoutBase * mult.reward),
        xp: Math.round(payoutBase / 100 * mult.reward)
    }
}

const VARS = {
    working_agent_level: (data, state) => state.agent.level
}

const WORK_STAT_CONDITIONS = {
    consecutive_work_blocks: (data, state, condition) => {
        if (state.subjectState.last_worked_tick === undefined || state.subjectState.last_worked_tick < state.state.game_tick - 1) {
            state.subjectState.consecutive_work_blocks = 1;
        } else if (state.subjectState.last_worked_tick === state.state.game_tick - 1) {
            state.subjectState.consecutive_work_blocks += 1;
        }

        state.subjectState.last_worked_tick = state.state.game_tick;
        return numberCompare(state.subjectState.consecutive_work_blocks, condition.target, condition.comp)
    }
}

const WORK_STAT_EFFECTS = {
    offense_mult: (data, state, effect, stats) => {
        stats.offense = stats.offense.map(v => v * (1 + effect.value));
    },
    we_req_add: (data, state, effect, stats) => {
        stats.we_req += effect.value;
    }
};

export function resolveSubjectWorkStatEffects(data, state, agent, subjectData, subjectState) {
    const processingState = { state, agent, subjectData, subjectState };
    const stats = { offense: [...subjectData.offense], defense: [...subjectData.defense], we_req: subjectData.we_req }

    for (const effect of subjectData.effects) {
        const trueEffects = effect.effects.filter(effect => effect.type in WORK_STAT_EFFECTS);
        if (trueEffects.length === 0) continue;
        if (!checkConditions(data, processingState, WORK_STAT_CONDITIONS, effect.conditions, effect.conditionOp ?? "and")) continue;
        for (const trueEffect of trueEffects) WORK_STAT_EFFECTS[trueEffect.type]?.(data, processingState, trueEffect, stats);
    }

    return stats;
}

const WORK_CONDITIONS = {
    always: (data, state, condition) => true,
    comp_var: (data, state, condition) => {
        const val = VARS[condition.var](data, state);
        if (val === undefined) return false;
        return numberCompare(val, condition.target, condition.comp);
    },
    work_result: (data, state, condition) => state.outcome === condition.value,
    random: (data, state, condition) => Math.random() < condition.chance
};

const WORK_EFFECTS = {
    incapacitate_working_agent: (data, state, effect) => {
        state.agent.hp = 0
    },
    hp_damage_working_agent: (data, state, effect) => {
        state.agent.hp -= effect.value
    },
    sp_damage_working_agent: (data, state, effect) => {
        state.agent.sp -= effect.value
    },
    buff_target: (data, state, effect) => {
        if (effect.target === "working_agent") {
            applyStatus(data, state.state, state.agent, { type: "combat", ...effect.status });
        } else if (effect.target === "all_agents_in_dept") {
            const dept = state.state.departments.find(dept => dept.subject_ids.includes(state.subject.id));
            if (!dept) return;
            
            for (const agentId of dept.agent_ids) {
                if(!agentId) continue;
                applyStatus(data, state.state, state.state.agents[agentId], { type: "combat", ...effect.status });
            }
        }
    }
};

export function resolveSubjectWorkEffects(data, state, outcome, agent, subject) {
    const processingState = { state, outcome, agent, subject };

    for (const effect of subject.effects) {
        const trueEffects = effect.effects.filter(effect => effect.type in WORK_EFFECTS);
        if (trueEffects.length === 0) continue;
        if (!checkConditions(data, processingState, WORK_CONDITIONS, effect.conditions, effect.conditionOp ?? "and")) continue;
        for (const trueEffect of trueEffects) WORK_EFFECTS[trueEffect.type]?.(data, processingState, trueEffect);
    }
}

const POST_WORK_CONDITIONS = {
    idle: (data, state, condition) =>
        !state.report.entries.some(entry => entry.action === "work" && entry.subject_id === state.ids.subjectId),
    not_in_same_dept: (data, state, condition) =>
        !state.state.departments[state.ids.departmentIndex].subject_ids.includes(condition.id),
}

const POST_WORK_EFFECTS = {
    hp_damage_random_agent_in_dept: (data, state, effect) => {
        const agent_ids = state.state.departments[state.ids.departmentIndex].agent_ids.filter(Boolean);
        if (agent_ids.length === 0) return;
        const id = agent_ids[Math.floor(Math.random() * agent_ids.length)];
        state.state.agents[id].hp -= effect.value;
    }
};

export function resolveSubjectPostWorkEffects(data, state, report) {
    for (let i = 0; i < state.departments.length; i++) {
        const department = state.departments[i];
        for (const subjectId of department.subject_ids) {
            const subject = data.subjects[subjectId];
            if (!subject || !subject.effects) continue;

            const processingState = { state, report, ids: { departmentIndex: i, subjectId } };

            for (const effect of subject.effects) {
                const trueEffects = effect.effects.filter(effect => effect.type in POST_WORK_EFFECTS);
                if (trueEffects.length === 0) continue;
                if (!checkConditions(data, processingState, POST_WORK_CONDITIONS, effect.conditions, effect.conditionOp ?? "and")) continue;
                for (const trueEffect of trueEffects) POST_WORK_EFFECTS[trueEffect.type]?.(data, processingState, trueEffect);
            }
        }
    }
}
