"use client";

import { useEffect, useState } from "react";

import styles from "./SearchComponents.module.css";
import { EgoDropdownSelector } from "../selectors/EgoSelectors";
import IconsSelector from "../selectors/IconsSelector";
import { IdentityDropdownSelector } from "../selectors/IdentitySelectors";
import TagSelector, { tagToTagSelectorOption } from "../selectors/TagSelector";
import { getGeneralTooltipProps } from "../tooltips/GeneralTooltip";

import { selectStyleVariable } from "@/app/styles/selectStyle";

function SearchFilter({ value, setValue }) {
    return <>
        <span className={styles.searchFilterLabel}>Search</span>
        <div style={{ display: "flex" }}>
            <input
                value={value}
                onChange={e => setValue(e.target.value)}
                style={{ minWidth: "clamp(15rem, 90%, 25rem)", maxWidth: "100%" }}
            />
        </div>
    </>;
}

function TagFilter({ value, setValue }) {
    return <>
        <span className={styles.searchFilterLabel}>Tags</span>
        <TagSelector selected={value} onChange={setValue} creatable={false} styles={selectStyleVariable} />
    </>;
}

function IdentityFilter({ value, setValue, excluding, toggleExcluding }) {
    return <>
        <div className={styles.searchFilterLabel}>
            <div {...getGeneralTooltipProps("includeExclude")} style={{ borderBottom: "1px #777 dotted" }}>Identities</div>
            <div
                className="toggle-text"
                onClick={() => toggleExcluding()}
                style={{ color: excluding ? "#f87171" : "#4ade80" }}
            >
                {excluding ? "Exclude" : "Include"}
            </div>
        </div>
        <IdentityDropdownSelector selected={value} setSelected={setValue} isMulti={true} styles={selectStyleVariable} excludeMode={excluding} />
    </>;
}

function EgoFilter({ value, setValue, excluding, toggleExcluding }) {
    return <>
        <div className={styles.searchFilterLabel}>
            <div {...getGeneralTooltipProps("includeExclude")} style={{ borderBottom: "1px #777 dotted" }}>EGOs</div>
            <div
                className="toggle-text"
                onClick={() => toggleExcluding()}
                style={{ color: excluding ? "#f87171" : "#4ade80" }}
            >
                {excluding ? "Exclude" : "Include"}
            </div>
        </div>
        <EgoDropdownSelector selected={value} setSelected={setValue} isMulti={true} styles={selectStyleVariable} excludeMode={excluding} />
    </>;
}

function KeywordFilter({ value, setValue }) {
    return <>
        <div className={styles.searchFilterLabel}>
            <span {...getGeneralTooltipProps("twiceToExclude")} style={{ borderBottom: "1px #777 dotted" }}>Keywords</span>
        </div>
        <IconsSelector type={"row"} categories={["status", "affinity", "skillType"]} values={value} setValues={setValue} />
    </>;
}

function SortOptions({ value, setValue }) {
    const options = { "score": "Score", "new": "Newest" }
    return <>
        <span className={styles.searchFilterLabel}>Sort By</span>
        <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center" }}>
            {Object.entries(options).map(([v, l]) =>
                <label key={v}>
                    <input type="radio" name="sortBy" value={v} checked={value === v} onChange={e => setValue(e.target.value)} />
                    {l}
                </label>
            )}
        </div>
    </>
}

function StrictFilterToggle({ value, setValue }) {
    return <>
        <div />
        <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center" }}>
            <label>
                <input type="checkbox" checked={value} onChange={e => setValue(e.target.checked)} />
                Strict Filtering (require all selected filters)
            </label>
        </div>
    </>
}

const componentsMapping = {
    "search": { component: SearchFilter, default: "" },
    "tags": { component: TagFilter, default: [], transform: x => x.map(t => t.value), detransform: x => x.map(t => tagToTagSelectorOption(t)) },
    "identities": { component: IdentityFilter, default: [] },
    "egos": { component: EgoFilter, default: [] },
    "keywords": { component: KeywordFilter, default: [] },
    "sortBy": { component: SortOptions, default: "score" },
    "strictFiltering": { component: StrictFilterToggle, default: false }
}

export default function SearchComponentTemplate({ initialValues, setValues, filters }) {
    const [excludeState, setExcludeState] = useState([]);
    const [filterValues, setFilterValues] = useState(filters.reduce((acc, type) => {
        acc[type] = initialValues[type] ?? componentsMapping[type].default
        if (componentsMapping[type].detransform) acc[type] = componentsMapping[type].detransform(acc[type]);
        return acc;
    }, {}));

    useEffect(() => {
        setValues(filters.reduce((acc, type) => {
            acc[type] = filterValues[type];
            if (componentsMapping[type].transform) acc[type] = componentsMapping[type].transform(acc[type]);
            return acc;
        }, {}));
    }, [filters, setValues, filterValues])

    return <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.5rem", maxWidth: "940px" }}>
        {filters.map(type => {
            const Component = componentsMapping[type].component;
            const excluding = excludeState.includes(type);
            return <Component
                key={type} value={filterValues[type]}
                setValue={v => setFilterValues(p => ({ ...p, [type]: v }))}
                excluding={excluding}
                toggleExcluding={excluding ? () => setExcludeState(p => p.filter(x => x !== type)) : () => setExcludeState(p => [...p, type])}
            />;
        })}
    </div>
}
