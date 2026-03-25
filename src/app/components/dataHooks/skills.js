"use client";

import { useDataMultiple } from "../DataProvider";

function getPath(type, id) {
    if (type === "identity") return `identities/${id}`;
    else if (type === "ego") return `egos/${id}`;
    else return "";
}

function compileSkillData(data, uptie) {
    const result = data.reduce((acc, dataTier) => dataTier.uptie <= uptie ? { ...acc, ...dataTier } : acc, {});
    if (Object.keys(result).length === 0) return null;
    return result;
}

function compileCombatPassives(skillData, uptie) {
    const passives = skillData.combatPassives.findLast(p => p.uptie <= uptie)?.passives ?? [];
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
    const passives = skillData.supportPassives.findLast(p => p.uptie <= uptie)?.passives ?? [];
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
        const tierMapping = list.reduce((acc, id, i) => { 
            if(Array.isArray(tiers)) acc[id] = tiers[i]; 
            else acc[id] = tiers;
            return acc; 
        }, {});

        return list.reduce((acc, id) => {
            const tier = tierMapping[id];
            if (type === "identity") {
                const path = getPath(type, id);
                if (skillDataLoading) acc[id] = { skills: [], combatPassives: [], supportPassives: [] };
                else acc[id] = {
                    skills: Object.fromEntries(Object.entries(skillData[path].skills)
                        .map(([id, x]) => ([id, { ...x, data: compileSkillData(x.data, tier) }]))
                        .filter(([, x]) => x.data)
                    ),
                    combatPassives: compileCombatPassives(skillData[path], tier),
                    supportPassives: compileSupportPassives(skillData[path], tier)
                };
            } else if (type === "ego") {
                const path = getPath(type, id);
                if (skillDataLoading) acc[id] = { awakeningSkills: [], corrosionSkills: [], passives: [] };
                else acc[id] = {
                    awakeningSkills: skillData[path].awakeningSkills.map(x => ({ ...x, data: compileSkillData(x.data, tier) })),
                    corrosionSkills: skillData[path].corrosionSkills?.map(x => ({ ...x, data: compileSkillData(x.data, tier) })) ?? [],
                    passives: compileEgoPassives(skillData[path], tier)
                }
            }
            return acc;
        }, {});
    }, [skillData, skillDataLoading, tiers, list, type]);

    if (!Array.isArray(ids)) return Object.values(result)[0];
    return result;
}
