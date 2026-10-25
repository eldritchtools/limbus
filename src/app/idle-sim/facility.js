import { DEPARTMENT_BASE_COST, DEPARTMENT_COST_GROWTH, MAX_CYCLE_LENGTH, MAX_DEPARTMENT_AGENTS, MAX_DEPARTMENT_SUBJECTS } from "./constants";

function removeAgentFromDepartment(department, agentId) {
    department.agent_ids = department.agent_ids.filter(id => id !== agentId);
    delete department.schedule[agentId];
}

function removeSubjectFromDepartment(department, subjectId) {
    department.subject_ids = department.subject_ids.filter(id => id !== subjectId);

    for (const slots of Object.values(department.schedule)) {
        for (let i = 0; i < slots.length; i++) {
            if (slots[i] === subjectId) slots[i] = null;
        }
    }
}

export function assignAgent(state, agentId, departmentIndex) {
    const department = state.departments[departmentIndex];
    if (!department || !state.agents.some(agent => agent.id === agentId)) return null;
    if (department.agent_ids.includes(agentId)) return null;
    if (department.agent_ids.length >= MAX_DEPARTMENT_AGENTS) return null;

    const nextState = structuredClone(state);
    for (const other of nextState.departments) removeAgentFromDepartment(other, agentId);

    const target = state.departments[departmentIndex];
    target.agent_ids.push(agentId);
    target.schedule[agentId] = Array(target.cycle_length).fill(null);
    return nextState;
}

export function unassignAgent(state, agentId) {
    if (!state.departments.some(department => department.agent_ids.includes(agentId))) return null;

    const nextState = structuredClone(state);
    for (const department of nextState.departments) removeAgentFromDepartment(department, agentId);
    return nextState;
}

export function assignSubject(data, state, subjectId, departmentIndex) {
    const department = state.departments[departmentIndex];
    if (!department || !data.subjects[subjectId] || !state.subjects[subjectId]) return null;
    if (department.subject_ids.includes(subjectId)) return null;
    if (department.subject_ids.length >= MAX_DEPARTMENT_SUBJECTS) return null;

    const nextState = structuredClone(state);
    for (const other of nextState.departments) removeSubjectFromDepartment(other, subjectId);

    state.departments[departmentIndex].subject_ids.push(subjectId);
    return nextState;
}

export function unassignSubject(state, subjectId) {
    if (!state.departments.some(department => department.subject_ids.includes(subjectId))) return null;

    const nextState = structuredClone(state);
    for (const department of nextState.departments) removeSubjectFromDepartment(department, subjectId);
    return nextState;
}

export function setScheduleBlock(data, state, departmentIndex, agentId, block, subjectId) {
    const department = state.departments[departmentIndex];
    if (!department || !department.agent_ids.includes(agentId)) return null;
    if (!Number.isInteger(block) || block < 0 || block >= department.cycle_length) return null;

    if (subjectId !== null) {
        const subject = data.subjects[subjectId];
        if (!subject || !department.subject_ids.includes(subjectId)) return null;

        const others = department.agent_ids.filter(id => id !== agentId && department.schedule[id][block] === subjectId).length;
        if (others >= subject.max_agents) return null;
    }

    const nextState = structuredClone(state);
    state.departments[departmentIndex].schedule[agentId][block] = subjectId;
    return nextState;
}

export function setCycleLength(state, departmentIndex, cycleLength) {
    const department = state.departments[departmentIndex];
    if (!department || cycleLength === department.cycle_length) return null;
    if (!Number.isInteger(cycleLength) || cycleLength < 1 || cycleLength > MAX_CYCLE_LENGTH) return null;

    const nextState = structuredClone(state);
    const target = state.departments[departmentIndex];

    for (const agentId of target.agent_ids) {
        const slots = target.schedule[agentId];
        target.schedule[agentId] = Array.from({ length: cycleLength }, (_, i) => slots[i] ?? null);
    }

    target.cycle_length = cycleLength;
    target.cycle_block %= cycleLength;
    return nextState;
}

export function getBuildDepartmentCost(state) {
    return Math.round(DEPARTMENT_BASE_COST * DEPARTMENT_COST_GROWTH ** state.departments.length);
}

export function buildNewDepartment(state) {
    const cost = getBuildDepartmentCost(state);
    if (state.currency < cost) return null;

    const nextState = structuredClone(state);
    nextState.currency -= cost;
    nextState.departments.push({
        label: `Department ${nextState.departments.length + 1}`,
        cycle_length: 8,
        cycle_block: 0,
        agent_ids: [],
        subject_ids: [],
        schedule: {},
    });
    return nextState;
}