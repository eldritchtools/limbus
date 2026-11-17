import { useEffect, useMemo, useRef } from "react";

import { useData } from "../DataProvider";
import BuildDisplayMenuCard from "./BuildDisplayMenuCard";
import { radialChartColorMapping } from "../charts/radial/colorMapping";
import RadialCategoryChart from "../charts/radial/RadialCategoryChart";
import KeywordIcon from "../icons/KeywordIcon";
import DropdownButton from "../objects/DropdownButton";
import { getGeneralTooltipProps } from "../tooltips/GeneralTooltip";

import { ColoredResistance } from "@/app/lib/colors";
import { affinities, keywords } from "@/app/lib/constants";
import { validateModifier } from "@/app/lib/keywordModifiers";
import useLocalState from "@/app/lib/useLocalState";

function WeaknessTable({ width, height, categories }) {
    const numComp = category => {
        return <div style={{ display: "flex", gap: "0.2rem", alignItems: "end" }}>
            <span style={{ fontSize: "1.25rem", fontWeight: "bold" }}>{category.active}</span>
            <span style={{ fontSize: "0.75rem", fontWeight: " bold", opacity: 0.7 }}>{category.backup}</span>
        </div>
    }

    return <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", width: `${width}px`, height: `${height}px`,
        alignItems: "center", justifyItems: "center", gap: "0.2rem"
    }}>
        <div />
        <ColoredResistance resist={2} />
        <ColoredResistance resist={1} />
        <ColoredResistance resist={0.5} />
        <KeywordIcon id={"slash"} />
        {numComp(categories["s-f"])}
        {numComp(categories["s-n"])}
        {numComp(categories["s-e"])}
        <KeywordIcon id={"pierce"} />
        {numComp(categories["p-f"])}
        {numComp(categories["p-n"])}
        {numComp(categories["p-e"])}
        <KeywordIcon id={"blunt"} />
        {numComp(categories["b-f"])}
        {numComp(categories["b-n"])}
        {numComp(categories["b-e"])}
    </div>
}

export default function Distribution({ build }) {
    const [mode, setMode] = useLocalState("buildDistributionType", "kw");
    const [auto, setAuto] = useLocalState("buildDistributionAuto", false);
    const [identities, identitiesLoading] = useData("identities");
    const [keywordModifiers, keywordModifiersLoading] = useData("identity_keyword_modifiers");
    const finalMode = useMemo(() => ["kw", "sin", "skill", "weak"].includes(mode) ? mode : "kw", [mode]);
    const modeRef = useRef(finalMode);

    useEffect(() => {
        if (!auto) return;

        const interval = setInterval(() => {
            if (modeRef.current === "kw") {
                setMode("sin");
                modeRef.current = "sin";
            }
            else if (modeRef.current === "sin") {
                setMode("skill");
                modeRef.current = "skill";
            }
            else if (modeRef.current === "skill") {
                setMode("weak");
                modeRef.current = "weak";
            }
            else if (modeRef.current === "weak") {
                setMode("kw");
                modeRef.current = "kw";
            }
        }, 3000);

        return () => clearInterval(interval);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [auto]);

    const [categories, count] = useMemo(() => {
        if (identitiesLoading) return [null, null];
        if (finalMode === "kw" && keywordModifiersLoading) return [null, null];

        const result = finalMode === "kw" ?
            Object.fromEntries(keywords.slice(0, 7).map(x => [x, [0, 0, 0]])) :
            finalMode === "sin" ?
                Object.fromEntries(affinities.map(x => [x, [0, 0, 0]])) :
                finalMode === "skill" ?
                    {
                        "pierce": [0, 0, 0],
                        "blunt": [0, 0, 0],
                        "counter": [0, 0, 0],
                        "evade": [0, 0, 0],
                        "guard": [0, 0, 0],
                        "slash": [0, 0, 0]
                    } :
                    {
                        "s-f": [0, 0, 0],
                        "s-n": [0, 0, 0],
                        "s-e": [0, 0, 0],
                        "p-f": [0, 0, 0],
                        "p-n": [0, 0, 0],
                        "p-e": [0, 0, 0],
                        "b-f": [0, 0, 0],
                        "b-n": [0, 0, 0],
                        "b-e": [0, 0, 0]
                    }

        let count = 0;
        build.identityIds.forEach((id, i) => {
            const identity = identities[id];
            if (!identity) return;
            // count++;

            const deploymentIndex = build.deploymentOrder.findIndex(x => x === i + 1);
            if (deploymentIndex === -1) return;
            count++;

            const deploymentTypeIndex = deploymentIndex === -1 ? 2 : (deploymentIndex < build.activeSinners ? 0 : 1);

            if (finalMode === "kw") {
                identity.skillKeywordList?.forEach(keyword => {
                    result[keyword][deploymentTypeIndex] += 1;
                });
                if (id in keywordModifiers) {
                    keywordModifiers[id].forEach(mod => {
                        if (validateModifier(mod, { egoIds: build.egoIds[i] })) {
                            result[mod.keyword][deploymentTypeIndex] += 1
                        }
                    });
                }
            } else if (finalMode === "sin") {
                identity.skillTypes.forEach(skill => {
                    if (!skill.num) return;
                    if (build.identityUpties?.[i] && build.identityUpties[i] < 3 && skill.type.tier === 3) return;
                    result[skill.type.affinity][deploymentTypeIndex] += skill.num;
                });
            } else if (finalMode === "skill") {
                identity.skillTypes.forEach(skill => {
                    if (!skill.num) return;
                    if (build.identityUpties?.[i] && build.identityUpties[i] < 3 && skill.type.tier === 3) return;
                    result[skill.type.type][deploymentTypeIndex] += skill.num;
                });

                result[identity.defenseSkillTypes[0].type.type][deploymentTypeIndex] += 6;
            } else if (finalMode === "weak") {
                Object.entries(identity.resists).forEach(([t, v]) => {
                    const sf = v > 1 ? "f" : v < 1 ? "e" : "n"
                    result[`${t[0]}-${sf}`][deploymentTypeIndex] += 1;
                })
            }
        })

        let categories;
        if (finalMode === "kw") {
            categories = Object.entries(result).map(([kw, values]) => ({
                id: kw,
                color: radialChartColorMapping[kw],
                active: values[0],
                backup: values[1],
                inactive: values[2]
            }));
        } else if (finalMode === "sin") {
            categories = Object.entries(result).map(([sin, values]) => ({
                id: sin,
                color: radialChartColorMapping[sin],
                active: values[0],
                backup: values[1],
                inactive: values[2]
            }));
        } else if (finalMode === "skill") {
            categories = Object.entries(result).map(([type, values]) => ({
                id: type,
                color: radialChartColorMapping[type],
                active: values[0],
                backup: values[1],
                inactive: values[2]
            }));
        } else if (finalMode === "weak") {
            categories = Object.fromEntries(Object.entries(result).map(([key, values]) => ([key, {
                active: values[0],
                backup: values[1],
                inactive: values[2]
            }])));
        }

        return [categories, count];
    }, [
        finalMode, identities, identitiesLoading,
        keywordModifiers, keywordModifiersLoading,
        build
    ]);

    if (identitiesLoading) return null;

    return <BuildDisplayMenuCard width={"210px"} height={"255px"}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: ".2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.1rem" }}>
                <span className="hover-text" {...getGeneralTooltipProps("Bright sections are for active sinners, while dark sections are for backup sinners.\nFor Keywords, the yellow ring represents 5 identities.\nHovering over a section will show the exact numbers.\nAuto will automatically cycle through the different stats.")}>Team Stats:</span>
                <DropdownButton
                    value={mode ?? "kw"}
                    setValue={x => setMode(x)}
                    options={{
                        "kw": "Keywords",
                        "sin": "Sins",
                        "skill": "Skill Types",
                        "weak": "Weakness"
                    }}
                    styleOverride={{ fontSize: "0.8rem", padding: "0.25rem" }}
                />
                <button
                    className={`toggle-button ${auto ? "active" : null}`}
                    style={{ fontSize: "0.8rem", padding: "0.25rem" }}
                    onClick={() => setAuto(p => !p)}
                >
                    Auto
                </button>
            </div>
            {categories &&
                (finalMode === "kw" ?
                    <RadialCategoryChart
                        width={200} height={200} max={count}
                        gap={0} threshold={5} categories={categories}
                    /> :
                    finalMode === "sin" ?
                        <RadialCategoryChart
                            width={200} height={200} gap={0}
                            categories={categories}
                        /> :
                        finalMode === "skill" ?
                            <RadialCategoryChart
                                width={200} height={200} gap={0}
                                categories={categories}
                            /> :
                            finalMode === "weak" ?
                                <WeaknessTable
                                    width={190} height={190}
                                    categories={categories}
                                />
                                : null
                )
            }
        </div>
    </BuildDisplayMenuCard>;
}
