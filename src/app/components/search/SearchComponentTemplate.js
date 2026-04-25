"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useEffect, useState } from "react";

import styles from "./SearchComponents.module.css";
import { useData } from "../DataProvider";
import { EgoDropdownSelector } from "../selectors/EgoSelectors";
import IconsSelector from "../selectors/IconsSelector";
import { IdentityDropdownSelector } from "../selectors/IdentitySelectors";
import TagSelector, { tagToTagSelectorOption } from "../selectors/TagSelector";
import { getGeneralTooltipProps } from "../tooltips/GeneralTooltip";

import { useAuth } from "@/app/database/authProvider";
import { getCompany } from "@/app/database/companies";
import { getLocalStore } from "@/app/database/localDB";
import { bitsetFunctions } from "@/app/lib/bitset";
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
    const { isMobile } = useBreakpoint();
    const { user, loading } = useAuth();
    const [identities, identitiesLoading] = useData("identities_mini");

    const applyCompany = async () => {
        if (loading || identitiesLoading) return;

        const handleCompany = company => {
            if (!company) return;
            const newValues = [];
            const masks = company.identities.map(mask => bitsetFunctions.fromString(mask));
            Object.entries(identities).forEach(([id, identity]) => {
                if (value.includes(id) || value.includes(`-${id}`)) return;
                if (bitsetFunctions.hasFlag(masks[identity.sinnerId - 1], Number(id.slice(-2)) - 1)) return;
                newValues.push(`-${id}`);
            });
            setValue([...value, ...newValues]);
        }

        if (user) {
            getCompany(user).then(handleCompany);
        } else {
            getLocalStore("companies").get("main").then(handleCompany);
        }
    }

    return <>
        <div className={styles.searchFilterLabel}>
            <div {...getGeneralTooltipProps("includeExclude")} style={{ borderBottom: "1px #777 dotted" }}>Identities</div>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "0.2rem" }}>
                {loading || identitiesLoading ? null :
                    <div
                        className="toggle-text"
                        onClick={applyCompany}
                        {...getGeneralTooltipProps("Adds exclusion entries for identities you don't have. Only works if \"Company\" under \"My Profile\" is set.")}
                    >
                        Apply Company
                    </div>
                }
                <div
                    className="toggle-text"
                    onClick={() => toggleExcluding()}
                    style={{ color: excluding ? "#f87171" : "#4ade80" }}
                >
                    {excluding ? "Exclude" : "Include"}
                </div>
            </div>
        </div>
        <IdentityDropdownSelector selected={value} setSelected={setValue} isMulti={true} styles={selectStyleVariable} excludeMode={excluding} />
    </>;
}

function EgoFilter({ value, setValue, excluding, toggleExcluding }) {
    const { isMobile } = useBreakpoint();
    const { user, loading } = useAuth();
    const [egos, egosLoading] = useData("egos_mini");

    const applyCompany = async () => {
        if (loading || egosLoading) return;

        const handleCompany = company => {
            if (!company) return;
            const newValues = [];
            const masks = company.egos.map(mask => bitsetFunctions.fromString(mask));
            Object.entries(egos).forEach(([id, ego]) => {
                if (value.includes(id) || value.includes(`-${id}`)) return;
                if (bitsetFunctions.hasFlag(masks[ego.sinnerId - 1], Number(id.slice(-2)) - 1)) return;
                newValues.push(`-${id}`);
            });
            setValue([...value, ...newValues]);
        }

        if (user) {
            getCompany(user).then(handleCompany);
        } else {
            getLocalStore("companies").get("main").then(handleCompany);
        }
    }

    return <>
        <div className={styles.searchFilterLabel}>
            <div {...getGeneralTooltipProps("includeExclude")} style={{ borderBottom: "1px #777 dotted" }}>EGOs</div>
            <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "0.2rem" }}>
                {loading || egosLoading ? null :
                    <div
                        className="toggle-text"
                        onClick={applyCompany}
                        {...getGeneralTooltipProps("Adds exclusion entries for E.G.Os you don't have. Only works if \"Company\" under \"My Profile\" is set.")}
                    >
                        Apply Company
                    </div>
                }
                <div
                    className="toggle-text"
                    onClick={() => toggleExcluding()}
                    style={{ color: excluding ? "#f87171" : "#4ade80" }}
                >
                    {excluding ? "Exclude" : "Include"}
                </div>
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
            if (filterValues[type] === componentsMapping[type].default || (Array.isArray(filterValues[type]) && filterValues[type].length === 0))
                return acc;

            acc[type] = filterValues[type];
            if (componentsMapping[type].transform) acc[type] = componentsMapping[type].transform(acc[type]);
            return acc;
        }, {}));
    }, [filters, setValues, filterValues])

    return <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "0.5rem" }}>
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
