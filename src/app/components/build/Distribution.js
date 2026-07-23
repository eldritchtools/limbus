import { useEffect, useMemo, useRef } from "react";

import { useData } from "../DataProvider";
import BuildDisplayMenuCard from "./BuildDisplayMenuCard";
import { radialChartColorMapping } from "../charts/radial/colorMapping";
import RadialCategoryChart from "../charts/radial/RadialCategoryChart";
import DropdownButton from "../objects/DropdownButton";
import { getGeneralTooltipProps } from "../tooltips/GeneralTooltip";

import { affinities, keywords } from "@/app/lib/constants";
import { validateModifier } from "@/app/lib/keywordModifiers";
import useLocalState from "@/app/lib/useLocalState";

export default function Distribution({ identityIds, identityUpties, egoIds, deploymentOrder, activeSinners }) {
    const [mode, setMode] = useLocalState("buildDistributionType", "kw");
    const [auto, setAuto] = useLocalState("buildDistributionAuto", false);
    const [identities, identitiesLoading] = useData("identities");
    const [keywordModifiers, keywordModifiersLoading] = useData("identity_keyword_modifiers");
    const finalMode = useMemo(() => ["kw", "sin", "skill"].includes(mode) ? mode : "kw", [mode]);
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
                {
                    "pierce": [0, 0, 0],
                    "blunt": [0, 0, 0],
                    "counter": [0, 0, 0],
                    "evade": [0, 0, 0],
                    "guard": [0, 0, 0],
                    "slash": [0, 0, 0]
                }

        let count = 0;
        identityIds.forEach((id, i) => {
            const identity = identities[id];
            if (!identity) return;
            // count++;

            const deploymentIndex = deploymentOrder.findIndex(x => x === i + 1);
            if (deploymentIndex === -1) return;
            count++;

            const deploymentTypeIndex = deploymentIndex === -1 ? 2 : (deploymentIndex < activeSinners ? 0 : 1);

            if (finalMode === "kw") {
                identity.skillKeywordList?.forEach(keyword => {
                    result[keyword][deploymentTypeIndex] += 1;
                });
                if (id in keywordModifiers) {
                    keywordModifiers[id].forEach(mod => {
                        if (validateModifier(mod, { egoIds: egoIds[i] })) {
                            result[mod.keyword][deploymentTypeIndex] += 1
                        }
                    });
                }
            } else if (finalMode === "sin") {
                identity.skillTypes.forEach(skill => {
                    if (!skill.num) return;
                    if (identityUpties?.[i] && identityUpties[i] < 3 && skill.type.tier === 3) return;
                    result[skill.type.affinity][deploymentTypeIndex] += skill.num;
                });
            } else if (finalMode === "skill") {
                identity.skillTypes.forEach(skill => {
                    if (!skill.num) return;
                    if (identityUpties?.[i] && identityUpties[i] < 3 && skill.type.tier === 3) return;
                    result[skill.type.type][deploymentTypeIndex] += skill.num;
                });

                result[identity.defenseSkillTypes[0].type.type][deploymentTypeIndex] += 6;
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
        }

        return [categories, count];
    }, [
        finalMode, identities, identitiesLoading,
        keywordModifiers, keywordModifiersLoading,
        identityIds, identityUpties, egoIds, deploymentOrder, activeSinners
    ]);

    if (identitiesLoading) return null;

    return <BuildDisplayMenuCard>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: ".2rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.1rem" }}>
                <span className="hover-text" {...getGeneralTooltipProps("Bright sections are for active sinners, while dark sections are for backup sinners.\nFor Keywords, the yellow ring represents 5 identities.\nHovering over a section will show the exact numbers.\nAuto will automatically cycle through the different stats.")}>Team Stats:</span>
                <DropdownButton
                    value={mode ?? "kw"}
                    setValue={x => setMode(x)}
                    options={{
                        "kw": "Keywords",
                        "sin": "Sins",
                        "skill": "Skill Types"
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
                            null
                )
            }
        </div>
    </BuildDisplayMenuCard>;
}
