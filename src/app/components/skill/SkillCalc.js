import { useMemo } from "react";

import { useSkillData } from "../dataHooks/skills";
import Icon from "../icons/Icon";
import KeywordIcon from "../icons/KeywordIcon";
import AutoScroller from "../objects/AutoScroller";
import { getGeneralTooltipProps } from "../tooltips/GeneralTooltip";

import { affinityColorMapping } from "@/app/lib/colors";
import { egoRanks, LEVEL_CAP } from "@/app/lib/constants";


const formatter = new Intl.NumberFormat(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
});

function computeSkill(skill, opts) {
    if ((opts.cond === "skill" || opts.cond === "all") && !skill.bonusesEnabled)
        return ["--", "--"];

    let basePower = skill.basePower;
    let coinPowerBonus = 0;
    let damageMultiplier = 1;
    let critMultiplier = 0; // Added to damage multiplier, so no need to start at 1
    let damageAdder = 0;
    let clashBonus = 0;
    let offDefLevel = skill.offDefLevel;
    let lastCoinBonuses = [];
    let typeConvert = 0;

    const evaluateValue = value => {
        if (typeof value === 'number')
            return value;

        let expr = value.slice(1);
        const resolvedExpr = expr.replace(/\{([a-zA-Z_][a-zA-Z0-9_.]*)\}/g, (match, name) => {
            let pieces = name.split(".");
            if (pieces[0] === "res") {
                return opts.target[pieces[1]] ?? 1;
            }
            return null;
        });

        try {
            return new Function(`return ${resolvedExpr};`)();
        } catch (err) {
            throw new Error(`Invalid expression after substitution: ${resolvedExpr}`);
        }
    }

    if (skill.bonusesEnabled && opts.cond !== "default")
        skill.bonuses?.forEach(bonus => {
            switch (bonus.type) {
                case "base": case "final":
                    if (bonus.extra?.cond === "tolastcoin") {
                        lastCoinBonuses.push(bonus);
                    } else {
                        basePower += bonus.value;
                    }
                    break;
                case "clash":
                    clashBonus += bonus.value;
                    break;
                case "coin":
                    coinPowerBonus += bonus.value;
                    break;
                case "damage":
                    if (bonus.extra.cond === "tolastcoin") {
                        lastCoinBonuses.push(bonus);
                    } else if (bonus.extra.op === "mul") {
                        damageMultiplier += bonus.value;
                    } else if (bonus.extra.op === "add") {
                        damageAdder += bonus.value;
                    }
                    break;
                case "typeconverteddamage":
                    typeConvert += evaluateValue(bonus.value) * (1 + ((opts.target[bonus.extra["type1"]] ?? 1) - 1) + ((opts.target[bonus.extra["type2"]] ?? 1) - 1));
                    break;
                case "critdamage":
                    critMultiplier += bonus.value;
                    break;
                case "skilllevel":
                    offDefLevel += bonus.value;
                    break;
                default:
                    break;
            }
        })

    let resistMultiplier = 1;
    if (typeConvert === 0) {
        if (skill.atkType) resistMultiplier += (opts.target[skill.atkType] ?? 1) - 1;
        if (skill.affinity !== "none") resistMultiplier += (opts.target[skill.affinity] ?? 1) - 1;
    } else {
        resistMultiplier = typeConvert;
    }
    resistMultiplier += (offDefLevel - (opts.target.def ?? LEVEL_CAP)) / (Math.abs(offDefLevel - (opts.target.def ?? LEVEL_CAP)) + 25);

    let [clash, damage] = skill.coins.reduce(([clash, damage, roll], coin, coinIndex) => {
        let coinPower = skill.coinPower + coinPowerBonus;
        let coinDamageMultiplier = damageMultiplier;
        let coinReuseDamageMultiplier = 1; // directly multiplied, start as 1
        let coinHeadsDamageMultiplier = 0; // added to regular multiplier, start as 0
        let coinCritMultiplier = critMultiplier;
        let coinDamageAdder = 0;
        let coinReuses = 0;
        let critReuses = 0;
        let headReuses = 0;
        let headCritReuses = 0;
        let reuseHeadReuses = 0;
        let endBonuses = [];
        let newLastCoinBonuses = [];
        let lastCoinDamageAdder = 0;
        let coinTypeConvert = 0;

        if (skill.bonusesEnabled && opts.cond === "all")
            coin.bonuses?.forEach(bonus => {
                switch (bonus.type) {
                    case "coin":
                        coinPower += bonus.value;
                        break;
                    case "damage":
                        if (bonus.extra.cond === "tolastcoin") {
                            newLastCoinBonuses.push(bonus);
                        } else if (bonus.extra.cond === "lastcoinonly") {
                            if ("type" in bonus.extra)
                                lastCoinDamageAdder += evaluateValue(bonus.value) * (opts.target[bonus.extra["type"]] ?? 1);
                            else
                                lastCoinDamageAdder += evaluateValue(bonus.value);
                        } else if (bonus.extra.op === "mul") {
                            if ("type" in bonus.extra) {
                                endBonuses.push(bonus);
                            } else {
                                switch (bonus.extra.cond ?? "") {
                                    case "heads":
                                        coinHeadsDamageMultiplier += evaluateValue(bonus.value);
                                        break;
                                    case "reuse":
                                        coinReuseDamageMultiplier += evaluateValue(bonus.value);
                                        break;
                                    default:
                                        coinDamageMultiplier += evaluateValue(bonus.value);
                                        break;
                                }
                            }
                        } else if (bonus.extra.op === "add") {
                            if ("type" in bonus.extra)
                                coinDamageAdder += evaluateValue(bonus.value) * (opts.target[bonus.extra["type"]] ?? 1);
                            else
                                coinDamageAdder += evaluateValue(bonus.value);
                        }
                        break;
                    case "typeconverteddamage":
                        coinTypeConvert += evaluateValue(bonus.value) * (1 + ((opts.target[bonus.extra["type1"]] ?? 1) - 1) + ((opts.target[bonus.extra["type2"]] ?? 1) - 1));
                        break;
                    case "critdamage":
                        coinCritMultiplier += evaluateValue(bonus.value);
                        break;
                    case "reuse":
                        if (bonus.extra?.cond === "crit")
                            critReuses += bonus.value;
                        else if (bonus.extra?.cond === "heads")
                            headReuses += bonus.value;
                        else if (bonus.extra?.cond === "heads-crit")
                            headCritReuses += bonus.value;
                        else if (bonus.extra?.cond === "reuse-heads")
                            reuseHeadReuses += bonus.value;
                        else
                            coinReuses += bonus.value;
                        break;
                    default:
                        break;
                }
            })

        let p = 0;
        if (opts.type === "max") p = coinPower < 0 ? 0 : 1;
        else if (opts.type === "min") p = coinPower < 0 ? 1 : 0;
        else if (opts.type === "avg") p = 0.5 + (opts.sp / 100);

        coinDamageMultiplier += p * coinHeadsDamageMultiplier;
        let newRoll = roll;
        let newDamage = 0;
        let headsReuseMultiplier = 1;

        const simulateCoin = (reuse = false, headsReuse = false, lastcoin = false) => {
            newRoll += (p * coinPower);

            newLastCoinBonuses.forEach(bonus => lastCoinBonuses.push(bonus));

            if (lastcoin) {
                lastCoinBonuses.forEach(bonus => {
                    if (bonus.type === "damage") {
                        if (bonus.extra.op === "mul")
                            if ("type" in bonus.extra) {
                                endBonuses.push(bonus);
                            } else {
                                coinDamageMultiplier += evaluateValue(bonus.value);
                            }
                        else if (bonus.extra.op === "add") {
                            if ("type" in bonus.extra)
                                coinDamageAdder += evaluateValue(bonus.value) * (opts.target[bonus.extra["type"]] ?? 1);
                            else
                                coinDamageAdder += evaluateValue(bonus.value);
                        }
                    } else if (bonus.type === "base" || bonus.type === "final") {
                        newRoll += bonus.value;
                    }
                });
            }

            let damage = newRoll;

            if (reuse) {
                damage *= coinReuseDamageMultiplier;
            }

            if (headsReuse) {
                headsReuseMultiplier *= p;
                damage *= headsReuseMultiplier;
            }

            let coinResistMultiplier = 1;
            if (coinTypeConvert === 0) {
                coinResistMultiplier = resistMultiplier;
            } else {
                coinResistMultiplier = coinTypeConvert + (offDefLevel - (opts.target.def ?? LEVEL_CAP)) / (Math.abs(offDefLevel - (opts.target.def ?? LEVEL_CAP)) + 25);
            }

            if (skill.applyCrits) {
                damage *= (coinResistMultiplier + 0.2) * (coinDamageMultiplier + coinCritMultiplier);
            } else {
                damage *= coinResistMultiplier * coinDamageMultiplier;
            }

            damage += coinDamageAdder;
            if (lastcoin) {
                damage += lastCoinDamageAdder;
            }
            if (damage < 1 && !headsReuse) damage = 1;

            let finalDamage = damage;
            endBonuses.forEach(bonus => {
                if (bonus.type === "damage" && bonus.extra.op === "mul") {
                    let addedDamage = damage * evaluateValue(bonus.value);
                    if ("max" in bonus.extra) addedDamage = Math.min(addedDamage, bonus.extra["max"]);
                    finalDamage += addedDamage * (opts.target[bonus.extra.type] ?? 1);
                }
            });

            newDamage += finalDamage;
        }

        const lastCoinWithoutReuse = coinIndex === skill.coins.length - 1;
        simulateCoin(false, false, lastCoinWithoutReuse && coinReuses + (skill.applyCrits ? critReuses : 0) + headReuses === 0);
        let reuses = coinReuses + (skill.applyCrits ? critReuses : 0);
        headReuses = headReuses + (skill.applyCrits ? headCritReuses : 0);
        if (reuses + headReuses > 0) headReuses += reuseHeadReuses;
        for (let i = 0; i < reuses; i++) {
            simulateCoin(true, false, lastCoinWithoutReuse && i === reuses - 1 && headReuses === 0);
        }
        for (let i = 0; i < headReuses; i++) {
            simulateCoin(false, true, lastCoinWithoutReuse && i === headReuses - 1);
        }

        return [clash + (p * (skill.coinPower + coinPowerBonus)), damage + newDamage, newRoll];
    }, [basePower, 0, basePower]);

    if (skill.atkType) {
        if (offDefLevel > (opts.target.off ?? LEVEL_CAP)) clash += Math.floor((offDefLevel - (opts.target.off ?? LEVEL_CAP)) / 3);
    } else {
        if (offDefLevel > (opts.target.def ?? LEVEL_CAP)) clash += Math.floor((offDefLevel - (opts.target.def ?? LEVEL_CAP)) / 3);
    }

    clash += clashBonus;
    clash = Math.max(clash, 0);

    return [formatter.format(clash), skill.atkType ? formatter.format(damage) : "0"];
}

function CalcCard({ skill, clash, damage }) {
    let numProps = {};
    const numStyle = {};
    if (skill.bonusNotes) {
        numProps = getGeneralTooltipProps(skill.bonusNotes)
        numStyle["textDecoration"] = "underline";
    }

    return <div style={{
        display: "flex", flexDirection: "column", padding: "0.5rem", gap: "0.5rem",
        border: `1px ${affinityColorMapping[skill.affinity] ?? "#777"} solid`, borderRadius: "1rem"
    }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                {skill.atkType ?
                    <KeywordIcon id={skill.atkType} size={24} /> :
                    <KeywordIcon id={skill.defType} size={24} />
                }
                <div style={{
                    borderRadius: "5px", backgroundColor: affinityColorMapping[skill.affinity], padding: "5px",
                    color: "#ddd", textShadow: "black 1px 1px 5px", fontWeight: "bold", fontSize: "0.8rem"
                }}>
                    {skill.name}
                </div>
            </div>
            <div style={{ flex: "0 0 auto", color: "#aaa", fontWeight: "bold", fontSize: "1rem", marginLeft: "0.5rem" }}>
                {typeof skill.rank[0] === 'number' ? `Skill ${skill.rank[0]}` : skill.rank[0]}{skill.rank.length === 2 ? `-${skill.rank[1]}` : ""}
            </div>
        </div>
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "0.25rem", alignItems: "center", marginBottom: "0.25rem" }}>
            <span style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                <span>
                    Power: {skill.basePower} {skill.coinPower < 0 ? skill.coinPower : `+${skill.coinPower}`}
                </span>
                <span style={{ gap: "0" }}>
                    {skill.coins.map((coin, i) =>
                        <Icon key={i} path={coin === "unbreakable" ? "unbreakable coin" : "coin"} style={{ width: "18px", height: "18px" }} />
                    )}
                </span>
            </span>
            <span style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
                {skill.defType === "attack" || skill.defType === "counter" ?
                    <Icon path={"offense level"} style={{ width: "24px", height: "24px" }} /> :
                    <Icon path={"defense level"} style={{ width: "24px", height: "24px" }} />
                }
                <span>{skill.offDefLevel}</span>
            </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 3fr" }}>
            <span {...numProps} style={numStyle}>Clash: {formatter.format(clash)}</span>
            {skill.atkType ?
                <span {...numProps} style={numStyle}>Damage: {formatter.format(damage)}</span> :
                null
            }
        </div>
    </div>
}

function SkillCalc({ skills, opts }) {
    if (opts.view === "expand") {
        return <AutoScroller>
            <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "0.1rem" }}>
                {skills.map((skill, i) => {
                    const [clash, damage] = computeSkill(skill, opts);
                    return <CalcCard key={i} skill={skill} clash={clash} damage={damage} />
                })}
            </div>
        </AutoScroller>;
    }

    if (opts.view === "compress") {
        const clashes = {};
        const damages = {};

        skills.forEach(skill => {
            const [clash, damage] = computeSkill(skill, opts);
            const label = typeof skill.rank[0] === 'number' ? `S${skill.rank[0]}` : (skill.rank[0] === "Defense" ? "Def" : skill.rank[0][0]);

            let numProps = {};
            const numStyle = { fontWeight: "bold" };
            if (skill.bonusNotes) {
                numProps = getGeneralTooltipProps(skill.bonusNotes)
                numStyle["textDecoration"] = "underline";
            }

            if (!(label in clashes)) clashes[label] = [];
            if (clashes[label].length !== 0) clashes[label].push(<span key={clashes[label].length}>, </span>);
            clashes[label].push(
                <span key={clashes[label].length} style={{ color: affinityColorMapping[skill.affinity] ?? "#ddd", ...numStyle }} {...numProps}>
                    {clash}
                </span>
            )

            if (!(label in damages)) damages[label] = [];
            if (damages[label].length !== 0) damages[label].push(<span key={damages[label].length}>, </span>);
            damages[label].push(
                <span key={damages[label].length} style={{ color: affinityColorMapping[skill.affinity] ?? "#ddd", ...numStyle }} {...numProps}>
                    {damage}
                </span>
            )
        });

        const gridItems = [
            <div key={-1} />,
            <div key={"c"} style={{ textAlign: "center" }}>Clash</div>,
            <div key={"d"} style={{ textAlign: "center" }}>Damage</div>
        ]

        Object.keys(clashes).forEach((key, i) => {
            gridItems.push(<div key={i} style={{ textAlign: "center", padding: "0rem 0.25rem", fontWeight: "bold", color: "#aaa" }}>{key}</div>);
            gridItems.push(<div key={`${i}-c`} style={{ borderLeft: "1px #777 solid", padding: "0rem 0.2rem" }}>
                {clashes[key]}
            </div>);
            gridItems.push(<div key={`${i}-d`} style={{ borderLeft: "1px #777 solid", padding: "0rem 0.2rem" }}>
                {damages[key]}
            </div>);
        })

        return <AutoScroller>
            <div style={{ display: "grid", gridTemplateColumns: "auto 2fr 3fr", width: "100%", gap: "0.2rem" }}>
                {gridItems}
            </div>
        </AutoScroller>;
    }

    return null;
}

function extractSkillData(skill, level, rank, applyCrits = false) {
    const skillData = {
        name: skill.data.name,
        rank: rank,
        atkType: skill.data.atkType,
        defType: skill.data.defType,
        affinity: skill.data.affinity,
        coins: skill.data.coins,
        basePower: skill.data.baseValue,
        coinPower: skill.data.coinValue,
        offDefLevel: skill.data.levelCorrection + level,
        bonusesEnabled: skill.bonusesEnabled,
        bonuses: skill.data.bonuses,
        applyCrits: applyCrits
    };

    if ("bonusNotes" in skill) skillData["bonusNotes"] = skill["bonusNotes"];
    return skillData;
}

export function computeSkillValues(skill) {
    const data = extractSkillData({ data: skill, bonusesEnabled: true }, LEVEL_CAP);
    return {
        min: computeSkill(data, { cond: "all", type: "min", target: { def: data.offDefLevel } }),
        max: computeSkill(data, { cond: "all", type: "max", target: { def: data.offDefLevel } })
    }
}

function IdentitySkillCalc({ identity, uptie = 4, level = LEVEL_CAP, opts }) {
    const skillData = useSkillData("identity", identity.id, uptie);

    const applyCrits = opts.crit === "all" || (opts.crit === "poise" && identity.skillKeywordList?.includes("Poise"))

    const [atkskills] = identity.skillTypes.reduce(([skills, counts], skill) => {
        if (!(skill.id in skillData.skills)) return [skills, counts];

        const tier = skillData.skills[skill.id].tier;

        const finalApplyCrits = applyCrits || (opts.crit === "poise" && (skillData.skills[skill.id].critSkill ?? false));
        const data = extractSkillData(skillData.skills[skill.id], level, [tier, (counts[tier] ?? 0) + 1], finalApplyCrits);

        if (tier in counts) {
            return [
                [...skills, data],
                { ...counts, [tier]: counts[tier] + 1 }
            ]
        } else {
            return [
                [...skills, data],
                { ...counts, [tier]: 1 }
            ]
        }
    }, [[], {}]);

    const defskills = identity.defenseSkillTypes.map(s => {
        if (!(s.id in skillData.skills)) return null;

        const finalApplyCrits = applyCrits || (opts.crit === "poise" && (skillData.skills[s.id].critSkill ?? false));

        return extractSkillData(skillData.skills[s.id], level, ["Defense"], finalApplyCrits);
    }).filter(x => x);

    const list = [...atkskills, ...defskills];

    if (list.length === 0) return null;

    return <SkillCalc skills={list} opts={opts} />
}

function EgoSkillCalc({ egos, threadspins, level = LEVEL_CAP, opts }) {
    const egosList = useMemo(() => egos.map((ego, i) => [ego, threadspins?.[i] ?? 4, egoRanks[i]]).filter(([ego]) => ego), [egos, threadspins]);
    const skillData = useSkillData("ego", egosList.map(([ego]) => ego.id), egosList.map(([, threadspin]) => threadspin));

    const list = egosList
        .map(([ego, ts, rank]) => {
            const data = skillData[ego.id];
            const skillList = [...data.awakeningSkills, ...data.corrosionSkills];

            const applyCrits = opts.crit === "all" || (opts.crit === "poise" && ego.statuses.includes("Breath"));

            return skillList.map(skill => {
                const finalApplyCrits = applyCrits || (opts.crit === "poise" && (skill.critSkill ?? false));

                return extractSkillData(skill, level, [rank], finalApplyCrits);
            });
        }).flat();

    if (list.length === 0) return null;

    return <SkillCalc skills={list} opts={opts} />
}

export { IdentitySkillCalc, EgoSkillCalc };
