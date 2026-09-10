import { evaluateConditional, getExplanation } from "./conditionals";

export const defaultSettings = {
    teamSize: 3,
    rounds: 12,
    draftOrder: "cycle",
    pointsPerDraft: 6,
    numStatus: [1, 4],
    secondaryStatusChance: 25,
    hp: [1, 100],
    speed: [1, 10],
    sp: [0, 45]
};

export function phaseConvert(phase) {
    switch (phase) {
        case "draft_complete": return "draftComplete";
        case "round_select": return "roundSelect";
        case "round_reveal": return "roundReveal";
        default: return phase;
    }
}

export function settingsToServer(key) {
    switch (key) {
        case "teamSize": return "team_size";
        case "draftOrder": return "draft_order";
        case "numStatus": return "num_status";
        case "secondaryStatusChance": return "secondary_status_chance";
        case "pointsPerDraft": return "points_per_draft";
        default: return key;
    }
}

export function settingsToClient(key) {
    switch (key) {
        case "team_size": return "teamSize";
        case "draft_order": return "draftOrder";
        case "num_status": return "numStatus";
        case "secondary_status_chance": return "secondaryStatusChance";
        case "points_per_draft": return "pointsPerDraft";
        default: return key;
    }
}

export function calculateSkillRange(skill, round, statusData, withExplanation = false, withResult = true) {
    const uniqueStatuses = Object.fromEntries(statusData.map(({ id, values }) => [id, values[round?.unique_statuses_tier ?? 0]]));
    const modifiers = (skill.conditionals ?? []).map(x => evaluateConditional(x, round.self, round.target, uniqueStatuses));

    const base = skill.base + modifierSum(modifiers, "base");
    const coin = skill.coin + modifierSum(modifiers, "coin");
    const clash = modifierSum(modifiers, "clash");
    const levelCorrection = Math.trunc((skill.levelCorrection + modifierSum(modifiers, "offense-level")) / 3);

    const min = base + clash + levelCorrection;
    const max = min + coin * skill.coins;

    const result = { min: Math.max(Math.min(min, max), 0), max: Math.max(min, max), base: min, coin: coin };
    if (withExplanation) result.modifiers = modifiers.map((x, i) => [...x, getExplanation(x, skill.conditionals[i], withResult)])

    return result;
}

function modifierSum(modifiers, target) {
    return modifiers
        .filter(([modifierTarget]) => modifierTarget === target)
        .reduce((sum, [, value]) => sum + value, 0);
}
