import { useData } from "../DataProvider";

function getPath(type, id) {
    if (type === "identity") return `identities/${id}`;
    else if (type === "ego") return `egos/${id}`;
    else return "";
}

function compileSkillData(skill, uptie) {
    return skill.data.reduce((acc, dataTier) => dataTier.uptie <= uptie ? { ...acc, ...dataTier } : acc, {});
}

export function useSkillData(type, id, tier) {
    const [skillData, skillDataLoading] = useData(getPath(type, id));

    if (type === "identity") {
        if (skillDataLoading) return { skills: [] };
        return { skills: skillData.skills.map(x => compileSkillData(x, tier)) }
    } else if (type === "ego") {
        if (skillDataLoading) return { awakeningSkills: [], corrosionSkills: [] };
        return {
            awakeningSkills: skillData.awakeningSkills.map(x => compileSkillData(x, tier)),
            corrosionSkills: skillData.corrosionSkills.map(x => compileSkillData(x, tier)) ?? []
        }
    }

    return {};
}