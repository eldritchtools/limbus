import { useBreakpoint } from "@eldritchtools/shared-components";
import { useMemo } from "react";

import { useData } from "../DataProvider";
import BuildDisplayMenuCard from "./BuildDisplayMenuCard";
import KeywordIcon from "../icons/KeywordIcon";
import DropdownButton from "../objects/DropdownButton";

import { affinities, keywords } from "@/app/lib/constants";
import useLocalState from "@/app/lib/useLocalState";

export default function Distribution({ identityIds, identityUpties, egoIds, deploymentOrder, activeSinners }) {
    const [mode, setMode] = useLocalState("buildDistributionType", "kw-act");
    const [identities, identitiesLoading] = useData("identities");
    const [keywordModifiers, keywordModifiersLoading] = useData("identity_keyword_modifiers");
    const { isMobile } = useBreakpoint();

    const [modeItem, modeType, modeSkill] = useMemo(() => (mode ?? "all-a").split("-"), [mode]);

    const values = useMemo(() => {
        if (identitiesLoading) return {};
        if (modeItem === "kw" && keywordModifiersLoading) return {};

        const result = modeItem === "kw" ?
            Object.fromEntries(keywords.slice(0, 7).map(x => [x, 0])) :
            Object.fromEntries(affinities.map(x => [x, 0]));

        identityIds.forEach((id, i) => {
            const identity = identities[id];
            if (!identity) return;

            if (modeType !== "all") {
                const index = deploymentOrder.findIndex(x => x === i + 1);
                if (index === -1) return;
                if (modeType === "act" && index >= activeSinners) return;
            }

            if (modeItem === "kw") {
                identity.skillKeywordList?.forEach(keyword => {
                    result[keyword] += 1;
                });
                if (id in keywordModifiers) {
                    keywordModifiers[id].forEach(mod => {
                        if(mod.cond.type === "ego") {
                            if(egoIds[i].includes(mod.cond.id)) 
                                result[mod.keyword] += 1
                        }
                    });
                }
            } else if (modeItem === "sin") {
                if (modeSkill === "a") {
                    identity.skillTypes.forEach(skill => {
                        if (!skill.num) return;
                        result[skill.type.affinity] += skill.num;
                    });
                } if (modeSkill === "d") {
                    result[identity.defenseSkillTypes[0].type.affinity] += 1;
                }
            }
        })

        return result;
    }, [
        modeItem, modeType, modeSkill, identities, identitiesLoading,
        keywordModifiers, keywordModifiersLoading, 
        identityIds, egoIds, deploymentOrder, activeSinners
    ]);

    if (identitiesLoading) return null;

    return <BuildDisplayMenuCard>
        <span>Keyword/Sin Distribution:</span>
        <DropdownButton
            value={mode ?? "all-a"}
            setValue={x => setMode(x)}
            options={{
                "kw-all": "Keywords: All",
                "kw-act": "Keywords: Active",
                "kw-dep": "Keywords: Deployed",
                "sin-all-a": "Sins: All",
                "sin-act-a": "Sins: Active",
                "sin-dep-a": "Sins: Deployed",
                "sin-all-d": "Sins: All (defense)",
                "sin-act-d": "Sins: Active (defense)",
                "sin-dep-d": "Sins: Deployed (defense)"
            }}
        />
        <div style={{ display: "flex", flexWrap: "wrap" }}>
            {(modeItem === "kw" ? keywords.slice(0, 7) : affinities).map(key =>
                <div key={key} style={{ display: "grid", gridTemplateRows: "repeat(2, auto)", justifyItems: "center" }}>
                    <KeywordIcon id={key} size={isMobile ? 24 : 32} />
                    <div style={{ fontWeight: "bold", "color": values[key] ? "var(--primary-text-color)" : "var(--secondary-text-color)" }}>
                        {values[key]}
                    </div>
                </div>)}
        </div>
    </BuildDisplayMenuCard>;
}
