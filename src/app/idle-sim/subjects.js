import { checkConditions, numberCompare } from "./util";

const VARS = {
    working_agent_level: (data, state) => state.agent.level
}

// const WORK_STAT_EFFECTS = {
// };

// export function resolveSubjectWorkStatEffects(data, state) {
// }

const WORK_CONDITIONS = {
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
