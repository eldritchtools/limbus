"use client";

import { useState } from "react";

import egoStyles from "./EgoSelectors.module.css";
import { FactionDropdownSelector } from "./FactionSelectors";
import IconsSelector from "./IconsSelector";
import identityStyles from "./IdentitySelectors.module.css";
import { useData } from "../DataProvider";
import EgoIcon from "../icons/EgoIcon";
import Icon from "../icons/Icon";
import IdentityIcon from "../icons/IdentityIcon";
import KeywordIcon from "../icons/KeywordIcon";
import DropdownButton from "../objects/DropdownButton";
import NumberInput from "../objects/NumberInput";
import { getEgoTooltipProps } from "../tooltips/EgoTooltip";
import { getIdentityTooltipProps } from "../tooltips/IdentityTooltip";

import { ColoredResistance } from "@/app/lib/colors";
import { affinities, egoRankMapping, LEVEL_CAP } from "@/app/lib/constants";
import { buildSearchStrings, checkFilterMatch, filterByFilters } from "@/app/lib/filter";

const advancedOptionTypes = {
    "sort": "Sort",
    "filter": "Filter",
    // "passive": "Show Passives"
}

const identityAdvancedOptionTypes = {
    "faction": "Faction Filter"
}

const advancedOptionStyle = {
    display: "flex", gap: "0.1rem", alignItems: "center",
    border: "1px var(--secondary-border-color) solid",
    borderRadius: "0.5rem", padding: "0.2rem 0.2rem"
};

const identityParams = {
    "hp": "Max HP (Max Level)",
    "min-speed": "Min Speed (Max Uptie)",
    "max-speed": "Max Speed (Max Uptie)",
    "staggers": "Stagger Thresholds",
    "def": "Defense Level (Max Level)",
    "slash": "Slash Resist",
    "pierce": "Pierce Resist",
    "blunt": "Blunt Resist"
}

const egoParams = {
    "cost": "Sin Cost",
    "resist": "Sin Resist"
}

const conds = {
    "lt": "<",
    "gt": ">",
    "le": "≤",
    "ge": "≥",
    "eq": "="
}

const identityExtractParams = {
    "hp": data => Math.round(data.hp.base + LEVEL_CAP * data.hp.level),
    "min-speed": data => data.speedList[data.speedList.length - 1][0],
    "max-speed": data => data.speedList[data.speedList.length - 1][1],
    "staggers": data => data.breakSection.length,
    "def": data => LEVEL_CAP + data.defCorrection,
    "slash": data => data.resists.slash,
    "pierce": data => data.resists.pierce,
    "blunt": data => data.resists.blunt,
}

const labelStyle = { display: "flex", alignItems: "center", gap: "0.2rem" };

const identityParamLabels = {
    "hp": (key, data) => <div key={key} style={labelStyle}>
        <Icon path={"hp"} style={{ width: "32px", height: "32px" }} />
        <span>{identityExtractParams["hp"](data)}</span>
    </div>,
    "min-speed": (key, data) => <div key={key} style={labelStyle}>
        min <Icon path={"speed"} style={{ width: "32px", height: "32px" }} />
        <span>{identityExtractParams["min-speed"](data)}</span>
    </div>,
    "max-speed": (key, data) => <div key={key} style={labelStyle}>
        max <Icon path={"speed"} style={{ width: "32px", height: "32px" }} />
        <span>{identityExtractParams["max-speed"](data)}</span>
    </div>,
    "staggers": (key, data) => <div key={key} style={labelStyle}>
        Staggers
        <span>{identityExtractParams["staggers"](data)}</span>
    </div>,
    "def": (key, data) => <div key={key} style={labelStyle}>
        <Icon path={"defense level"} style={{ width: "32px", height: "32px" }} />
        <span>{identityExtractParams["def"](data)}</span>
    </div>,
    "slash": (key, data) => <div key={key} style={labelStyle}>
        <KeywordIcon id={"Slash"} />
        <span><ColoredResistance resist={identityExtractParams["slash"](data)} /></span>
    </div>,
    "pierce": (key, data) => <div key={key} style={labelStyle}>
        <KeywordIcon id={"Pierce"} />
        <span><ColoredResistance resist={identityExtractParams["pierce"](data)} /></span>
    </div>,
    "blunt": (key, data) => <div key={key} style={labelStyle}>
        <KeywordIcon id={"Blunt"} />
        <span><ColoredResistance resist={identityExtractParams["blunt"](data)} /></span>
    </div>,
}

const egoExtractParams = {
    "cost": (data, affinity) => data.cost[affinity] ?? 0,
    "resist": (data, affinity) => data.resists[affinity]
}

const egoParamLabels = {
    "cost": (key, data, affinity) => {
        const value = egoExtractParams["cost"](data, affinity);
        return <div key={key} style={labelStyle}>
            <Icon path={affinity} style={{ width: "32px" }} /> cost
            <span style={value === 0 ? { color: "var(--disabled-text-color)" } : {}}>x{value}</span>
        </div>
    },
    "resist": (key, data, affinity) => <div key={key} style={labelStyle}>
        <Icon path={affinity} style={{ width: "32px" }} /> resist
        <ColoredResistance resist={egoExtractParams["resist"](data, affinity)} />
    </div>
}

const dropdownStyle = {
    border: "1px solid transparent",
    padding: "0",
    fontSize: "0.9rem"
}

function AdvancedOption({ mode, type, param, affinity, order, cond, value, faction, setOptionParam, removeOption }) {
    const typeDropdown = <DropdownButton
        value={type} setValue={x => setOptionParam("type", x)}
        options={{ ...advancedOptionTypes, ...(mode === "id" ? identityAdvancedOptionTypes : {}) }} defaultDisplay={"Choose an option"}
        styleOverride={dropdownStyle}
    />

    const remButton = <button onClick={removeOption} style={dropdownStyle}>✕</button>

    if (type === "sort")
        return <div style={advancedOptionStyle}>
            {typeDropdown}
            <span style={{ fontWeight: "bold" }}>:</span>
            <DropdownButton value={param} setValue={x => setOptionParam("param", x)}
                options={mode === "id" ? identityParams : egoParams} defaultDisplay={"Stat"}
                styleOverride={dropdownStyle}
            />
            {mode === "ego" &&
                <DropdownButton value={affinity} setValue={x => setOptionParam("affinity", x)}
                    options={Object.fromEntries(affinities.map(x => [x, x]))} defaultDisplay={"Affinity"}
                    styleOverride={dropdownStyle}
                />
            }
            <DropdownButton value={order} setValue={x => setOptionParam("order", x)}
                options={{ "asc": "Ascending", "desc": "Descending" }} defaultDisplay={"Order"}
                styleOverride={dropdownStyle}
            />
            {remButton}
        </div>

    if (type === "filter")
        return <div style={advancedOptionStyle}>
            {typeDropdown}
            <span style={{ fontWeight: "bold" }}>:</span>
            <DropdownButton value={param} setValue={x => setOptionParam("param", x)}
                options={mode === "id" ? identityParams : egoParams} defaultDisplay={"Stat"}
                styleOverride={dropdownStyle}
            />
            {mode === "ego" &&
                <DropdownButton value={affinity} setValue={x => setOptionParam("affinity", x)}
                    options={Object.fromEntries(affinities.map(x => [x, x]))} defaultDisplay={"Affinity"}
                    styleOverride={dropdownStyle}
                />
            }
            <DropdownButton value={cond} setValue={x => setOptionParam("cond", x)}
                options={conds} defaultDisplay={"Condition"}
                styleOverride={dropdownStyle}
            />
            <NumberInput 
                value={value ?? 0} onChange={x => setOptionParam("value", x)} allowEmpty={true} 
                style={{ width: "4ch", textAlign: "center", fontSize: "0.9rem", padding: "0" }} 
            />
            {remButton}
        </div>

    if (type === "faction") {
        return <div style={advancedOptionStyle}>
            {typeDropdown}
            <span style={{ fontWeight: "bold" }}>:</span>
            <FactionDropdownSelector selected={faction} setSelected={x => setOptionParam("faction", x)} />
            {remButton}
        </div>
    }

    return <div style={advancedOptionStyle}>
        {typeDropdown}
        {remButton}
    </div>;
}

export default function AllIdEgoSelector({ identityIds, egoIds, setIdentityId, setEgoId, identityOptions, egoOptions, includeSelectedFirst = false }) {
    const [altNames, altNamesLoading] = useData("alt_names");
    const [mode, setMode] = useState(identityOptions ? "id" : "ego");
    const [searchString, setSearchString] = useState("");
    const [filters, setFilters] = useState([]);
    const [identityAdvOpts, setIdentityAdvOpts] = useState([]);
    const [egoAdvOpts, setEgoAdvOpts] = useState([]);

    const list = useMemo(() => {
        let result = [];

        const compare = (v1, v2, cond) => {
            if (cond === "lt") return v1 < v2;
            if (cond === "gt") return v1 > v2;
            if (cond === "le") return v1 <= v2;
            if (cond === "ge") return v1 >= v2;
            if (cond === "eq") return v1 === v2;
            return true;
        }

        const sortFunctions = [];

        if (mode === "id") {
            const prefiltered = Object.entries(identityOptions).filter(([id]) => !identityIds.includes(id)).map(([, data]) => data);
            result = filterByFilters("identity", prefiltered, filters,
                data => {
                    if (data.upcoming) return false;
                    if (searchString.length !== 0 && !checkFilterMatch(searchString, buildSearchStrings(data, altNamesLoading ? null : altNames))) return false;
                    if (!identityAdvOpts.every(opt => {
                        if (opt.type === "filter") {
                            if (opt.param === undefined || opt.cond === undefined) return true;
                            const v = identityExtractParams[opt.param](data);
                            return compare(v, opt.value ?? 0, opt.cond);
                        }
                        if (opt.type === "faction") {
                            if (opt.faction === undefined) return true;
                            return (data.tags || []).includes(opt.faction);
                        }
                        return true;
                    })) return false;
                    return true;
                }
            );

            identityAdvOpts.filter(({ type }) => type === "sort").forEach(({ param, order }) => {
                if (param === undefined || order === undefined) return;
                sortFunctions.push((a, b) => {
                    const va = identityExtractParams[param](a);
                    const vb = identityExtractParams[param](b);
                    if (order === "asc") return va - vb;
                    if (order === "desc") return vb - va;
                    return 0;
                });
            })
        } else {
            const prefiltered = Object.entries(egoOptions).filter(([id]) => !egoIds.some(list => list.includes(id))).map(([, data]) => data);
            result = filterByFilters("ego", prefiltered, filters,
                data => {
                    if (data.upcoming) return false;
                    if (searchString.length !== 0 && !checkFilterMatch(searchString, buildSearchStrings(data, altNamesLoading ? null : altNames))) return false;
                    if (!egoAdvOpts.every(opt => {
                        if (opt.type === "filter") {
                            if (opt.param === undefined || opt.cond === undefined || opt.affinity === undefined) return true;
                            const v = egoExtractParams[opt.param](data, opt.affinity);
                            return compare(v, opt.value ?? 0, opt.cond);
                        }
                        return true;
                    })) return false;
                    return true;
                }
            );

            egoAdvOpts.filter(({ type }) => type === "sort").forEach(({ param, affinity, order }) => {
                if (param === undefined || affinity === undefined || order === undefined) return;
                sortFunctions.push((a, b) => {
                    const va = egoExtractParams[param](a, affinity);
                    const vb = egoExtractParams[param](b, affinity);
                    if (order === "asc") return va - vb;
                    if (order === "desc") return vb - va;
                    return 0;
                });
            })
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
                        {identityAdvOpts
                            .filter(({ type, param }) => ["sort", "filter"].includes(type) && param)
                            .map((opt, i) => identityParamLabels[opt.param](i, data))
                        }
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
                        {egoAdvOpts
                            .filter(({ type, param, affinity }) => ["sort", "filter"].includes(type) && param && affinity)
                            .map((opt, i) => egoParamLabels[opt.param](i, data, opt.affinity))
                        }
                    </div>
                </div>
            )
        }
    }, [mode, identityIds, egoIds, setIdentityId, setEgoId, identityOptions, egoOptions, searchString, filters, includeSelectedFirst, altNames, altNamesLoading, identityAdvOpts, egoAdvOpts]);

    const addAdvancedOption = () => {
        if (mode === "id")
            setIdentityAdvOpts(p => [...p, { type: null }])
        else
            setEgoAdvOpts(p => [...p, { type: null }])
    }

    const setOptionParam = (i, key, value) => {
        if (mode === "id")
            setIdentityAdvOpts(p => p.map((x, ind) => ind === i ? { ...x, [key]: value } : x));
        else
            setEgoAdvOpts(p => p.map((x, ind) => ind === i ? { ...x, [key]: value } : x));
    }

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
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.1rem", alignItems: "center" }}>
            <button onClick={() => addAdvancedOption()}>Add Advanced Option</button>
            {mode === "id" ?
                identityAdvOpts.map((x, i) =>
                    <AdvancedOption key={i} mode={"id"} {...x}
                        setOptionParam={(k, v) => setOptionParam(i, k, v)}
                        removeOption={() => setIdentityAdvOpts(p => p.filter((y, ind) => ind !== i))}
                    />) :
                egoAdvOpts.map((x, i) =>
                    <AdvancedOption key={i} mode={"ego"} {...x}
                        setOptionParam={(k, v) => setOptionParam(i, k, v)}
                        removeOption={() => setEgoAdvOpts(p => p.filter((y, ind) => ind !== i))}
                    />)
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
