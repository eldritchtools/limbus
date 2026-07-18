export function constructSkillLabel(type, tier, index) {
    switch (type) {
        case "attack":
            if (index === 0) return `Skill ${tier}`;
            else return `Skill ${tier}-${index + 1}`;
        case "defense":
            return "Defense";
        case "combat":
            return "Combat";
        case "support":
            return "Support";
        case "awakening":
            return "Awakening";
        case "corrosion":
            return "Corrosion";
        case "passive":
            return "Passive";
        default:
            return type;
    }
}

export function constructOffDefLevel(skill, level) {
    if (level) return `${level + skill.levelCorrection} (${skill.levelCorrection < 0 ? skill.levelCorrection : `+${skill.levelCorrection}`})`
    else return skill.levelCorrection < 0 ? skill.levelCorrection : `+${skill.levelCorrection}`
}

function compileSkill(data, uptie, passiveBonuses = [], critSkill, passiveBonusNotes) {
    const result = data.reduce((acc, dataTier) => dataTier.uptie <= uptie ? { ...acc, ...dataTier } : acc, {});
    if (Object.keys(result).length === 0) return null;
    if (passiveBonuses.length > 0) result.passiveBonuses = passiveBonuses;
    if (passiveBonusNotes) result.passiveBonusNotes = passiveBonusNotes;
    if (critSkill) result.critSkill = critSkill;
    return result;
}

function compileCombatPassives(skillData, uptie) {
    const passives = skillData.combatPassives.findLast(p => p.uptie <= uptie)?.passives ?? [];
    return passives.map(p => {
        const passive = { ...skillData.passiveData[p] };
        if (passive.condition) return passive;
        Object.values(skillData.passiveData).forEach(p2 => {
            if ("condition" in p2 && p2.name === passive.name)
                passive["condition"] = p2.condition;
        })
        return passive;
    })
}

function compileSupportPassives(skillData, uptie) {
    const passives = skillData.supportPassives.findLast(p => p.uptie <= uptie)?.passives ?? [];
    return passives.map(p => skillData.passiveData[p]);
}

function compileEgoPassives(skillData, threadspin) {
    if (threadspin < 2) return [];
    if (threadspin < 5 || skillData.passiveList.length < 2) return [skillData.passiveList[0]];
    return [skillData.passiveList[1]];
}

export function compileSkillData(type, ownerData, skillData, tier = 5) {
    if (type === "identity") {
        const critId = ownerData?.skillKeywordList?.includes("Poise");
        return {
            skills: Object.fromEntries(Object.entries(skillData.skills)
                .map(([skillId, x]) => {
                    const passiveBonuses = (skillData.passiveBonuses ?? [])
                        .filter(y => {
                            if (y?.extra?.skillId) return Number(skillId) === y.extra.skillId;
                            return true;
                        });
                    const critSkill = critId || x.critSkill;
                    const data = compileSkill(x.data, tier, passiveBonuses, critSkill, skillData.passiveBonusNotes ?? null);
                    return [skillId, {
                        ...x,
                        data: data ? { ...data, type: "identity", rank: x.tier } : null
                    }];
                })
                .filter(([, x]) => x.data)
            ),
            combatPassives: compileCombatPassives(skillData, tier),
            supportPassives: compileSupportPassives(skillData, tier),
            notes: skillData?.notes ?? {}
        };
    } else if (type === "ego") {
        return {
            awakeningSkills: skillData.awakeningSkills.map(
                x => ({ ...x, data: { ...compileSkill(x.data, tier), type: "ego-a", egoId: ownerData.id } })
            ),
            corrosionSkills: skillData.corrosionSkills?.map(
                x => ({ ...x, data: { ...compileSkill(x.data, tier), type: "ego-c", egoId: ownerData.id } })
            ) ?? [],
            passives: compileEgoPassives(skillData, tier),
            notes: skillData?.notes ?? {}
        }
    }
}

export function getSkillName(type, skillData, id, tier = 5) {
    const extractName = data => {
        return data.reduce((acc, dataTier) => dataTier.uptie <= tier && dataTier.name ? dataTier.name : acc, "");
    }

    if (type === "identity") {
        const skill = Object.entries(skillData.skills).find(([skillId]) => id === skillId)[1];
        return extractName(skill.data);
    } else if (type === "ego") {
        let skill = skillData.awakeningSkills.find(x => x.id === id);
        if (skill) {
            return extractName(skill.data)
        } else {
            skill = skillData.corrosionSkills.find(x => x.id === id);
            return extractName(skill.data)
        }
    }
}
