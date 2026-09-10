export function resolveSkills(identity, skills, round) {
    return (identity.modifiers || []).reduce((skills, modifier) => {
        if (!modifierActive(modifier.condition, identity, round)) return skills;
        return applySkillEffect(modifier.effect, identity, skills);
    }, skills);
}

function modifierActive(condition, identity, round) {
    if (condition.type === "status") {
        if (condition.owner === "unique") {
            const status_data = identity.statuses.find(x => x.id === condition.status)
            return status_data.values[round.unique_statuses_tier] >= condition.value
        }

        const side = condition.owner === "self" ? round.self : round.target;
        const value = side.statuses[condition.status]?.[condition.statusType.toLowerCase()] ?? 0;
        return value >= condition.value;
    }

    if (condition.type === "status-missing") {
        if (condition.owner === "unique") {
            const status_data = identity.statuses.find(x => x.id === condition.status)
            return !status_data || status_data.values[round.unique_statuses_tier] === 0;
        }

        const side = condition.owner === "self" ? round.self : round.target;
        return !(condition.status in side.statuses);
    }

    if (condition.type === "sp") {
        return condition.mode === "higher" ? round.self.sp > condition.value : round.self.sp < condition.value;
    }

    if (condition.type === "negative-effects") {
        const count = ["Combustion", "Laceration", "Vibration", "Burst", "Sinking"]
            .filter(status => status in round.target.statuses)
            .length;

        return count >= condition.value;
    }

    return false;
}

function applySkillEffect(effect, identity, skills) {
    if (effect.type === "replace")
        return skills.map((skill, index) => index + 1 === effect.slot ? effect.key : skill);

    return skills;
}
