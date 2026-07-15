import { useMemo } from "react";

import { AtkWeight, DiffedAtkWeight } from "./AtkWeight";
import Coin from "./Coin";
import { computeSkillValues } from "./SkillCalc";
import styles from "./SkillCard.module.css";
import Icon from "../icons/Icon";
import KeywordIcon from "../icons/KeywordIcon";
import SkillIcon from "../icons/SkillIcon";
import NamePill from "../objects/NamePill";
import DiffedText from "../texts/DiffedText";
import ProcessedText from "../texts/ProcessedText";
import { getGeneralTooltipProps } from "../tooltips/TooltipProps";

import { affinityColorMapping } from "@/app/lib/colors";
import { constructOffDefLevel } from "@/app/lib/skill";

export default function SkillCard({ skill, label = "", count = 0, level, mini = false, pre, includeSkillValues = true, noBorder = false, serverText }) {
    const skillValues = useMemo(() => {
        if (!skill || !includeSkillValues) return null;
        return computeSkillValues(skill);
    }, [skill, includeSkillValues]);

    if (!skill) return null;

    let iconClass = mini ? styles.iconMini : styles.icon;
    let coinClass = mini ? styles.coinMini : styles.coin;
    let skillIconWrapperClass = mini ? styles.skillIconWrapperMini : styles.skillIconWrapper;
    let iconStyleOverride = mini ? { width: "24px", height: "24px" } : {};
    let nameStyleOverride = mini ? { fontSize: "0.8rem" } : {};

    let diff = pre && Object.keys(pre).length > 0;
    let diffNew = pre && Object.keys(pre).length === 0;

    return <div className={`${styles.skillCard} ${diffNew ? styles.new : null} ${mini ? styles.mini : null}`}
        style={{ border: noBorder ? "" : `1px ${affinityColorMapping[skill.affinity]} solid` }}
    >
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "0.25rem" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
                <div className={skillIconWrapperClass}>
                    <SkillIcon skillData={skill} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <span className={mini ? styles.labelContainerMini : styles.labelContainer}>
                        {skill.defType !== "attack" ? <KeywordIcon className={iconClass} id={skill.defType} /> : null}
                        {skill.defType === "attack" || skill.defType === "counter" ? <KeywordIcon className={iconClass} id={skill.atkType} /> : null}
                        {diff ? <DiffedText
                            before={`${pre.baseValue} ${pre.coinValue < 0 ? pre.coinValue : `+${pre.coinValue}`}`}
                            after={`${skill.baseValue} ${skill.coinValue < 0 ? skill.coinValue : `+${skill.coinValue}`}`}
                        /> :
                            `${skill.baseValue} ${skill.coinValue < 0 ? skill.coinValue : `+${skill.coinValue}`}`
                        }
                        <span style={{ display: "flex", flexWrap: "wrap", gap: "0" }}>
                            {
                                skill.coins.map((coin, i) =>
                                    <Icon className={coinClass} key={i} path={coin["type"] === "unbreakable" ? "unbreakable coin" : "coin"} />
                                )
                            }
                        </span>
                    </span>

                    <div style={{ display: "flex", flexDirection: "row", gap: mini ? "0.1rem" : "0.25rem", alignItems: "center" }}>
                        <NamePill name={skill.name} affinity={skill.affinity} />
                        {count > 0 ?
                            <div style={{ color: "var(--secondary-text-color)", fontWeight: "bold", fontSize: mini ? "1rem" : "1.25rem", zIndex: 1 }}>
                                x{count}
                            </div> :
                            null
                        }
                    </div>
                </div>
            </div>
            <div style={{ flex: "0 0 auto", color: "var(--secondary-text-color)", fontWeight: "bold", fontSize: mini ? "1rem" : "1.25rem", marginLeft: "0.5rem" }}>
                {label}
            </div>
        </div>
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "0.1rem", marginBottom: "0.25rem", alignItems: "center" }}>
            <span className={styles.pill} >
                {skill.defType === "attack" || skill.defType === "counter" ?
                    <Icon className={iconClass} path={"offense level"} /> :
                    <Icon className={iconClass} path={"defense level"} />
                }
                {constructOffDefLevel(skill, level)}
            </span>
            {includeSkillValues ? <>
                <span className={styles.pill} {...getGeneralTooltipProps("Assumes all conditionals against a target with defense level equal to the offense level of the skill. Some passives and other effects may not be included.\nUse the calculator in Display Type in a Team Build for a more detailed calculation.")}>
                    Clash: {skillValues.min[0]}-{skillValues.max[0]}
                </span>
                <span className={styles.pill} {...getGeneralTooltipProps("Assumes all conditionals against a target with defense level equal to the offense level of the skill. Some passives and other effects may not be included.\nUse the calculator in Display Type in a Team Build for a more detailed calculation.")}>
                    Damage: {skillValues.min[1]}-{skillValues.max[1]}
                </span>
            </> : null
            }
            {skill.spCost ?
                <span className={styles.pill}>
                    SP Cost: {skill.spCost}
                </span> :
                null
            }
            <span className={styles.pill}>
                Atk Weight:
                {diff > 0 ?
                    <DiffedAtkWeight preSkillData={pre} postSkillData={skill} /> :
                    <AtkWeight skillData={skill} />
                }
            </span>
        </div>
        <div className={styles.descContainer}>
            {skill.desc ?
                (diff > 0 ?
                    <DiffedText
                        before={pre.desc?.split("\n") ?? []}
                        after={skill.desc.split("\n")}
                        iconStyleOverride={iconStyleOverride}
                        nameStyleOverride={nameStyleOverride}
                        serverText={serverText}
                    /> :
                    <ProcessedText
                        text={skill.desc}
                        iconStyleOverride={iconStyleOverride}
                        nameStyleOverride={nameStyleOverride}
                        serverText={serverText}
                    />
                ) :
                null
            }
        </div>
        <div className={styles.coinsContainer}>
            {skill.coins.map((coin, index) => "descs" in coin && coin["descs"].length > 0 ?
                <div key={index} className={styles.coinContainer}>
                    <Coin num={index + 1} mini={mini} />
                    <div className={styles.coinDescContainer}>
                        {diff > 0 ?
                            <DiffedText
                                before={pre.coins[index]["descs"] ?? []}
                                after={coin["descs"]}
                                iconStyleOverride={iconStyleOverride}
                                nameStyleOverride={nameStyleOverride}
                                serverText={serverText}
                            /> :
                            coin["descs"].map((desc, innerIndex) =>
                                <ProcessedText key={`${innerIndex}-text`}
                                    text={desc}
                                    iconStyleOverride={iconStyleOverride}
                                    nameStyleOverride={nameStyleOverride}
                                    serverText={serverText}
                                />)
                        }
                    </div>
                </div> : null
            )}
        </div>
    </div>
}
