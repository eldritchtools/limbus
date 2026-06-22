/* eslint-disable @next/next/no-img-element */
"use client";

import { getEgoImgSrc } from "./EgoIcon";
import KeywordIcon from "./KeywordIcon";

import { ASSETS_ROOT } from "@/app/paths";

export function getSkillIconSrc(skillData) {
    if(skillData.type === "ego-a") return getEgoImgSrc({ id: skillData.egoId }, "awaken")
    if(skillData.type === "ego-c") return getEgoImgSrc({ id: skillData.egoId }, "erosion")
    return `${ASSETS_ROOT}/skills/${skillData.iconId}.png`
}

export default function SkillIcon({ skillData, scale = 1 }) {
    const affinity = skillData.affinity?.toLowerCase();
    const frame = affinity === "none" ? "def" : `${affinity}-${(skillData.type ?? "").includes("ego") ? 3 : Math.min((skillData.rank ?? 1), 3) }`;

    const baseSize = 112 * scale;
    const iconSize = 74 * scale;
    const iconNudge = 13.3 * scale;
    const iconMarginLeft = 5.3 * scale;
    const iconMarginTop = 12.8 * scale;

    if (!skillData.type)
        return <div style={{ position: "relative", width: `${baseSize}px`, left: "-4px" }}>
            <div style={{ position: "relative", top: 0, left: 0, width: `${baseSize}px`, zIndex: 3, pointerEvents: "none" }}>
                <img src={`${ASSETS_ROOT}/skill_frames/${frame}.webp`} alt={frame} style={{ width: "100%" }} loading="lazy" />
            </div>
            <div style={{
                position: "absolute", top: `${iconNudge}px`, left: `${iconNudge}px`, zIndex: 2,
                marginLeft: `${iconMarginLeft}px`, marginTop: `${iconMarginTop}px`, width: `${iconSize}px`, height: `${iconSize}px`,
                clipPath: "polygon(73% 2%, 98% 36%,90% 80%,50% 100%,10% 80%,2% 36%,27% 2%)"
            }}>
                <KeywordIcon id={affinity} size={iconSize} />
            </div>
        </div>

    return <div style={{ position: "relative", width: `${baseSize}px`, left: "-4px" }}>
        <div style={{ position: "relative", top: 0, left: 0, width: `${baseSize}px`, zIndex: 3, pointerEvents: "none" }}>
            <img src={`${ASSETS_ROOT}/skill_frames/${frame}.webp`} alt={frame} style={{ width: "100%" }} loading="lazy" />
        </div>
        <div style={{
            position: "absolute", top: `${iconNudge}px`, left: `${iconNudge}px`, zIndex: 2,
            marginLeft: `${iconMarginLeft}px`, marginTop: `${iconMarginTop}px`, width: `${iconSize}px`, height: `${iconSize}px`,
            clipPath: "polygon(73% 2%, 98% 36%,90% 80%,50% 100%,10% 80%,2% 36%,27% 2%)"
        }}>
            <img src={getSkillIconSrc(skillData)} alt={skillData.iconId} style={{ width: "100%" }} loading="lazy" />
        </div>
        <div style={{ position: "absolute", top: 0, left: 0, width: `${baseSize}px`, zIndex: 1 }}>
            <img src={`${ASSETS_ROOT}/skill_frames/${frame}-bg.webp`} alt={`${frame}-bg`} style={{ width: "100%" }} loading="lazy" />
        </div>
    </div>
}
