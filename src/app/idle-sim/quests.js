import { buildNewDepartment } from "./facility";
import { toCurrencyStr } from "./util";

const QUEST_CONDITIONS = {
    none: () => true,
    agent_count: (state, c) => Object.keys(state.agents).length >= c.min,
    agent_level: (state, c) => Object.values(state.agents).some(a => a.level >= c.min),
    work_scheduled: (state) =>
        state.departments.some(d => Object.values(d.schedule).some(slots => slots.some(s => s !== null))),
    research_started: (state) =>
        Object.values(state.subjects).some(s => s.research_xp > 0 || s.research_level > 0),
    research_level: (state, c) => Object.values(state.subjects).some(s => s.research_level >= c.min),
    expedition_count: (state, c) =>
        state.expeditions.length + state.finished_expeditions.length + state.pending_events.length + state.cleared_expeditions.length >= c.min,
    expedition_cleared_count: (state, c) => state.cleared_expeditions.length >= c.min,
    equipped_weapon_count: (state, c) =>
        Object.values(state.agents).filter(a => a.weapon).length >= c.min,
    expedition_cleared: (state, c) => state.cleared_expeditions.includes(c.id)
};

export function isQuestClaimed(state, questId) {
    return state.claimed_quests.includes(questId);
}

export function isQuestAvailable(data, state, questId) {
    return !isQuestClaimed(state, questId) && data.quests[questId].requires.every((id) => isQuestClaimed(state, id));
}

export function isQuestComplete(data, state, questId) {
    const condition = data.quests[questId].condition;
    const check = QUEST_CONDITIONS[condition.type];

    if (!check) {
        console.warn(`Unknown quest condition type: ${condition.type}`);
        return false;
    }

    return check(state, condition);
}

export function claimQuest(data, state, questId) {
    const quest = data.quests[questId];
    if (!quest || !isQuestAvailable(data, state, questId) || !isQuestComplete(data, state, questId)) return null;

    const nextState = structuredClone(state);
    nextState.claimed_quests.push(questId);

    if ("currency" in quest.reward)
        nextState.currency += quest.reward.currency ?? 0;

    if ("weapon" in quest.reward)
        nextState.inventory.weapons[quest.reward.weapon] = (nextState.inventory.weapons[quest.reward.weapon] ?? 0) + 1

    if ("department" in quest.reward)
        while (nextState.departments.length < quest.reward.department)
            buildNewDepartment(nextState);

    return nextState;
}

export function questRewardText(data, reward) {
    const list = [];
    if (reward.currency) list.push(toCurrencyStr(reward.currency));
    if (reward.weapon) list.push(data.weapons[reward.weapon].name);
    if (reward.department) list.push(`Department ${reward.department}`);
    return list
}
