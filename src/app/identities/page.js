"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useMemo, useState } from "react";

import styles from "./identities.module.css";
import IdentityComparisonAdvanced from "./IdentityComparisonAdvanced";
import IdentityComparisonBasic from "./IdentityComparisonBasic";
import { useData } from "../components/DataProvider";
import IdentityIcon from "../components/icons/IdentityIcon";
import KeywordIcon from "../components/icons/KeywordIcon";
import RarityIcon from "../components/icons/RarityIcon";
import SinnerIcon from "../components/icons/SinnerIcon";
import NoPrefetchLink from "../components/NoPrefetchLink";
import DropdownButton from "../components/objects/DropdownButton";
import DropdownSelectorWithExclusion from "../components/selectors/DropdownSelectorWithExclusion";
import { FactionDropdownSelector } from "../components/selectors/FactionSelectors";
import IconsSelector from "../components/selectors/IconsSelector";
import { StatusDropdownSelector } from "../components/selectors/StatusSelectors";
import ProcessedText, { processText } from "../components/texts/ProcessedText";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { getSeasonString, sinnerIdMapping } from "../lib/constants";
import { checkFilterMatch, filterByFilters } from "../lib/filter";
import useLocalState from "../lib/useLocalState";
import { selectStyle } from "../styles/selectStyle";

function SkillSpread({ identity, columns = 4 }) {
    return <div style={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: "0.5rem", rowGap: "1rem", width: "100%", placeItems: "center" }}>
        {identity.skillTypes.map(skill => {
            return <div key={skill.id} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.2rem", width: "64px" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <KeywordIcon id={skill.type.affinity} />
                    <KeywordIcon id={skill.type.type} />
                </div>
                <span>x{skill.num}</span>
            </div>
        })}
        {identity.defenseSkillTypes.map(skill => {
            return <div key={skill.id} style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.2rem", width: "64px" }}>
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <KeywordIcon id={skill.type.affinity} />
                    <KeywordIcon id={skill.type.type} />
                </div>
                {skill.type.type === "counter" ? <KeywordIcon id={skill.type.atkType} /> : null}
            </div>
        })}
    </div>
}

function IdentityDetails({ id, identity }) {
    const wrapCell = contents => <td style={{ borderTop: "1px #777 solid", borderBottom: "1px #777 solid", verticalAlign: "middle" }}>
        <NoPrefetchLink key={id} href={`/identities/${id}`} style={{ color: "#ddd", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "128px" }} >
            {contents}
        </NoPrefetchLink>
    </td>

    return <tr className={styles.clickableTableRow}>
        {wrapCell(<div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0.5rem" }}>
            <RarityIcon rarity={identity.rank} style={{ height: "48px" }} />
        </div>)}
        {wrapCell(<div style={{ display: "flex", justifyContent: "center", padding: "0.1rem" }}>
            <IdentityIcon identity={identity} uptie={2} scale={0.5} />
            {identity.tags.includes("Base Identity") ? null : <IdentityIcon identity={identity} uptie={4} scale={0.5} />}
        </div>)}
        {wrapCell(<div style={{ textAlign: "center", gap: "0.2rem" }}>
            {identity.name}<br />{sinnerIdMapping[identity.sinnerId]}
        </div>)}
        {wrapCell(<SkillSpread identity={identity} />)}
        {wrapCell(<div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", padding: "0.5rem" }}>
            {(identity.skillKeywordList || []).map(keyword => <KeywordIcon key={keyword} id={keyword} />)}
        </div>)}
        {wrapCell(<div style={{ display: "flex", flexDirection: "column", textAlign: "center", gap: "0.2rem" }}>
            {identity.tags.map(tag => <div key={tag}>{<ProcessedText text={tag}/>}</div>)}
        </div>)}
    </tr>
}

function IdentityCard({ identity }) {
    return <div className={styles.clickableIdCard} style={{ display: "flex", flexDirection: "row", padding: "0.5rem", width: "min(420px, 100%)", height: "280px", border: "1px #777 solid", borderRadius: "0.25rem", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexDirection: "column", width: "128px" }}>
            <IdentityIcon identity={identity} uptie={2} displayName={false} displayRarity={true} />
            {identity.tags.includes("Base Identity") ? null : <IdentityIcon identity={identity} uptie={4} displayName={false} displayRarity={false} />}
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "0.5rem", alignItems: "center", textAlign: "center" }}>
            {identity.name}
            <SkillSpread identity={identity} columns={3} />
        </div>
    </div>
}

function IdentityList({ identities, searchString, filters, displayType, separateSinners, strictFiltering, selectedStatuses, selectedFactionTags, selectedSeasons, compareMode }) {
    const { isMobile } = useBreakpoint();

    const list = useMemo(() => {
        const combinedFilters = [...filters];
        if (selectedStatuses.length > 0) selectedStatuses.forEach(x => combinedFilters.push(["statusFull", x]));
        if (selectedFactionTags.length > 0) selectedFactionTags.forEach(x => combinedFilters.push(["tag", x]));
        if (selectedSeasons.length > 0) selectedSeasons.forEach(x => combinedFilters.push(["season", x]));

        return filterByFilters(
            "identity",
            Object.values(identities),
            combinedFilters,
            identity => searchString.length === 0 || checkFilterMatch(searchString, identity.name),
            strictFiltering
        )
            .map(x => [x.id, x])
            .sort(([aid, ao], [bid, bo]) => ao.sinnerId === bo.sinnerId ? bid.localeCompare(aid) : ao.sinnerId - bo.sinnerId)
    },
        [identities, searchString, filters, selectedStatuses, selectedFactionTags, selectedSeasons, strictFiltering]);

    if (compareMode === "basic") {
        return <IdentityComparisonBasic />
    }

    if (compareMode === "adv") {
        return <IdentityComparisonAdvanced
            identities={list}
            displayType={displayType}
            separateSinners={separateSinners}
        />
    }

    const splitBySinner = list => list.reduce((acc, [id, identity]) => {
        if (identity.sinnerId in acc) acc[identity.sinnerId].push([id, identity]);
        else acc[identity.sinnerId] = [[id, identity]];
        return acc;
    }, {})

    if (displayType === "icon") {
        const listToComponents = list => <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 92 : 128}px, 1fr))`, width: "100%", gap: "0.5rem" }}>
            {list.map(([id, identity]) => <div key={id}><NoPrefetchLink href={`/identities/${id}`} style={{ color: "#ddd", textDecoration: "none" }} >
                <div className={styles.clickableId}>
                    <IdentityIcon identity={identity} uptie={4} displayName={true} displayRarity={true} />
                </div>
            </NoPrefetchLink></div>)}
        </div>

        if (separateSinners) {
            return <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                {Object.entries(splitBySinner(list)).map(([sinnerId, list]) => [
                    <div key={sinnerId} style={{ display: "flex", flexDirection: "row", alignItems: "center", fontSize: "1.2rem", fontWeight: "bold" }}>
                        <SinnerIcon num={sinnerId} style={{ width: "48px", height: "48px" }} />
                        {sinnerIdMapping[sinnerId]}
                    </div>,
                    <div key={`${sinnerId}-list`}>
                        {listToComponents(list)}
                    </div>
                ]).flat()}
            </div>
        } else {
            return listToComponents(list);
        }
    } else if (displayType === "card") {
        const listToComponents = list => <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, min(420px, 100%))", width: "100%", gap: "0.5rem", justifyContent: "center" }}>
            {list.map(([id, identity]) => <div key={id}><NoPrefetchLink href={`/identities/${id}`} style={{ color: "#ddd", textDecoration: "none" }} ><IdentityCard key={id} identity={identity} /></NoPrefetchLink></div>)}
        </div>

        if (separateSinners) {
            return <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
                {Object.entries(splitBySinner(list)).map(([sinnerId, list]) => [
                    <div key={sinnerId} style={{ display: "flex", flexDirection: "row", alignItems: "center", fontSize: "1.2rem", fontWeight: "bold" }}>
                        <SinnerIcon num={sinnerId} style={{ width: "48px", height: "48px" }} />
                        {sinnerIdMapping[sinnerId]}
                    </div>,
                    <div key={`${sinnerId}-list`}>
                        {listToComponents(list)}
                    </div>
                ]).flat()}
            </div>
        } else {
            return listToComponents(list);
        }
    } else if (displayType === "full") {
        return <div style={{ display: "flex", overflowX: "auto", width: "100%" }}>
            <table style={{ borderCollapse: "collapse", width: "100%" }}>
                <thead>
                    <tr style={{ height: "1.25rem" }}>
                        <th>Rank</th>
                        <th>Icon</th>
                        <th>Name</th>
                        <th>Skills</th>
                        <th>Keywords</th>
                        <th>Factions/Tags</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        separateSinners ?
                            Object.entries(splitBySinner(list)).map(([sinnerId, list]) => [
                                <tr key={sinnerId}><td colSpan={6} style={{ borderTop: "1px #777 solid", borderBottom: "1px #777 solid" }}>
                                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", fontSize: "1.2rem", fontWeight: "bold", }}>
                                        <SinnerIcon num={sinnerId} style={{ width: "48px", height: "48px" }} />
                                        {sinnerIdMapping[sinnerId]}
                                    </div>
                                </td></tr>,
                                list.map(([id, identity]) => <IdentityDetails key={id} id={id} identity={identity} />)
                            ]).flat() :
                            list.map(([id, identity]) => <IdentityDetails key={id} id={id} identity={identity} />)
                    }
                </tbody>
            </table>
        </div>
    } else {
        return null;
    }
}

export default function Identities() {
    const [identities, identitiesLoading] = useData("identities");
    const [statuses, statusesLoading] = useData("statuses");

    const [searchString, setSearchString] = useState("");
    const [filters, setFilters] = useState([]);
    const [displayType, setDisplayType] = useLocalState("idEgoDisplayType", "full");
    const [strictFiltering, setStrictFiltering] = useLocalState("idEgoStrictFiltering", false);
    const [separateSinners, setSeparateSinners] = useLocalState("idEgoSeparateSinners", false);
    const [compareMode, setCompareMode] = useState("off");

    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [statusesExcluding, setStatusesExcluding] = useState(false);
    const [selectedFactionTags, setSelectedFactionTags] = useState([]);
    const [factionTagsExcluding, setFactionTagsExcluding] = useState(false);
    const [selectedSeasons, setSelectedSeasons] = useState([]);
    const [seasonsExcluding, setSeasonsExcluding] = useState(false);

    const [statusOptions, tagOptions, seasonOptions] = useMemo(() => {
        if (identitiesLoading) return [[], [], []];
        const statusList = new Set();
        const tagList = new Set();
        const seasonList = new Set();
        seasonList.add(9100);

        Object.entries(identities).forEach(([_id, identity]) => {
            identity.statuses.forEach(status => statusList.add(status));
            identity.tags.forEach(tag => tagList.add(tag));
            seasonList.add(identity.season);
        });

        return [
            [...statusList],
            [...tagList],
            [...seasonList].map(season => ({
                value: `${season}`,
                label: season === 9100 ? "Walpurgisnacht (any)" : getSeasonString(season),
                name: season === 9100 ? "Walpurgisnacht" : getSeasonString(season)
            })).sort((a, b) => a.value - b.value)
        ]
    }, [identities, identitiesLoading]);

    return <div style={{ display: "flex", flexDirection: "column", maxHeight: "100%", width: "100%", gap: "1rem", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Identities</h2>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <span style={{ textAlign: 'end' }}>Search:</span>
                <input value={searchString} onChange={e => setSearchString(e.target.value)} placeholder="Identity Name" />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "end", textAlign: "end", gap: "0.2rem" }}>
                    <div {...getGeneralTooltipProps("includeExclude")} style={{ borderBottom: "1px #777 dotted" }}>Filter Statuses:</div>
                    <div
                        className="toggle-text"
                        onClick={() => setStatusesExcluding(p => !p)}
                        style={{ color: statusesExcluding ? "#f87171" : "#4ade80" }}
                    >
                        {statusesExcluding ? "Exclude" : "Include"}
                    </div>
                </div>
                <StatusDropdownSelector
                    selected={selectedStatuses}
                    setSelected={setSelectedStatuses}
                    options={statusOptions}
                    isMulti={true}
                    excludeMode={statusesExcluding}
                />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "end", textAlign: "end", gap: "0.2rem" }}>
                    <div {...getGeneralTooltipProps("includeExclude")} style={{ borderBottom: "1px #777 dotted" }}>Filter Factions/Tags:</div>
                    <div
                        className="toggle-text"
                        onClick={() => setFactionTagsExcluding(p => !p)}
                        style={{ color: factionTagsExcluding ? "#f87171" : "#4ade80" }}
                    >
                        {factionTagsExcluding ? "Exclude" : "Include"}
                    </div>
                </div>
                <FactionDropdownSelector
                    selected={selectedFactionTags}
                    setSelected={setSelectedFactionTags}
                    options={tagOptions}
                    isMulti={true}
                    excludeMode={factionTagsExcluding}
                />
                <div style={{ display: "flex", flexDirection: "column", alignItems: "end", textAlign: "end", gap: "0.2rem" }}>
                    <div {...getGeneralTooltipProps("includeExclude")} style={{ borderBottom: "1px #777 dotted" }}>Filter Season:</div>
                    <div
                        className="toggle-text"
                        onClick={() => setSeasonsExcluding(p => !p)}
                        style={{ color: seasonsExcluding ? "#f87171" : "#4ade80" }}
                    >
                        {seasonsExcluding ? "Exclude" : "Include"}
                    </div>
                </div>
                <DropdownSelectorWithExclusion
                    options={seasonOptions}
                    selected={selectedSeasons}
                    setSelected={setSelectedSeasons}
                    filterFunction={(candidate, input) => checkFilterMatch(input, candidate.data.name)}
                    isMulti={true}
                    placeholder={"Select Seasons..."}
                    excludeMode={seasonsExcluding}
                    styles={selectStyle}
                />
                <span style={{ textAlign: "end" }}>Display Type:</span>
                <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                    <label>
                        <input type="radio" name="displayType" value={"icon"} checked={displayType === "icon"} onChange={e => setDisplayType(e.target.value)} disabled={compareMode !== "off"} />
                        Icons Only
                    </label>
                    <label>
                        <input type="radio" name="displayType" value={"card"} checked={displayType === "card"} onChange={e => setDisplayType(e.target.value)} disabled={compareMode === "basic"} />
                        Cards
                    </label>
                    <label>
                        <input type="radio" name="displayType" value={"full"} checked={displayType === "full"} onChange={e => setDisplayType(e.target.value)} disabled={compareMode === "basic"} />
                        Full Details
                    </label>
                </div>
                <div />
                <div>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.2rem", flexWrap: "wrap" }}>
                        <input type="checkbox" checked={strictFiltering} onChange={e => setStrictFiltering(e.target.checked)} />
                        Strict Filtering
                        <span style={{ fontSize: "0.8rem", color: "#aaa" }}>(Require all selected filters)</span>
                    </label>
                </div>
                <div />
                <div>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        <input type="checkbox" checked={separateSinners} onChange={e => setSeparateSinners(e.target.checked)} />
                        Separate by Sinner
                    </label>
                </div>
                <div />
                <div>
                    <DropdownButton value={compareMode} setValue={setCompareMode} options={{ "off": "Compare Mode Disabled", "basic": "Basic Compare Mode", "adv": "Advanced Compare Mode" }} />
                </div>
            </div>
            <IconsSelector type={"column"} categories={["identityTier", "sinner", "status", "affinity", "skillType"]} values={filters} setValues={setFilters} />
        </div>
        <div style={{ border: "1px #777 solid", width: "100%" }} />
        {identitiesLoading ? null :
            <IdentityList
                identities={identities}
                searchString={searchString}
                filters={filters}
                displayType={displayType}
                separateSinners={separateSinners}
                strictFiltering={strictFiltering}
                selectedStatuses={selectedStatuses}
                selectedFactionTags={selectedFactionTags}
                selectedSeasons={selectedSeasons}
                compareMode={compareMode}
            />
        }
    </div>;
}
