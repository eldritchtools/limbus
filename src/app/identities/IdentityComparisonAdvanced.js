import { useBreakpoint } from "@eldritchtools/shared-components"
import { useState } from "react"

import { useSkillData } from "../components/dataHooks/skills"
import { useData } from "../components/DataProvider"
import Icon from "../components/icons/Icon"
import IdentityIcon from "../components/icons/IdentityIcon"
import KeywordIcon from "../components/icons/KeywordIcon"
import SinnerIcon from "../components/icons/SinnerIcon"
import NoPrefetchLink from "../components/NoPrefetchLink"
import AutoScroller from "../components/objects/AutoScroller"
import DropdownButton from "../components/objects/DropdownButton"
import RangeInput from "../components/objects/RangeInput"
import { AtkWeight } from "../components/skill/AtkWeight"
import Coin from "../components/skill/Coin"
import PassiveCard, { PassiveCost } from "../components/skill/PassiveCard"
import SkillCard from "../components/skill/SkillCard"
import ProcessedText from "../components/texts/ProcessedText"
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip"
import { keywordToIdMapping } from "../database/keywordIds"
import { affinityColorMapping, ColoredResistance } from "../lib/colors"
import { LEVEL_CAP, sinnerIdMapping } from "../lib/constants"
import { constructDefenseLevel, constructHp, constructSpeed } from "../lib/identity"
import { paragraphScore } from "../lib/scoring"
import { constructSkillLabel } from "../lib/skill"
import { replaceStatusesInString } from "../lib/statusReplacement"

const options = {
    "stats": "Stats",
    "s1": "Skill 1",
    "s2": "Skill 2",
    "s3": "Skill 3",
    "def": "Defense",
    "skills": "All Skills",
    "passives1": "Combat Passives",
    "passives2": "Support Passives"
}

function ComparisonCardBase({ identity, content }) {
    return <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", width: "320px", maxHeight: "480px", border: "1px #777 solid", borderRadius: "0.25rem", boxSizing: "border-box", alignItems: "center", gap: "0.2rem" }}>
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", height: "128px" }}>
            <NoPrefetchLink href={`/identities/${identity.id}`}>
                <IdentityIcon identity={identity} uptie={4} displayName={true} displayRarity={true} size={128} />
            </NoPrefetchLink>
        </div>
        <div style={{ border: "1px #777 solid", width: "90%" }} />
        <div style={{ maxHeight: "320px", width: "100%" }}>
            {content}
        </div>
    </div >
}

function ComparisonRowBase({ identity, content }) {
    return <>
        {content.map((line, i) => <tr key={i} style={{ borderTop: "1px #777 solid", borderBottom: "1px #777 solid", verticalAlign: "middle" }}>
            {i === 0 ?
                <td key={0} rowSpan={content.length} style={{ borderTop: "1px #777 solid", borderBottom: "1px #777 solid", verticalAlign: "middle" }}>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "center", padding: "0.2rem" }}>
                        <NoPrefetchLink href={`/identities/${identity.id}`}>
                            <IdentityIcon identity={identity} uptie={4} displayName={true} displayRarity={true} size={128} />
                        </NoPrefetchLink>
                    </div>
                </td> :
                null
            }

            {line.map((piece, i) =>
                <td key={i + 1} style={{ borderTop: "1px #777 solid", borderBottom: "1px #777 solid", verticalAlign: "middle" }}>
                    {piece}
                </td>)
            }
        </tr>
        )}
    </>
}

function ComparisonCard({ identity, skillList, compareType }) {
    if (compareType === "stats") {
        const content = <div style={{ display: "flex", flexDirection: "column", height: "auto", justifyContent: "center", gap: "0.2rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem", textAlign: "center" }}>
                    <Icon path={"hp"} style={{ width: "32px", height: "32px" }} />
                    {constructHp(identity, LEVEL_CAP)}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem", textAlign: "center" }}>
                    <Icon path={"speed"} style={{ width: "32px", height: "32px" }} />
                    {constructSpeed(identity, 4)}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem", textAlign: "center" }}>
                    <Icon path={"defense level"} style={{ width: "32px", height: "32px" }} />
                    {constructDefenseLevel(identity, LEVEL_CAP)}
                </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", textAlign: "center" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
                    <KeywordIcon id={"Slash"} />
                    <ColoredResistance resist={identity.resists.slash} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
                    <KeywordIcon id={"Pierce"} />
                    <ColoredResistance resist={identity.resists.pierce} />
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.2rem" }}>
                    <KeywordIcon id={"Blunt"} />
                    <ColoredResistance resist={identity.resists.blunt} />
                </div>
            </div>

            <div style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                {(identity.skillKeywordList || []).map(x => <KeywordIcon key={x} id={x} />)}
            </div>
        </div>

        return <ComparisonCardBase identity={identity} content={content} />
    }

    const contentComponent = <AutoScroller fade={false}>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "0.1rem" }}>
            {skillList.map(([type, skill, i], ind) => <div key={ind}>
                {type === "atk" ?
                    <SkillCard skill={skill.data.data} mini={true} count={skill.num} label={constructSkillLabel("attack", skill.data.tier, i)} /> :
                    type === "def" ?
                        <SkillCard skill={skill.data.data} mini={true} count={skill.num} label={constructSkillLabel("defense")} /> :
                        type === "pasa" ?
                            <PassiveCard passive={skill} mini={true} label={constructSkillLabel("combat")} /> :
                            <PassiveCard passive={skill} mini={true} label={constructSkillLabel("support")} />
                }
            </div>)}
        </div>
    </AutoScroller>

    return <ComparisonCardBase identity={identity} content={contentComponent} />
}

function ComparisonRow({ identity, skillList, compareType }) {
    if (compareType === "stats") {
        const content = [
            <div key={1} style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "0.5rem", alignItems: "center", justifyContent: "center" }}>
                <Icon path={"hp"} style={{ width: "32px", height: "32px" }} />
                {constructHp(identity, LEVEL_CAP)}
                <Icon path={"speed"} style={{ width: "32px", height: "32px" }} />
                {constructSpeed(identity, 4)}
                <Icon path={"defense level"} style={{ width: "32px", height: "32px" }} />
                {constructDefenseLevel(identity, LEVEL_CAP)}
            </div>,
            <div key={2} style={{ display: "grid", gridTemplateColumns: "auto auto auto", justifyContent: "center", textAlign: "center", gap: "0.2rem" }}>
                <KeywordIcon id={"Slash"} />
                <KeywordIcon id={"Pierce"} />
                <KeywordIcon id={"Blunt"} />
                <ColoredResistance resist={identity.resists.slash} />
                <ColoredResistance resist={identity.resists.pierce} />
                <ColoredResistance resist={identity.resists.blunt} />
            </div>,
            <div key={3} style={{ display: "flex", gap: "0.25rem", justifyContent: "center" }}>
                {(identity.skillKeywordList || []).map(x => <KeywordIcon key={x} id={x} />)}
            </div>
        ]

        return <ComparisonRowBase identity={identity} content={[content]} />
    }

    if (["s1", "s2", "s3", "def", "skills"].includes(compareType)) {
        const iconSize = "32px";
        const coinSize = "24px";

        const constructCells = ([type, skill, ind], i) => {
            const skillData = skill.data.data;
            return [
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "center", maxWidth: "40ch", textAlign: "center" }}>
                    <div style={{ color: "#aaa", fontWeight: "bold" }}>
                        {type === "atk" ?
                            (ind === 0 ?
                                `Skill ${skill.data.tier}` :
                                `Skill ${skill.data.tier}-${ind + 1}`) :
                            `Defense`}
                    </div>
                    <div style={{ borderRadius: "5px", backgroundColor: affinityColorMapping[skillData.affinity], padding: "5px", color: "#ddd", textShadow: "black 1px 1px 5px", fontWeight: "bold" }}>
                        {skillData.name}
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", gap: "0.25rem", alignItems: "center" }}>
                        {skillData.affinity !== "none" ? <KeywordIcon id={skillData.affinity} /> : null}
                        {skillData.defType !== "attack" ? <KeywordIcon id={skillData.defType} /> : null}
                        {skillData.defType === "attack" || skillData.defType === "counter" ? <KeywordIcon id={skillData.atkType} /> : null}
                    </div>
                </div>,

                <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "center" }}>
                    <span style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                        <span style={{ whiteSpace: "nowrap" }}>
                            Power: {skillData.baseValue} {skillData.coinValue < 0 ? skillData.coinValue : `+${skillData.coinValue}`}
                        </span>
                        <span style={{ display: "flex", gap: "0" }}>
                            {skillData.coins.map((coin, i) => <Icon key={i} path={coin["type"] === "unbreakable" ? "unbreakable coin" : "coin"} style={{ width: coinSize, height: coinSize }} />)}
                        </span>
                    </span>
                    <span style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                        {skillData.defType === "attack" || skillData.defType === "counter" ?
                            <Icon path={"offense level"} style={{ height: iconSize, width: iconSize }} /> :
                            <Icon path={"defense level"} style={{ height: iconSize, width: iconSize }} />
                        }
                        {skillData.levelCorrection < 0 ? skillData.levelCorrection : `+${skillData.levelCorrection}`}
                        <span style={{ display: "flex", gap: "0.2rem" }}>
                            Atk Weight: <AtkWeight skillData={skillData} />
                        </span>
                    </span>
                </div>,

                <div key={i} style={{ display: "flex", flexDirection: "column", maxWidth: "100ch" }}>
                    <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.2", marginBottom: "0.25rem" }}>
                        {skillData.desc ?
                            <ProcessedText text={skillData.desc} /> :
                            null
                        }
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        {skillData.coins.map((coin, index) => "descs" in coin && coin["descs"].length > 0 ?
                            <div key={index} style={{ display: "flex", flexDirection: "row", gap: "0.5rem" }}>
                                <Coin num={index + 1} />
                                <div style={{ display: "flex", flex: 1, flexDirection: "column", whiteSpace: "pre-wrap", gap: "0.1rem" }}>
                                    {coin["descs"].map((desc, innerIndex) => <ProcessedText key={`${innerIndex}-text`} text={desc} />)}
                                </div>
                            </div> : null
                        )}
                    </div>
                </div>
            ]
        }

        return <ComparisonRowBase identity={identity} content={skillList.map((skill, i) => constructCells(skill, i))} />
    }

    if (["passives1", "passives2"].includes(compareType)) {
        const iconSize = "32px";

        const constructCells = ([type, passive, ind], i) => {
            return [
                <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "center", maxWidth: "40ch", textAlign: "center" }}>
                    <div style={{ borderRadius: "5px", backgroundColor: "grey", padding: "5px", color: "#ddd", textShadow: "black 1px 1px 5px", fontWeight: "bold" }}>
                        {passive.name}
                    </div>
                </div>,

                <div key={i} style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "center", padding: "0.5rem" }}>
                    <div style={{ display: "flex", flexDirection: "row", gap: "0.25rem" }}>
                        {"condition" in passive ? <PassiveCost condition={passive.condition} iconSize={iconSize} vertical={true} /> : null}
                    </div>
                </div>,

                <div key={i} style={{ display: "flex", flexDirection: "column", maxWidth: "100ch" }}>
                    <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.2" }}>
                        <ProcessedText text={passive.desc} />
                    </div>
                </div>
            ]
        }

        return <ComparisonRowBase identity={identity} content={skillList.map((skill, i) => constructCells(skill, i))} />
    }

    return null;
}

function ComparisonList({ items, compareType, displayType, otherOpts }) {
    const [statuses, statusesLoading] = useData("statuses", compareType !== "stats");
    const [skillTags, skillTagsLoading] = useData("skill_tags", compareType !== "stats");
    const { isMobile } = useBreakpoint();

    if ((statusesLoading || skillTagsLoading) && displayType !== "stats" && otherOpts.searchString.trim().length > 0) return null;

    const attachSearchScores = (list) =>
        list.map(([identity, skills]) => {
            const pieces = [];
            skills.forEach(([t, skill, i]) => {
                if (t === "atk" || t === "def") {
                    if (!skill.data) return;
                    const skillData = skill.data.data;
                    pieces.push(replaceStatusesInString(skillData.desc, statuses, skillTags));
                    if (skillData.coins) {
                        skillData.coins.forEach(coin => {
                            if (!("descs" in coin)) return;
                            coin["descs"].forEach(desc =>
                                pieces.push(replaceStatusesInString(desc, statuses, skillTags))
                            )
                        })
                    }
                } else if (t === "pasa" || t === "pasb") {
                    pieces.push(replaceStatusesInString(skill.desc, statuses, skillTags));
                }
            })

            const score = paragraphScore(otherOpts.searchString, pieces.join(" | "))

            return [identity, skills, score];
        })

    const outsideInterval = (val, [min, max]) => val < min || val > max;

    const filterList = (list) => {
        if (compareType === "stats")
            return list.filter(([identity, skills]) => {
                const maxHp = Math.floor(identity.hp.base + LEVEL_CAP * identity.hp.level);
                if (outsideInterval(maxHp, otherOpts.maxHp)) return false;
                if (outsideInterval(identity.breakSection.length, otherOpts.staggers)) return false;
                const [speedMin, speedMax] = identity.speedList[3];
                if (otherOpts.speedType === "overlap") {
                    if (speedMax < otherOpts.speed[0] || speedMin > otherOpts.speed[1]) return false;
                } else if (otherOpts.speedType === "contains") {
                    if (speedMin < otherOpts.speed[0] || speedMax > otherOpts.speed[1]) return false;
                } else if (otherOpts.speedType === "contained") {
                    if (speedMin > otherOpts.speed[0] || speedMax < otherOpts.speed[1]) return false;
                }
                if (outsideInterval(identity.defCorrection, otherOpts.defenseLevel)) return false;
                if (outsideInterval(identity.resists.slash, otherOpts.slashRes)) return false;
                if (outsideInterval(identity.resists.pierce, otherOpts.pierceRes)) return false;
                if (outsideInterval(identity.resists.blunt, otherOpts.bluntRes)) return false;
                return true;
            })

        if (["s1", "s2", "s3", "def", "skills"].includes(compareType))
            return list.filter(x => {
                if (x.length === 3 && otherOpts.searchString.trim().length > 0 && x[2] === 0) return false;

                return x[1].some(([type, skill, i]) => {
                    if (!skill.data) return false;
                    const skillData = skill.data.data;
                    if (outsideInterval(skillData.baseValue, otherOpts.basePower)) return false;
                    if (outsideInterval(skillData.coinValue, otherOpts.coinPower)) return false;
                    if (outsideInterval(skillData.coins.length, otherOpts.coins)) return false;
                    if (outsideInterval(skillData.levelCorrection, otherOpts.levelOffset)) return false;
                    if (outsideInterval(skillData.atkWeight, otherOpts.atkWeight)) return false;
                    return true;
                });
            })

        if (["passives1", "passives2"].includes(compareType))
            return list.filter(x => {
                if (x.length === 3 && otherOpts.searchString.trim().length > 0 && x[2] === 0) return false;

                return x[1].some(([type, skill, i]) => {
                    if (otherOpts.costType === "owned") {
                        if (!("condition" in skill) || skill.condition.type !== "owned") return false;

                        return skill.condition.requirement.every(cost =>
                            otherOpts.maxCost[keywordToIdMapping[cost.type] - 8] >= cost.value
                        );
                    } else if (otherOpts.costType === "res") {
                        if (!("condition" in skill) || skill.condition.type !== "res") return false;

                        return skill.condition.requirement.every(cost =>
                            otherOpts.maxCost[keywordToIdMapping[cost.type] - 8] >= cost.value
                        );
                    } else if (otherOpts.costType === "none") {
                        if ("condition" in skill) return false;
                    } else {
                        if (!("condition" in skill)) return true;

                        return skill.condition.requirement.every(cost =>
                            otherOpts.maxCost[keywordToIdMapping[cost.type] - 8] >= cost.value
                        );
                    }
                    return true;
                });
            })

        return [];
    }

    const initialList = compareType === "stats" ?
        items :
        otherOpts.searchString.trim().length > 0 ?
            attachSearchScores(items) : items

    const sortList = (list) => {
        if (compareType === "stats") {
            let sorted = list;
            switch (otherOpts.sortType) {
                case "max hp":
                    sorted = list
                        .map(([x, s]) => [[x, s], Math.floor(x.hp.base + LEVEL_CAP * x.hp.level)])
                        .sort((a, b) => a[1] - b[1])
                        .map(([x, hp]) => x)
                    break;
                case "max speed":
                    sorted = list.sort(([a], [b]) => {
                        const [amin, amax] = a.speedList[3];
                        const [bmin, bmax] = b.speedList[3];
                        return amax === bmax ? amin - bmin : amax - bmax;
                    })
                    break;
                case "min speed":
                    sorted = list.sort(([a], [b]) => {
                        const [amin, amax] = a.speedList[3];
                        const [bmin, bmax] = b.speedList[3];
                        return amin === bmin ? amax - bmax : amin - bmin;
                    })
                    break;
                case "defense level":
                    sorted = list.sort(([a], [b]) => a.defCorrection - b.defCorrection);
                    break;
                case "slash resist":
                    sorted = list.sort(([a], [b]) => a.resists.slash - b.resists.slash);
                    break;
                case "pierce resist":
                    sorted = list.sort(([a], [b]) => a.resists.pierce - b.resists.pierce);
                    break;
                case "blunt resist":
                    sorted = list.sort(([a], [b]) => a.resists.blunt - b.resists.blunt);
                    break;
                default: break;
            }
            return otherOpts.sortAscending ? sorted : sorted.reverse();
        }

        if (["s1", "s2", "s3", "def", "skills"].includes(compareType)) {
            let sorted = list;

            switch (otherOpts.sortType) {
                case "search match score":
                    sorted = list.sort(([a, as, asc], [b, bs, bsc]) => asc - bsc);
                    break;
                case "base power":
                    sorted = list.sort(([a, as], [b, bs]) => {
                        const at = as.reduce((acc, [t, sk, i]) => acc + sk.data.data.baseValue, 0);
                        const bt = bs.reduce((acc, [t, sk, i]) => acc + sk.data.data.baseValue, 0);
                        return at - bt;
                    })
                    break;
                case "coin power":
                    sorted = list.sort(([a, as], [b, bs]) => {
                        const at = as.reduce((acc, [t, sk, i]) => acc + sk.data.data.coinValue, 0);
                        const bt = bs.reduce((acc, [t, sk, i]) => acc + sk.data.data.coinValue, 0);
                        return at - bt;
                    })
                    break;
                case "coins":
                    sorted = list.sort(([a, as], [b, bs]) => {
                        const at = as.reduce((acc, [t, sk, i]) => acc + sk.data.data.coins.length, 0);
                        const bt = bs.reduce((acc, [t, sk, i]) => acc + sk.data.data.coins.length, 0);
                        return at - bt;
                    })
                    break;
                case "level offset":
                    sorted = list.sort(([a, as], [b, bs]) => {
                        const at = as.reduce((acc, [t, sk, i]) => acc + sk.data.data.levelCorrection, 0);
                        const bt = bs.reduce((acc, [t, sk, i]) => acc + sk.data.data.levelCorrection, 0);
                        return at - bt;
                    })
                    break;
                case "atk weight":
                    sorted = list.sort(([a, as], [b, bs]) => {
                        const at = as.reduce((acc, [t, sk, i]) => acc + sk.data.data.atkWeight, 0);
                        const bt = bs.reduce((acc, [t, sk, i]) => acc + sk.data.data.atkWeight, 0);
                        return at - bt;
                    })
                    break;
                default: break;
            }
            return otherOpts.sortAscending ? sorted : sorted.reverse();
        }

        if (["passives1", "passives2"].includes(compareType)) {
            let sorted = list;

            switch (otherOpts.sortType) {
                case "search match score":
                    sorted = list.sort(([a, as, asc], [b, bs, bsc]) => asc - bsc);
                    break;
                default: break;
            }
            return otherOpts.sortAscending ? sorted : sorted.reverse();
        }

        return list;
    }

    const sortedList = sortList(filterList(initialList));

    if (displayType === "card") {
        return <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, 320px)", width: "100%", gap: "0.2rem", justifyContent: "center" }}>
            {sortedList.map(([identity, skills], i) => <ComparisonCard key={i} identity={identity} skillList={skills} compareType={compareType} />)}
        </div>
    } else if (displayType === "full") {
        return <div style={{ display: "flex", overflowX: "auto", width: "100%", justifyContent: isMobile ? "start" : "center", overflowY: "hidden" }}>
            <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: "1600px" }}>
                {
                    compareType === "stats" ?
                        <thead>
                            <tr style={{ height: "1.25rem" }}>
                                <th>Identity</th>
                                <th>Hp, Speed, Defense Level</th>
                                <th>Resists</th>
                                <th>Keywords</th>
                            </tr>
                        </thead> :
                        <thead>
                            <tr style={{ height: "1.25rem" }}>
                                <th>Identity</th>
                                <th>Info</th>
                                <th>{compareType === "passives1" || compareType === "passives2" ? "Cost" : "Details"}</th>
                                <th>Description</th>
                            </tr>
                        </thead>
                }
                <tbody>
                    {sortedList.map(([identity, skills], i) => <ComparisonRow key={i} identity={identity} skillList={skills} compareType={compareType} />)}
                </tbody>
            </table>
        </div>
    } else {
        return null;
    }
}

const splitBySinner = list => list.reduce((acc, [id, identity]) => {
    if (identity.sinnerId in acc) acc[identity.sinnerId].push([id, identity]);
    else acc[identity.sinnerId] = [[id, identity]];
    return acc;
}, {});

const getSkillList = (identity, t, skillData) => {
    if (t === "s1") return identity.skillTypes.filter(skill => skill.type.tier === 1).map((s, i) => ["atk", { data: skillData.skills[s.id], num: s.num }, i]);
    if (t === "s2") return identity.skillTypes.filter(skill => skill.type.tier === 2).map((s, i) => ["atk", { data: skillData.skills[s.id], num: s.num }, i]);
    if (t === "s3") return identity.skillTypes.filter(skill => skill.type.tier === 3).map((s, i) => ["atk", { data: skillData.skills[s.id], num: s.num }, i]);
    if (t === "def") return identity.defenseSkillTypes.map(s => ["def", { data: skillData.skills[s.id] }, -1]);
    if (t === "skills")
        return [
            ...getSkillList(identity, "s1", skillData),
            ...getSkillList(identity, "s2", skillData),
            ...getSkillList(identity, "s3", skillData),
            ...identity.skillTypes.filter(skill => skill.type.tier === 4).map((s, i) => ["atk", { data: skillData.skills[s.id], num: s.num }, i]),
            ...getSkillList(identity, "def", skillData)
        ]
    if (t === "passives1") {
        return skillData.combatPassives.map(passive =>
            ["pasa", passive, -1]
        );
    }
    if (t === "passives2") {
        return skillData.supportPassives.map(passive =>
            ["pasb", passive, -1]
        );
    }

    return [];
}

export default function IdentityComparisonAdvanced({ identities, displayType, separateSinners }) {
    const [compareType, setCompareType] = useState("stats");
    const [searchString, setSearchString] = useState("");
    const [maxHp, setMaxHp] = useState([0, 500]);
    const [staggers, setStaggers] = useState([0, 5]);
    const [speed, setSpeed] = useState([0, 9]);
    const [speedType, setSpeedType] = useState("overlap");
    const [defenseLevel, setDefenseLevel] = useState([-9, 9]);
    const [slashRes, setSlashRes] = useState([0, 2]);
    const [pierceRes, setPierceRes] = useState([0, 2]);
    const [bluntRes, setBluntRes] = useState([0, 2]);
    const [basePower, setBasePower] = useState([0, 99]);
    const [coinPower, setCoinPower] = useState([-99, 99]);
    const [coins, setCoins] = useState([0, 9]);
    const [levelOffset, setLevelOffset] = useState([-9, 9]);
    const [atkWeight, setAtkWeight] = useState([1, 9]);
    const [maxCost, setMaxCost] = useState([9, 9, 9, 9, 9, 9, 9]);
    const [costType, setCostType] = useState("any");
    const [sortType, setSortType] = useState("default");
    const [sortAscending, setSortAscending] = useState(true);
    const [grouped, setGrouped] = useState(true);

    const skillData = useSkillData("identity", identities.map(([id]) => id), identities.map(() => 4))

    const identityListToItems = list => list.reduce((acc, [id, identity]) => {
        if (compareType === "stats") {
            acc.push([identity, []]);
            return acc;
        }

        const list = getSkillList(identity, compareType, skillData[id]);
        if (grouped) acc.push([identity, list]);
        else list.forEach(skill => acc.push([identity, [skill]]));
        return acc;
    }, []);

    const listComponents = separateSinners ?
        Object.entries(splitBySinner(identities)).map(([sinnerId, identityList]) => {
            return [
                <div key={sinnerId} style={{ display: "flex", flexDirection: "row", alignItems: "center", fontSize: "1.2rem", fontWeight: "bold", padding: "0.5rem 0rem" }}>
                    <SinnerIcon num={sinnerId} style={{ height: "48px" }} />
                    {sinnerIdMapping[sinnerId]}
                </div>,
                identityListToItems(identityList)
            ]
        }) :
        identityListToItems(identities);

    const otherOpts = {
        searchString: searchString,
        maxHp: maxHp,
        staggers: staggers,
        speed: speed,
        speedType: speedType,
        defenseLevel: defenseLevel,
        slashRes: slashRes,
        pierceRes: pierceRes,
        bluntRes: bluntRes,
        basePower: basePower,
        coinPower: coinPower,
        coins: coins,
        levelOffset: levelOffset,
        atkWeight: atkWeight,
        maxCost: maxCost,
        costType: costType,
        sortType: sortType,
        sortAscending: sortAscending
    }

    const sortOptions =
        compareType === "stats" ?
            {
                "default": "default",
                "max hp": "max hp",
                "max speed": "max speed",
                "min speed": "min speed",
                "defense level": "defense level",
                "slash resist": "slash resist",
                "pierce resist": "pierce resist",
                "blunt resist": "blunt resist"
            } :
            ["s1", "s2", "s3", "def", "skills"].includes(compareType) ?
                {
                    "default": "default",
                    "search match score": "search match score",
                    "base power": "base power",
                    "coin power": "coin power",
                    "coins": "coins",
                    "level offset": "level offset",
                    "atk weight": "atk weight"
                } :
                ["passives1", "passives2"].includes(compareType) ?
                    {
                        "default": "default",
                        "search match score": "search match score"
                    } :
                    {
                        "default": "default"
                    };

    const filterStyle = { display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", gap: "0.2rem" }}>
        <span style={{ fontSize: "0.9rem", wordWrap: "wrap", textAlign: "center" }}>
            Use more precise filters and sorting options to compare details across all identities and their skills.
            <br />
            Warning: Some combinations of settings may cause the webpage to lag due to the number of things being rendered, especially when using &quot;All Skills&quot;.
            Try using filters if this happens.
        </span>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span>Compare Target:</span>
                <DropdownButton value={compareType} setValue={setCompareType} options={options} />
            </div>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <span>Sort:</span>
                <DropdownButton value={sortType} setValue={setSortType} options={sortOptions} />
                <button onClick={() => setSortAscending(p => !p)}>
                    {sortAscending ? "ascending" : "descending"}
                </button>
            </div>
            {compareType !== "stats" ?
                <label>
                    <input type="checkbox" checked={grouped} onChange={e => setGrouped(p => !p)} />
                    <span {...getGeneralTooltipProps("groupedComp")} style={{ borderBottom: "1px #777 dotted" }}>Grouped by Identity</span>
                </label> : null
            }
        </div>
        <div style={{ display: "flex", alignItems: "start", flexWrap: "wrap", justifyContent: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            {compareType === "stats" ? <>
                <div style={{ display: "flex", gap: "0.5rem", }}>
                    <div style={filterStyle}>
                        <Icon path={"hp"} style={{ width: "32px", height: "32px" }} />
                        <RangeInput min={0} max={500} value={maxHp} onChange={setMaxHp} />
                    </div>
                    <div style={filterStyle}>
                        <span style={{ display: "flex", height: "32px", alignItems: "center" }}>Staggers:</span>
                        <RangeInput min={0} max={5} value={staggers} onChange={setStaggers} />
                    </div>
                    <div style={filterStyle}>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                            <Icon path={"speed"} style={{ width: "32px", height: "32px" }} />

                            <button onClick={() => {
                                if (speedType === "overlap") setSpeedType("contains");
                                else if (speedType === "contains") setSpeedType("contained");
                                else setSpeedType("overlap");
                            }}>
                                {speedType}
                            </button>
                        </div>
                        <RangeInput min={0} max={9} value={speed} onChange={setSpeed} />
                    </div>
                    <div style={filterStyle}>
                        <Icon path={"defense level"} style={{ width: "32px", height: "32px" }} />
                        <RangeInput min={-9} max={9} value={defenseLevel} onChange={setDefenseLevel} />
                    </div>
                </div>
                <div style={{ display: "flex", gap: "0.5rem", }}>
                    <div style={filterStyle}>
                        <Icon path={"Slash"} style={{ width: "32px", height: "32px" }} />
                        <RangeInput min={0} max={2} value={slashRes} onChange={setSlashRes} />
                    </div>
                    <div style={filterStyle}>
                        <Icon path={"Pierce"} style={{ width: "32px", height: "32px" }} />
                        <RangeInput min={0} max={2} value={pierceRes} onChange={setPierceRes} />
                    </div>
                    <div style={filterStyle}>
                        <Icon path={"Blunt"} style={{ width: "32px", height: "32px" }} />
                        <RangeInput min={0} max={2} value={bluntRes} onChange={setBluntRes} />
                    </div>
                </div>
            </> :
                ["s1", "s2", "s3", "def", "skills"].includes(compareType) ?
                    <>
                        <div style={filterStyle}>
                            <div style={{ display: "flex", height: "32px", alignItems: "center" }}>
                                <span {...getGeneralTooltipProps("descSearch")} style={{ borderBottom: "1px #777 dotted" }}>
                                    Search in Description:
                                </span>
                            </div>
                            <input value={searchString} onChange={e => setSearchString(e.target.value)} />
                        </div>
                        <div style={filterStyle}>
                            <span style={{ display: "flex", height: "32px", alignItems: "center" }}>Base Power:</span>
                            <RangeInput min={0} max={99} value={basePower} onChange={setBasePower} />
                        </div>
                        <div style={filterStyle}>
                            <span style={{ display: "flex", height: "32px", alignItems: "center" }}>Coin Power:</span>
                            <RangeInput min={-99} max={99} value={coinPower} onChange={setCoinPower} />
                        </div>
                        <div style={filterStyle}>
                            <span style={{ display: "flex", height: "32px", alignItems: "center" }}>Coins:</span>
                            <RangeInput min={0} max={9} value={coins} onChange={setCoins} />
                        </div>
                        <div style={filterStyle}>
                            <span style={{ display: "flex", alignItems: "center" }}>
                                <Icon path={"offense level"} style={{ width: "32px", height: "32px" }} /> /
                                <Icon path={"defense level"} style={{ width: "32px", height: "32px" }} />
                            </span>
                            <RangeInput min={-9} max={9} value={levelOffset} onChange={setLevelOffset} />
                        </div>
                        <div style={filterStyle}>
                            <span style={{ display: "flex", height: "32px", alignItems: "center" }}>Atk Weight:</span>
                            <RangeInput min={-9} max={9} value={atkWeight} onChange={setAtkWeight} />
                        </div>
                    </> : <>
                        <div style={filterStyle}>
                            <span {...getGeneralTooltipProps("descSearch")} style={{ borderBottom: "1px #777 dotted" }}>
                                Search in Description:
                            </span>
                            <input value={searchString} onChange={e => setSearchString(e.target.value)} />
                        </div>
                        <div style={filterStyle}>
                            <span>Cost Type:</span>
                            <button onClick={() => {
                                if (costType === "any") setCostType("owned");
                                else if (costType === "owned") setCostType("res");
                                else if (costType === "res") setCostType("none");
                                else setCostType("any");
                            }}>
                                {costType}
                            </button>
                        </div>
                        <div style={filterStyle}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                                <span>Max Cost:</span>
                                <button onClick={() => setMaxCost([0, 0, 0, 0, 0, 0, 0])}>Set all 0</button>
                                <button onClick={() => setMaxCost([9, 9, 9, 9, 9, 9, 9])}>Set all 9</button>
                            </div>
                            <div style={{ display: "flex" }}>
                                {["wrath", "lust", "sloth", "gluttony", "gloom", "pride", "envy"].map((affinity, i) =>
                                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                                        <KeywordIcon id={affinity} />
                                        <input type="number" min={0} max={9} value={maxCost[i]}
                                            onChange={e => setMaxCost(p => p.map((x, ind) => ind === i ? Number(e.target.value) : x))}
                                            style={{ width: "3ch", textAlign: "center" }}
                                        />
                                    </div>)}
                            </div>
                        </div>
                    </>
            }
        </div>
        <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            {displayType === "icon" ?
                <h2>Icons display type not supported</h2> :
                (separateSinners ?
                    listComponents.map(([sep, list], i) => <>
                        {sep}
                        <ComparisonList key={`${i}-2`} items={list} compareType={compareType} displayType={displayType} otherOpts={otherOpts} />
                    </>) :
                    <ComparisonList items={listComponents} compareType={compareType} displayType={displayType} otherOpts={otherOpts} />
                )
            }
        </div>
    </div>

}
