"use client";

import { isTouchDevice } from "@eldritchtools/shared-components";

import TooltipTemplate from "./TooltipTemplate";
import { useSkillData } from "../dataHooks/skills";
import SkillCard from "../skill/SkillCard";

const TOOLTIP_ID = "skill-tooltip";

function SkillTooltipContent({ ids }) {
    const [ownerId, skillId] = ids.split("|");
    const type = ownerId[0] === "1" ? "identity" : "ego";
    const skillData = useSkillData(type, ownerId, 5);

    const id = ownerId + skillId;

    const skill = skillData ?
        (
            type === "identity" ? 
                skillData.skills[id] :
                ([...skillData.awakeningSkills, ...(skillData.corrosionSkills ?? [])]).find(x => x.data.id === id)
        ) :
        null;

    if (!skill) return <div style={{ padding: "0.5rem" }}>Cannot find skill</div>;

    return <div>
        <SkillCard skill={skill.data} noBorder={true} />
    </div>
}

export default function SkillTooltip() {
    return <TooltipTemplate id={TOOLTIP_ID}
        contentFunc={content => <SkillTooltipContent ids={content} />}
        clickable={isTouchDevice()}
    />
}

export function getSkillTooltipProps(ownerId, skillId) {
    return {
        "data-tooltip-id": TOOLTIP_ID,
        "data-tooltip-content": `${ownerId}|${skillId}`,
    }
}