import { DEPARTMENT_BASE_COST, DEPARTMENT_COST_GROWTH, MAX_CYCLE_LENGTH, MAX_DEPARTMENT_AGENTS, MAX_DEPARTMENT_SUBJECTS, MAX_DEPARTMENTS } from "./constants";
import { isAgentOnExpedition } from "./util";

export function findAgentDepartment(state, agentId) {
    for (const department of state.departments) {
        if (department.agent_ids.includes(agentId)) return department;
    }
    return null;
}

function removeAgentFromDepartment(department, agentId) {
    department.agent_ids = department.agent_ids.map(id => id === agentId ? null : id);
    delete department.schedule[agentId];
}

function removeSubjectFromDepartment(department, subjectId) {
    department.subject_ids = department.subject_ids.map(id => id === subjectId ? null : id);

    for (const slots of Object.values(department.schedule)) {
        for (let i = 0; i < slots.length; i++) {
            if (slots[i] === subjectId) slots[i] = null;
        }
    }
}

export function assignAgent(state, agentId, departmentIndex, agentIndex) {
    const department = state.departments[departmentIndex];
    if (!department || !state.agents[agentId]) return null;
    if (department.agent_ids.includes(agentId) || isAgentOnExpedition(state, agentId)) return null;
    if (!Number.isInteger(agentIndex) || agentIndex < 0 || agentIndex >= department.agent_ids.length) return null;

    const nextState = structuredClone(state);
    for (const other of nextState.departments) removeAgentFromDepartment(other, agentId);

    const target = nextState.departments[departmentIndex];
    const occupant = target.agent_ids[agentIndex];
    if (occupant !== null) removeAgentFromDepartment(target, occupant);

    target.agent_ids[agentIndex] = agentId;
    target.schedule[agentId] = Array(target.cycle_length).fill(null);
    return nextState;
}

export function unassignAgent(state, agentId) {
    if (!state.departments.some(department => department.agent_ids.includes(agentId))) return null;

    const nextState = structuredClone(state);
    for (const department of nextState.departments) removeAgentFromDepartment(department, agentId);
    return nextState;
}

export function assignSubject(data, state, subjectId, departmentIndex, subjectIndex) {
    const department = state.departments[departmentIndex];
    if (!department || !data.subjects[subjectId] || !state.subjects[subjectId]) return null;
    if (department.subject_ids.includes(subjectId)) return null;
    if (!Number.isInteger(subjectIndex) || subjectIndex < 0 || subjectIndex >= department.subject_ids.length) return null;

    const nextState = structuredClone(state);
    for (const other of nextState.departments) removeSubjectFromDepartment(other, subjectId);

    const target = nextState.departments[departmentIndex];
    const occupant = target.subject_ids[subjectIndex];
    if (occupant !== null) removeSubjectFromDepartment(target, occupant);

    target.subject_ids[subjectIndex] = subjectId;
    return nextState;
}

export function unassignSubject(state, subjectId) {
    if (!state.departments.some(department => department.subject_ids.includes(subjectId))) return null;

    const nextState = structuredClone(state);
    for (const department of nextState.departments) removeSubjectFromDepartment(department, subjectId);
    return nextState;
}

export function renameDepartment(state, departmentIndex, label) {
    const nextState = structuredClone(state);
    const target = nextState.departments[departmentIndex];
    target.label = label;
    return nextState;
}

export function setScheduleBlock(data, state, departmentIndex, agentId, block, subjectId) {
    const department = state.departments[departmentIndex];
    if (!department || !department.agent_ids.includes(agentId)) return null;
    if (!Number.isInteger(block) || block < 0 || block >= department.cycle_length) return null;

    if (subjectId !== null) {
        const subject = data.subjects[subjectId];
        if (!subject || !department.subject_ids.includes(subjectId)) return null;

        const others = department.agent_ids.filter(id => id !== null && id !== agentId && department.schedule[id][block] === subjectId).length;
        if (others >= subject.max_agents) return null;
    }

    const nextState = structuredClone(state);
    nextState.departments[departmentIndex].schedule[agentId][block] = subjectId;
    return nextState;
}

export function setCycleLength(state, departmentIndex, cycleLength) {
    const department = state.departments[departmentIndex];
    if (!department || cycleLength === department.cycle_length) return null;
    if (!Number.isInteger(cycleLength) || cycleLength < 1 || cycleLength > MAX_CYCLE_LENGTH) return null;

    const nextState = structuredClone(state);
    const target = nextState.departments[departmentIndex];

    for (const agentId of target.agent_ids) {
        if (agentId === null) continue;
        const slots = target.schedule[agentId];
        target.schedule[agentId] = Array.from({ length: cycleLength }, (_, i) => slots[i] ?? null);
    }

    target.cycle_length = cycleLength;
    target.cycle_block %= cycleLength;
    return nextState;
}

export function buildNewDepartment(state) {
    state.departments.push({
        label: `Department ${state.departments.length + 1}`,
        cycle_length: 8,
        cycle_block: 0,
        agent_ids: Array.from({ length: MAX_DEPARTMENT_AGENTS }, () => null),
        subject_ids: Array.from({ length: MAX_DEPARTMENT_SUBJECTS }, () => null),
        schedule: {},
    });
    return state;
}