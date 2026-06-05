"use client";

import { useState } from "react";

import AdvancedOptionsSelector, { AdvancedOptionsLabels, getFilterSortAdvancedOptionsData } from "./AdvancedOptionsSelector";
import egoStyles from "./EgoSelectors.module.css";
import IconsSelector from "./IconsSelector";
import identityStyles from "./IdentitySelectors.module.css";
import { useData } from "../DataProvider";
import EgoIcon from "../icons/EgoIcon";
import IdentityIcon from "../icons/IdentityIcon";
import { getEgoTooltipProps } from "../tooltips/EgoTooltip";
import { getIdentityTooltipProps } from "../tooltips/IdentityTooltip";

import { egoRankMapping } from "@/app/lib/constants";
import { buildSearchStrings, checkFilterMatch, filterByFilters } from "@/app/lib/filter";


export default function AllIdEgoSelector({ identityIds, egoIds, setIdentityId, setEgoId, identityOptions, egoOptions, includeSelectedFirst = false }) {
    const [altNames, altNamesLoading] = useData("alt_names");
    const [mode, setMode] = useState(identityOptions ? "id" : "ego");
    const [searchString, setSearchString] = useState("");
    const [filters, setFilters] = useState([]);
    const [identityAdvOpts, setIdentityAdvOpts] = useState([]);
    const [egoAdvOpts, setEgoAdvOpts] = useState([]);

    const list = useMemo(() => {
        let result = [];
        const sortFunctions = [];

        if (mode === "id") {
            const { strict, addedFilters, filterFunction, sortFunctions: sortFuncs } = getFilterSortAdvancedOptionsData(mode, identityAdvOpts);
            sortFunctions.push(...sortFuncs);

            const prefiltered = Object.entries(identityOptions).filter(([id]) => !identityIds.includes(id)).map(([, data]) => data);
            result = filterByFilters("identity", prefiltered, [...filters, ...addedFilters],
                data => {
                    if (data.upcoming) return false;
                    if (searchString.length !== 0 && !checkFilterMatch(searchString, buildSearchStrings(data, altNamesLoading ? null : altNames))) return false;
                    if (!filterFunction(data)) return false;
                    return true;
                },
                strict
            );
        } else {
            const { strict, addedFilters, filterFunction, sortFunctions: sortFuncs } = getFilterSortAdvancedOptionsData(mode, egoAdvOpts);
            sortFunctions.push(...sortFuncs);

            const prefiltered = Object.entries(egoOptions).filter(([id]) => !egoIds.some(list => list.includes(id))).map(([, data]) => data);
            result = filterByFilters("ego", prefiltered, [...filters, ...addedFilters],
                data => {
                    if (data.upcoming) return false;
                    if (searchString.length !== 0 && !checkFilterMatch(searchString, buildSearchStrings(data, altNamesLoading ? null : altNames))) return false;
                    if (!filterFunction(data)) return false;
                    return true;
                },
                strict
            );
        }

        sortFunctions.push((a, b) => a.sinnerId - b.sinnerId);
        sortFunctions.push((a, b) => b.id.localeCompare(a.id));

        result = result.sort((a, b) => {
            for (let i = 0; i < sortFunctions.length; i++) {
                const res = sortFunctions[i](a, b);
                if (res === 0) continue;
                return res;
            }
            return 0;
        });

        if (mode === "id") {
            if (includeSelectedFirst)
                result = [...identityIds.map(id => [identityOptions[id], true]), ...result.map(x => [x, false])];
            else
                result = [...result.map(x => [x, false])];

            return result.map(([data, active]) =>
                <div key={data.id} className={`${identityStyles.identityMenuSelectorItem} ${active ? identityStyles.active : null}`} onClick={() => setIdentityId(data.id, data.sinnerId - 1)}>
                    <div className={identityStyles.identityMenuItemInner} {...getIdentityTooltipProps(data.id)}>
                        <IdentityIcon identity={data} uptie={4} displayName={true} displayRarity={true} />
                        <AdvancedOptionsLabels mode={mode} advancedOptions={identityAdvOpts} data={data} />
                    </div>
                </div>
            )
        } else {
            if (includeSelectedFirst)
                result = [...egoIds.map(id => [egoOptions[id], true]), ...result.map(x => [x, false])];
            else
                result = [...result.map(x => [x, false])];

            return result.map(([data, active]) =>
                <div key={data.id} className={`${egoStyles.egoMenuSelectorItem} ${active ? egoStyles.active : null}`} onClick={() => setEgoId(data.id, data.sinnerId - 1, egoRankMapping[data.rank])}>
                    <div className={egoStyles.egoMenuItemInner} {...getEgoTooltipProps(data.id)}>
                        <EgoIcon ego={data} type={"awaken"} displayName={true} displayRarity={true} />
                        <AdvancedOptionsLabels mode={mode} advancedOptions={egoAdvOpts} data={data} />
                    </div>
                </div>
            )
        }
    }, [mode, identityIds, egoIds, setIdentityId, setEgoId, identityOptions, egoOptions, searchString, filters, includeSelectedFirst, altNames, altNamesLoading, identityAdvOpts, egoAdvOpts]);

    return <div className="panel-container" style={{ gap: "0.5rem", width: "100%" }}>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center", paddingLeft: "1rem" }}>
            {identityOptions ?
                <div className={`tab-header ${mode === "id" ? "active" : ""}`} onClick={() => setMode("id")}>Identities</div> :
                null
            }
            {egoOptions ?
                <div className={`tab-header ${mode === "ego" ? "active" : ""}`} onClick={() => setMode("ego")}>E.G.Os</div> :
                null
            }
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.1rem", alignItems: "center" }}>
            <input type="text" placeholder="Search..." value={searchString} onChange={(e) => setSearchString(e.target.value)} />
            {mode === "id" ?
                <IconsSelector type={"row"} categories={["identityTier", "sinner", "status", "affinity", "skillType"]} values={filters} setValues={setFilters} borderless={true} /> :
                <IconsSelector type={"row"} categories={["egoTier", "sinner", "status", "affinity", "atkType"]} values={filters} setValues={setFilters} borderless={true} />
            }
        </div>
        <AdvancedOptionsSelector
            mode={mode}
            options={mode === "id" ? identityAdvOpts : egoAdvOpts}
            setOptions={mode === "id" ? setIdentityAdvOpts : setEgoAdvOpts}
        />
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
