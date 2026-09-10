"use client";

import TooltipTemplate from "./TooltipTemplate";
import { useData } from "../DataProvider";
import Icon from "../icons/Icon";
import SkillIcon from "../icons/SkillIcon";
import NamePill from "../objects/NamePill";

import { calculateSkillRange } from "@/app/clash-arena/util";

export const CLASH_ARENA_SKILL_TOOLTIP_ID = "clash-arena-skill-tooltip";

function ClashArenaSkillTooltipContent({ identityId, skill, round }) {
    const [clashingData, clashingDataLoading] = useData("clashing_data");

    if (clashingDataLoading) return null;

    const skillData = clashingData[identityId][skill];
    const statusData = clashingData[identityId].statuses ?? [];
    if (round) {
        const data = calculateSkillRange(skillData, round, statusData, true, true);

        return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", gap: "0.2rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <SkillIcon skillData={skillData} />
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <div style={{ marginRight: "2.5rem" }}>
                        <NamePill name={skillData.name} affinity={skillData.affinity} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", fontSize: "1.25rem", fontWeight: "bold" }}>
                        {skillData.base} {skillData.coin > 0 ? "+" : ""}{skillData.coin}
                        &nbsp;
                        {Array.from({ length: skillData.coins }, (v, i) =>
                            <Icon style={{ width: "24px", height: "24px", transform: "translateY(2px)" }} key={i} path={"coin"} />
                        )}
                        ({skillData.levelCorrection < 0 ? skillData.levelCorrection : `+${skillData.levelCorrection}`}
                        <Icon path={"offense level"} style={{ width: "24px" }} />
                        )
                    </div>
                </div>
            </div>
            {data.modifiers.length === 0 ?
                "No Conditionals" :
                data.modifiers.map((modifier, i) =>
                    <span key={i} style={{ filter: modifier[1] ? "brightness(1)" : "brightness(0.5)" }}>
                        {modifier[2]}
                    </span>
                )}
        </div>
    } else {
        const emptySide = { statuses: [], hp: 100, sp: 0, speed: 1 };
        const data = calculateSkillRange(skillData, { self: emptySide, target: emptySide, unique_statuses: 0 }, statusData, true, false);

        return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", gap: "0.2rem" }}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <SkillIcon skillData={skillData} />
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <div style={{ marginRight: "2.5rem" }}>
                        <NamePill name={skillData.name} affinity={skillData.affinity} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", fontSize: "1.25rem", fontWeight: "bold" }}>
                        {skillData.base} {skillData.coin > 0 ? "+" : ""}{skillData.coin}
                        &nbsp;
                        {Array.from({ length: skillData.coins }, (v, i) =>
                            <Icon style={{ width: "24px", height: "24px", transform: "translateY(2px)" }} key={i} path={"coin"} />
                        )}
                        ({skillData.levelCorrection < 0 ? skillData.levelCorrection : `+${skillData.levelCorrection}`}
                        <Icon path={"offense level"} style={{ width: "24px" }} />
                        )
                    </div>
                </div>
            </div>
            {data.modifiers.length === 0 ?
                "No Conditionals" :
                data.modifiers.map((modifier, i) => <span key={i}>{modifier[2]}</span>)
            }
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