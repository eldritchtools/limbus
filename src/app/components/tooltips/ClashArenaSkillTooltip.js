"use client";

import TooltipTemplate from "./TooltipTemplate";
import { useData } from "../DataProvider";

import { calculateSkillRange } from "@/app/clash-arena/util";

export const CLASH_ARENA_SKILL_TOOLTIP_ID = "clash-arena-skill-tooltip";

function ClashArenaSkillTooltipContent({ identityId, skill, round }) {
    const [clashingData, clashingDataLoading] = useData("clashing_data");

    if (clashingDataLoading) return null;

    const skillData = clashingData[identityId][skill];
    if (round) {
        const data = calculateSkillRange(skillData, round.self, round.target, true, true);
        if(data.modifiers.length === 0)
            return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", gap: "0.2rem" }}>
                No Conditionals
            </div>

        return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", gap: "0.2rem" }}>
            {data.modifiers.map((modifier, i) =>
                <span key={i} style={{ filter: modifier[1] ? "brightness(1)" : "brightness(0.5)" }}>
                    {modifier[2]}
                </span>
            )}
        </div>
    } else {
        const emptySide = { statuses: [], hp: 100, sp: 0, speed: 1 };
        const data = calculateSkillRange(skillData, emptySide, emptySide, true, false);
        if(data.modifiers.length === 0)
            return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", gap: "0.2rem" }}>
                No Conditionals
            </div>
            
        return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", gap: "0.2rem" }}>
            {data.modifiers.map((modifier, i) => <span key={i}>{modifier[2]}</span>)}
        </div>
    }
}

export default function ClashArenaSkillTooltip() {
    return <TooltipTemplate
        id={CLASH_ARENA_SKILL_TOOLTIP_ID}
        contentFunc={content => {
            if (!content) return;
            const data = JSON.parse(content);
            return <ClashArenaSkillTooltipContent identityId={data.identityId} skill={data.skill} round={data.round} />
        }}
    />
}

export function getClashArenaSkillTooltipProps(identityId, skill, round) {
    const content = JSON.stringify({ identityId, skill, round });
    return {
        "data-tooltip-id": CLASH_ARENA_SKILL_TOOLTIP_ID,
        "data-tooltip-content": content
    }
}