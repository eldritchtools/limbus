import { useDataMultiple } from "../DataProvider";

function getPath(type, id) {
    if (type === "identity") return `identities/${id}`;
    else if (type === "ego") return `egos/${id}`;
    else return "";
}

function compileSkillData(data, uptie) {
    const result = data.reduce((acc, dataTier) => dataTier.uptie <= uptie ? { ...acc, ...dataTier } : acc, {});
    if(Object.keys(result).length === 0) return null;
    return result;
}

function compileCombatPassives(skillData, uptie) {
    const passives = skillData.combatPassives.findLast(p => p.uptie <= uptie) ?? [];
    return passives.map(p => {
        const passive = skillData.passiveData[p];
        if (passive.condition) return passive;
        Object.values(skillData.passiveData).forEach(p => {
            if ("conditon" in p && p.name === passive.name)
                passive["condition"] = p.condition;
        })
        return passive;
    })
}

function compileSupportPassives(skillData, uptie) {
    const passives = skillData.supportPassives.findLast(p => p.uptie <= uptie) ?? [];
    return passives.map(p => skillData.passiveData[p]);
}

function compileEgoPassives(skillData, threadspin) {
    if (threadspin < 2) return [];
    return skillData.passiveList;
}

export function useSkillData(type, ids, tiers) {
    const list = useMemo(() => Array.isArray(ids) ? ids : [ids], [ids]);
    const [skillData, skillDataLoading] = useDataMultiple(list.map(id => getPath(type, id)));

    const result = useMemo(() => {
        const tierMapping = ids.reduce((acc, id, i) => { acc[id] = tiers[i]; return acc; }, {});

        list.reduce((acc, id) => {
            const tier = tierMapping[id];
            if (type === "identity") {
                if (skillDataLoading) return acc[id] = { skills: [], combatPassives: [], supportPassives: [] };
                else acc[id] = {
                    skills: Object.fromEntries(Object.entries(skillData[id].skills)
                        .map(([id, x]) => ([id, { ...x, data: compileSkillData(x.data, tier) }]))
                        .filter(([, x]) => x.data)
                    ),
                    combatPassives: compileCombatPassives(skillData[id], tier),
                    supportPassives: compileSupportPassives(skillData[id], tier)
                };
            } else if (type === "ego") {
                if (skillDataLoading) return acc[id] = { awakeningSkills: [], corrosionSkills: [], passives: [] };
                else acc[id] = {
                    awakeningSkills: skillData[id].awakeningSkills.map(x => ({...x, data: compileSkillData(x.data, tier)})),
                    corrosionSkills: skillData[id].corrosionSkills?.map(x => ({...x, data: compileSkillData(x.data, tier)})) ?? [],
                    passives: compileEgoPassives(skillData[id], tier)
                }
            }
            return acc;
        }, {});
    }, [skillData, skillDataLoading, ids, tiers, list, type]);

    if (!Array.isArray(ids)) return Object.values(result)[0];
    return result;
}
