export const defaultSettings = {
    teamSize: 3,
    rounds: 12,
    draftOrder: "cycle",
    numStatus: [1, 4],
    statusPotency: [1, 20],
    statusCount: [1, 20],
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
        case "statusPotenecy": return "status_potenecy";
        case "statusCount": return "status_count";
        default: return key;
    }
}

export function settingsToClient(key) {
    switch (key) {
        case "team_size": return "teamSize";
        case "draft_order": return "draftOrder";
        case "num_status": return "numStatus";
        case "status_potency": return "statusPotency";
        case "status_count": return "statusCount";
        default: return key;
    }
}