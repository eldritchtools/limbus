export function assignAgentPoint(state, agentId, offenseIndex) {
    const agent = state.agents.find(agent => agent.id === agentId);
    if (!agent || !Number.isInteger(offenseIndex) || offenseIndex < 0 || offenseIndex >= agent.offense.length) return null;

    const nextState = structuredClone(state);
    const target = nextState.agents.find(agent => agent.id === agentId);
    target.unspent_points -= 1;
    target.offense[offenseIndex] += 1;

    return nextState;
}

