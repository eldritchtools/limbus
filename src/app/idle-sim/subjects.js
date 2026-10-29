const CONDITIONS = {
    idle: (data, state, condition) => 
        state.report.entries.some(entry => entry.action === "work" && entry.subject_id === state.ids.subjectId),
    not_in_same_dept: (data, state, condition) =>
        !state.state.departments[state.ids.departmentIndex].subject_ids.includes(condition.id),
};

function checkConditions(data, state, conditions, op = "and") {
    if (!conditions) return true;

    if (op === "and") {
        return conditions.every(condition => CONDITIONS[condition.type]?.(data, state, condition))
    } else if (op === "or") {
        return conditions.some(condition => CONDITIONS[condition.type]?.(data, state, condition))
    }

    return false;
}

// const WORK_STAT_EFFECTS = {
// };

// export function resolveSubjectWorkStatEffects(data, state) {
// }

// const WORK_EFFECTS = {
// };

// export function resolveSubjectWorkEffects(data, state) {
// }

const POST_WORK_EFFECTS = {
    hp_damage_random_agent_in_dept: (data, state, effect) => {
        const agent_ids = state.state.departments[state.ids.departmentIndex].agent_ids;
        const id = agent_ids[Math.floor(Math.random() * agent_ids.length)];
        state.state.agents[id].hp -= effect.value;
    }
};

export function resolveSubjectPostWorkEffects(data, state, report) {
    for (let i = 0; i < state.departments.length; i++) {
        const department = state.departments[i];
        for (const subjectId in department.subject_ids) {
            const subject = data.subjects[subjectId];
            if (!subject.effects) continue;

            for (const effect in subject.effects) {
                if (!checkConditions(data, { state, report, ids: { departmentIndex: i, subjectId } }, effect.conditions, effect.conditionOp ?? "and")) continue;
                for (const trueEffect of effect.effects) {
                    POST_WORK_EFFECTS[trueEffect.type]?.(data, { state, report, ids: { departmentIndex: i, subjectId } }, effect);
                }
            }
        }
    }
}
