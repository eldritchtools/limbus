import { useMemo } from "react";

import { AtkWeight, DiffedAtkWeight } from "./AtkWeight";
import Coin from "./Coin";
import { computeSkillValues } from "./SkillCalc";
import Icon from "../icons/Icon";
import KeywordIcon from "../icons/KeywordIcon";
import DiffedText from "../texts/DiffedText";
import ProcessedText from "../texts/ProcessedText";
import { getGeneralTooltipProps } from "../tooltips/GeneralTooltip";

import { affinityColorMapping } from "@/app/lib/colors";
import { constructOffDefLevel } from "@/app/lib/skill";

export default function SkillCard({ skill, label = "", count = 0, level, mini = false, pre, includeSkillValues = true }) {
    const skillValues = useMemo(() => {
        if (!skill || !includeSkillValues) return null;
        return computeSkillValues(skill);
    }, [skill, includeSkillValues]);

    if (!skill) return null;

    let iconSize = mini ? 24 : 32;
    let coinSize = mini ? 18 : 24;
    let coinStyle = { width: `${coinSize}px`, height: `${coinSize}px` };
    let iconStyle = { width: `${iconSize}px`, height: `${iconSize}px` };
    let iconStyleOverride = mini ? { width: "24px", height: "24px" } : {};
    let nameStyleOverride = mini ? { fontSize: "0.8rem" } : {};
    let pillStyle = { display: "flex", height: iconSize, gap: "0.25rem", alignItems: "center", border: "1px #777 solid", borderRadius: "0.5rem", padding: "0 0.2rem" };

    let diff = pre && Object.keys(pre).length > 0;
    let diffNew = pre && Object.keys(pre).length === 0;

    return <div style={{
        width: "100%", height: "100%", display: "flex", flexDirection: "column",
        border: `1px ${affinityColorMapping[skill.affinity]} solid`, borderRadius: "0.5rem",
        padding: "0.5rem", boxSizing: "border-box", fontSize: mini ? "0.8rem" : "1rem",
        backgroundColor: diffNew ? "rgba(46, 160, 67, 0.35)" : null
    }}>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", marginBottom: "0.25rem" }}>
            <div style={{ display: "flex", flexDirection: "row", gap: mini ? "0.1rem" : "0.25rem", alignItems: "center" }}>
                {skill.affinity !== "none" ?
                    (pre?.affinity === "none" ?
                        <KeywordIcon id={skill.affinity} size={iconSize} style={{ backgroundColor: "rgba(46, 160, 67, 0.35)", padding: "0 2px", borderRadius: "3px" }} /> :
                        <KeywordIcon id={skill.affinity} size={iconSize} />) :
                    null}
                {skill.defType !== "attack" ? <KeywordIcon id={skill.defType} size={iconSize} /> : null}
                {skill.defType === "attack" || skill.defType === "counter" ? <KeywordIcon id={skill.atkType} size={iconSize} /> : null}
                <div style={{ borderRadius: "5px", backgroundColor: affinityColorMapping[skill.affinity], padding: "5px", color: "#ddd", textShadow: "black 1px 1px 5px", fontWeight: "bold" }}>
                    {skill.name}
                </div>
                {count > 0 ? <div style={{ color: "#aaa", fontWeight: "bold", fontSize: mini ? "1rem" : "1.25rem" }}>x{count}</div> : null}
            </div>
            <div style={{ flex: "0 0 auto", color: "#aaa", fontWeight: "bold", fontSize: mini ? "1rem" : "1.25rem", marginLeft: "0.5rem" }}>
                {label}
            </div>
        </div>
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "0.1rem", marginBottom: "0.25rem", alignItems: "center" }}>
            <span style={pillStyle}>
                <span>
                    Power: {diff ? <DiffedText
                        before={`${pre.baseValue} ${pre.coinValue < 0 ? pre.coinValue : `+${pre.coinValue}`}`}
                        after={`${skill.baseValue} ${skill.coinValue < 0 ? skill.coinValue : `+${skill.coinValue}`}`}
                    /> :
                        `${skill.baseValue} ${skill.coinValue < 0 ? skill.coinValue : `+${skill.coinValue}`}`
                    }
                </span>
                <span style={{ display: "flex", gap: "0" }}>
                    {skill.coins.map((coin, i) =>
                        <Icon key={i} path={coin["type"] === "unbreakable" ? "unbreakable coin" : "coin"} style={coinStyle} />
                    )}
                </span>
            </span>
            <span style={pillStyle}>
                {skill.defType === "attack" || skill.defType === "counter" ?
                    <Icon path={"offense level"} style={iconStyle} /> :
                    <Icon path={"defense level"} style={iconStyle} />
                }
                {constructOffDefLevel(skill, level)}
            </span>
            {includeSkillValues ? <>
                <span style={pillStyle} {...getGeneralTooltipProps("Assumes all conditionals. Use Display Type in a Team Build for a more detailed calculation.")}>
                    Clash: {skillValues.min[0]}-{skillValues.max[0]}
                </span>
                <span style={pillStyle} {...getGeneralTooltipProps("Assumes all conditionals. Use Display Type in a Team Build for a more detailed calculation.")}>
                    Damage: {skillValues.min[1]}-{skillValues.max[1]}
                </span>
            </> : null
            }
            {skill.spCost ?
                <span style={pillStyle}>
                    SP Cost: {skill.spCost}
                </span> :
                null
            }
            <span style={pillStyle}>
                Atk Weight:
                {diff > 0 ?
                    <DiffedAtkWeight preSkillData={pre} postSkillData={skill} /> :
                    <AtkWeight skillData={skill} />
                }
            </span>
        </div>
        <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.2", marginBottom: "0.25rem" }}>
            {skill.desc ?
                (diff > 0 ?
                    <DiffedText before={pre.desc.split("\n")} after={skill.desc.split("\n")} iconStyleOverride={iconStyleOverride} nameStyleOverride={nameStyleOverride} /> :
                    <ProcessedText text={skill.desc} iconStyleOverride={iconStyleOverride} nameStyleOverride={nameStyleOverride} />
                ) :
                null
            }
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {skill.coins.map((coin, index) => "descs" in coin && coin["descs"].length > 0 ?
                <div key={index} style={{ display: "flex", flexDirection: "row", gap: "0.5rem" }}>
                    <Coin num={index + 1} mini={mini} />
                    <div style={{ display: "flex", flex: 1, flexDirection: "column", whiteSpace: "pre-wrap", gap: "0.1rem" }}>
                        {diff > 0 ?
                            <DiffedText
                                before={pre.coins[index]["descs"] ?? []}
                                after={coin["descs"]}
                                iconStyleOverride={iconStyleOverride}
                                nameStyleOverride={nameStyleOverride}
                            /> :
                            coin["descs"].map((desc, innerIndex) =>
                                <ProcessedText key={`${innerIndex}-text`}
                                    text={desc}
                                    iconStyleOverride={iconStyleOverride}
                                    nameStyleOverride={nameStyleOverride}
                                />)
                        }
                    </div>
                </div> : null
            )}
        </div>
    </div>
}
