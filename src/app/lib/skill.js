export function constructSkillLabel(type, tier, index) {
    switch (type) {
        case "attack":
            if (index === 0) return `Skill ${tier}`;
            else return `Skill ${tier}-${index + 1}`;
        case "defense":
            return "Defense";
        case "awakening":
            return "Awakening";
        case "corrosion":
            return "Corrosion";
        default:
            return type;
    }
}

export function constructOffDefLevel(skill, level) {
    if (level) return `${level + skill.levelCorrection} (${skill.levelCorrection < 0 ? skill.levelCorrection : `+${skill.levelCorrection}`})`
    else return skill.levelCorrection < 0 ? skill.levelCorrection : `+${skill.levelCorrection}`
}