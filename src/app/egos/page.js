"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useMemo, useState } from "react";

import EgoComparisonAdvanced from "./EgoComparisonAdvanced";
import EgoComparisonBasic from "./EgoComparisonBasic";
import styles from "./egos.module.css";
import { useData } from "../components/DataProvider";
import EgoIcon from "../components/icons/EgoIcon";
import KeywordIcon from "../components/icons/KeywordIcon";
import RarityIcon from "../components/icons/RarityIcon";
import SinnerIcon from "../components/icons/SinnerIcon";
import NoPrefetchLink from "../components/NoPrefetchLink";
import DropdownButton from "../components/objects/DropdownButton";
import Status from "../components/objects/Status";
import DropdownSelectorWithExclusion from "../components/selectors/DropdownSelectorWithExclusion";
import IconsSelector from "../components/selectors/IconsSelector";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { ColoredResistance } from "../lib/colors";
import { affinities, getSeasonString, sinnerIdMapping } from "../lib/constants";
import { checkFilterMatch, filterByFilters } from "../lib/filter";
import useLocalState from "../lib/useLocalState";
import { selectStyle } from "../styles/selectStyle";

function SkillTypeIcons({ skill }) {
    return <div style={{ display: "flex", flexDirection: "column" }}>
        <KeywordIcon id={skill.affinity} />
        <KeywordIcon id={skill.type} />
    </div>
}

function EgoDetails({ id, ego }) {
    const wrapCell = contents => <td style={{ borderTop: "1px #777 solid", borderBottom: "1px #777 solid", verticalAlign: "middle" }}>
        <NoPrefetchLink key={id} href={`/egos/${id}`} style={{ color: "#ddd", textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "128px" }}>
            {contents}
        </NoPrefetchLink>
    </td>

    return <tr className={styles.clickableTableRow}>
        {wrapCell(<div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0.5rem" }}>
            <RarityIcon rarity={ego.rank.toLowerCase()} style={{ height: "32px" }} />
        </div>)}
        {wrapCell(<div style={{ display: "flex", justifyContent: "center", padding: "0.1rem" }}>
            <EgoIcon ego={ego} type={"awaken"} scale={0.5} />
            {"corrosionType" in ego ? <EgoIcon ego={ego} type={"erosion"} scale={0.5} /> : null}
        </div>)}
        {wrapCell(<div style={{ textAlign: "center", gap: "0.2rem" }}>
            {ego.name}<br />{sinnerIdMapping[ego.sinnerId]}
        </div>)}
        {wrapCell(<SkillTypeIcons skill={ego.awakeningType} />)}
        {wrapCell("corrosionType" in ego ? <SkillTypeIcons skill={ego.corrosionType} /> : null)}
        {wrapCell(<div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(32px, 1fr))", width: "100%" }}>
            {affinities.map(affinity => <div key={affinity} style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "0.25rem" }}>
                <KeywordIcon id={affinity} />
                <span>{affinity in ego.cost ? ego.cost[affinity] : <span style={{ color: "#777" }}>0</span>}</span>
                <span>{<ColoredResistance resist={ego.resists[affinity]} />}</span>
            </div>)}
        </div>)}
        {wrapCell(<div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: "75ch", padding: "0.5rem", gap: "0.5rem", textAlign: "center" }}>
            {ego.statuses.sort().map(keyword => <Status key={keyword} id={keyword} style={{ height: "32px" }} />)}
        </div>)}
    </tr>
}

function EgoCard({ ego }) {
    return <div className={styles.clickableEgoCard} style={{ display: "flex", flexDirection: "row", padding: "0.5rem", width: "min(420px, 100%)", height: "280px", border: "1px #777 solid", borderRadius: "0.25rem", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexDirection: "column", width: "128px" }}>
            <EgoIcon ego={ego} type={"awaken"} displayName={false} displayRarity={true} />
            {"corrosionType" in ego ? <EgoIcon ego={ego} type={"erosion"} displayName={false} displayRarity={false} /> : null}
        </div>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, gap: "0.5rem", alignItems: "center", textAlign: "center" }}>
            <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                <span style={{ flex: 1 }}>{ego.name}</span>
            </div>
            <div style={{ display: "flex", gap: "2rem" }}>
                <SkillTypeIcons skill={ego.awakeningType} />
                {"corrosionType" in ego ? <SkillTypeIcons skill={ego.corrosionType} /> : null}
            </div>
            Cost
            <div style={{ display: "flex", gap: "0.25rem" }}>
                {Object.entries(ego.cost).map(([affinity, cost]) => <div key={affinity} style={{ display: "flex", flexDirection: "column" }}>
                    <KeywordIcon id={affinity} />
                    <span>{cost}</span>
                </div>)}
            </div>
        </div>
    </div>
}

function EgoList({ egos, searchString, filters, displayType, separateSinners, strictFiltering, selectedStatuses, selectedSeasons, compareMode }) {
    const { isMobile } = useBreakpoint();

    const list = useMemo(() => {
        const combinedFilters = [...filters];
        if (selectedStatuses.length > 0) selectedStatuses.forEach(x => combinedFilters.push(["statusFull", x]));
        if (selectedSeasons.length > 0) selectedSeasons.forEach(x => combinedFilters.push(["season", x]));

        return filterByFilters(
            "ego",
            Object.values(egos),
            combinedFilters,
            ego => searchString.length === 0 || checkFilterMatch(searchString, ego.name),
            strictFiltering
        )
            .map(x => [x.id, x])
            .sort(([aid, ao], [bid, bo]) => ao.sinnerId === bo.sinnerId ? bid.localeCompare(aid) : ao.sinnerId - bo.sinnerId)
    },
        [egos, searchString, filters, selectedStatuses, selectedSeasons, strictFiltering]);

    if (compareMode === "basic") {
        return <EgoComparisonBasic />
    }

    if (compareMode === "adv") {
        return <EgoComparisonAdvanced
            egos={list}
            displayType={displayType}
            separateSinners={separateSinners}
        />
    }

    const splitBySinner = list => list.reduce((acc, [id, ego]) => {
        if (ego.sinnerId in acc) acc[ego.sinnerId].push([id, ego]);
        else acc[ego.sinnerId] = [[id, ego]];
        return acc;
    }, {})

    if (displayType === "icon") {
        const listToComponents = list => <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 92 : 128}px, 1fr))`, width: "100%", gap: "0.5rem" }}>
            {list.map(([id, ego]) => <div key={id}><NoPrefetchLink href={`/egos/${id}`} style={{ color: "#ddd", textDecoration: "none" }}>
                <div className={styles.clickableEgo}>
                    <EgoIcon ego={ego} type={"awaken"} displayName={true} displayRarity={true} />
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
            {list.map(([id, ego]) => <div key={id}><NoPrefetchLink href={`/egos/${id}`} style={{ color: "#ddd", textDecoration: "none" }}><EgoCard key={id} ego={ego} /></NoPrefetchLink></div>)}
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
                        <th>Awakening</th>
                        <th>Corrosion</th>
                        <th>Costs/Resists</th>
                        <th>Statuses</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        separateSinners ?
                            Object.entries(splitBySinner(list)).map(([sinnerId, list]) => [
                                <tr key={sinnerId}><td colSpan={7} style={{ borderTop: "1px #777 solid", borderBottom: "1px #777 solid" }}>
                                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", fontSize: "1.2rem", fontWeight: "bold", }}>
                                        <SinnerIcon num={sinnerId} style={{ width: "48px", height: "48px" }} />
                                        {sinnerIdMapping[sinnerId]}
                                    </div>
                                </td></tr>,
                                list.map(([id, ego]) => <EgoDetails key={id} id={id} ego={ego} />)
                            ]).flat() :
                            list.map(([id, ego]) => <EgoDetails key={id} id={id} ego={ego} />)
                    }
                </tbody>
            </table>
        </div>
    } else {
        return null;
    }
}

export default function EgosPage() {
    const [egos, egosLoading] = useData("egos");
    const [statuses, statusesLoading] = useData("statuses");

    const [searchString, setSearchString] = useState("");
    const [filters, setFilters] = useState([]);
    const [displayType, setDisplayType] = useLocalState("idEgoDisplayType", "full");
    const [strictFiltering, setStrictFiltering] = useLocalState("idEgoStrictFiltering", false);
    const [separateSinners, setSeparateSinners] = useLocalState("idEgoSeparateSinners", false);
    const [compareMode, setCompareMode] = useState("off");

    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [statusesExcluding, setStatusesExcluding] = useState(false);
    const [selectedSeasons, setSelectedSeasons] = useState([]);
    const [seasonsExcluding, setSeasonsExcluding] = useState(false);

    const [statusOptions, seasonOptions] = useMemo(() => {
        if (egosLoading || statusesLoading) return [[], []];
        const statusList = new Set();
        const seasonList = new Set();
        seasonList.add(9100);

        Object.entries(egos).forEach(([_id, ego]) => {
            ego.statuses.forEach(status => {
                if (status !== "")
                    statusList.add(status)
            })
            seasonList.add(ego.season);
        })

        return [
            [...statusList].map(id => ({
                value: id,
                label: <Status id={id} includeTooltip={false} />,
                name: statuses[id].name
            })).sort((a, b) => a.name.localeCompare(b.name)),
            [...seasonList].map(season => ({
                value: `${season}`,
                label: season === 9100 ? "Walpurgisnacht (any)" : getSeasonString(season),
                name: season === 9100 ? "Walpurgisnacht" : getSeasonString(season)
            })).sort((a, b) => a.value - b.value)
        ]
    }, [egos, egosLoading, statuses, statusesLoading]);

    return <div style={{ display: "flex", flexDirection: "column", maxHeight: "100%", width: "100%", gap: "1rem", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>E.G.Os</h2>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <span style={{ textAlign: 'end' }}>Search:</span>
                <input value={searchString} onChange={e => setSearchString(e.target.value)} placeholder={"E.G.O Name"} />
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
                <DropdownSelectorWithExclusion
                    options={statusOptions}
                    selected={selectedStatuses}
                    setSelected={setSelectedStatuses}
                    filterFunction={(candidate, input) => checkFilterMatch(input, candidate.data.name)}
                    isMulti={true}
                    placeholder={"Select Statuses..."}
                    excludeMode={statusesExcluding}
                    styles={selectStyle}
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
            <IconsSelector type={"column"} categories={["egoTier", "sinner", "status", "affinity", "atkType"]} values={filters} setValues={setFilters} />
        </div>
        <div style={{ border: "1px #777 solid", width: "100%" }} />
        {egosLoading ? null :
            <EgoList
                egos={egos}
                searchString={searchString}
                filters={filters}
                displayType={displayType}
                separateSinners={separateSinners}
                strictFiltering={strictFiltering}
                selectedStatuses={selectedStatuses}
                selectedSeasons={selectedSeasons}
                compareMode={compareMode}
            />}
    </div>;
}
