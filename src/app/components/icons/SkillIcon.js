/* eslint-disable @next/next/no-img-element */

import styles from "./Icon.module.css";
import { getEgoImgSrc } from "./imgSrc";
import KeywordIcon from "./KeywordIcon";

import { ASSETS_ROOT } from "@/app/paths";

export function getSkillIconSrc(skillData) {
    if (skillData.type === "ego-a") return getEgoImgSrc({ id: skillData.egoId }, "awaken")
    if (skillData.type === "ego-c") return getEgoImgSrc({ id: skillData.egoId }, "erosion")
    return `${ASSETS_ROOT}/skills/${skillData.iconId}.webp`
}

export default function SkillIcon({ skillData, scale = 1 }) {
    const affinity = skillData.affinity?.toLowerCase();
    const frame = affinity === "none" ? "def" : `${affinity}-${(skillData.type ?? "").includes("ego") ? 3 : Math.min((skillData.rank ?? 1), 3)}`;

    const container = (children, frameBg) =>
        <div className={styles.skillIconContainer}>
            <div className={styles.skillIconFrameContainer}>
                <img src={`${ASSETS_ROOT}/skill_frames/${frame}.webp`} alt={frame} style={{ width: "100%" }} loading="lazy" />
            </div>
            <div className={styles.skillIconIconContainer}>
                {children}
            </div>
            {
                frameBg &&
                <div className={styles.skillIconFrameBgContainer}>
                    <img src={`${ASSETS_ROOT}/skill_frames/${frame}-bg.webp`} alt={`${frame}-bg`} style={{ width: "100%" }} loading="lazy" />
                </div>
            }
        </div>

    const scaler = (children) => {
        if (scale === 1) return children;
        return <div style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
            {children}
        </div>
    }

    const icon =
        skillData.type ?
            container(
                <img src={getSkillIconSrc(skillData)} alt={skillData.iconId} style={{ width: "100%" }} loading="lazy" />,
                true
            ) :
            container(
                affinity !== "none" ?
                    <KeywordIcon id={affinity} size={74} /> :
                    <KeywordIcon id={skillData.defType} size={74} />
            )

    return scaler(icon);
}
