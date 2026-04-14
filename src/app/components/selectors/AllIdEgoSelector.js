"use client";

import { useState } from "react";

import egoStyles from "./EgoSelectors.module.css";
import IconsSelector from "./IconsSelector";
import identityStyles from "./IdentitySelectors.module.css";
import EgoIcon from "../icons/EgoIcon";
import IdentityIcon from "../icons/IdentityIcon";
import { getEgoTooltipProps } from "../tooltips/EgoTooltip";
import { getIdentityTooltipProps } from "../tooltips/IdentityTooltip";

import { egoRankMapping } from "@/app/lib/constants";
import { checkFilterMatch, filterByFilters } from "@/app/lib/filter";

export default function AllIdEgoSelector({ identityIds, egoIds, setIdentityId, setEgoId, identityOptions, egoOptions, includeSelectedFirst = false }) {
    const [mode, setMode] = useState("id");
    const [searchString, setSearchString] = useState("");
    const [filters, setFilters] = useState([]);

    const handleSetMode = mode => {
        setFilters([]);
        setMode(mode);
    }

    const list = useMemo(() => {
        let result = [];

        if (mode === "id") {
            const prefiltered = Object.entries(identityOptions).filter(([id]) => !identityIds.includes(id)).map(([, data]) => data);
            result = filterByFilters("identity", prefiltered, filters, data => searchString.length === 0 || checkFilterMatch(data.name, searchString));
        } else {
            const prefiltered = Object.entries(egoOptions).filter(([id]) => !egoIds.some(list => list.includes(id))).map(([, data]) => data);
            result = filterByFilters("ego", prefiltered, filters, data => searchString.length === 0 || checkFilterMatch(data.name, searchString));
        }

        result = result.sort((a, b) => a.sinnerId === b.sinnerId ? b.id.localeCompare(a.id) : a.sinnerId - b.sinnerId);
        if (mode === "id") {
            if(includeSelectedFirst)
                result = [...identityIds.map(id => [identityOptions[id], true]), ...result.map(x => [x, false])];
            else 
                result = [...result.map(x => [x, false])];

            return result.map(([data, active]) =>
                    <div key={data.id} className={`${identityStyles.identityMenuSelectorItem} ${active ? identityStyles.active : null}`} onClick={() => setIdentityId(data.id, data.sinnerId - 1)}>
                        <div className={identityStyles.identityMenuItemInner} {...getIdentityTooltipProps(data.id)}>
                            <IdentityIcon identity={data} uptie={4} displayName={true} displayRarity={true} />
                        </div>
                    </div>
                )
        } else {
            if(includeSelectedFirst)
                result = [...egoIds.map(id => [egoOptions[id], true]), ...result.map(x => [x, false])];
            else 
                result = [...result.map(x => [x, false])];

            return result.map(([data, active]) =>
                <div key={data.id} className={`${egoStyles.egoMenuSelectorItem} ${active ? egoStyles.active : null}`} onClick={() => setEgoId(data.id, data.sinnerId - 1, egoRankMapping[data.rank])}>
                    <div className={egoStyles.egoMenuItemInner} {...getEgoTooltipProps(data.id)}>
                        <EgoIcon ego={data} type={"awaken"} displayName={true} displayRarity={true} />
                    </div>
                </div>
            )
        }
    }, [mode, identityIds, egoIds, setIdentityId, setEgoId, identityOptions, egoOptions, searchString, filters, includeSelectedFirst]);

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "98%", border: "1px #aaa solid", borderRadius: "1rem", padding: "0.5rem" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", paddingLeft: "1rem" }}>
            <div className={`tab-header ${mode === "id" ? "active" : ""}`} onClick={() => handleSetMode("id")}>Identities</div>
            <div className={`tab-header ${mode === "ego" ? "active" : ""}`} onClick={() => handleSetMode("ego")}>E.G.Os</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.1rem", alignItems: "center" }}>
            <input type="text" placeholder="Search..." value={searchString} onChange={(e) => setSearchString(e.target.value)} />
            {mode === "id" ?
                <IconsSelector type={"row"} categories={["identityTier", "sinner", "status", "affinity", "skillType"]} values={filters} setValues={setFilters} borderless={true} /> :
                <IconsSelector type={"row"} categories={["egoTier", "sinner", "status", "affinity", "atkType"]} values={filters} setValues={setFilters} borderless={true} />
            }
        </div>
        <div style={{ maxHeight: "400px", overflowY: "auto", justifyContent: "center" }}>
            <div 
                className={mode === "id" ? identityStyles.identityMenuSelectorGrid : egoStyles.egoMenuSelectorGrid} 
                style={{ maxWidth: "100%" }}
            >
                {list}
            </div>
        </div>
    </div>
}
