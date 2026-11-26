"use client";

import { useMemo, useState } from "react";

import styles from "./Pack.module.css";
import { useData } from "../components/DataProvider";
import EgoIcon from "../components/icons/EgoIcon";
import IdentityIcon from "../components/icons/IdentityIcon";
import KeywordIcon from "../components/icons/KeywordIcon";
import { HorizontalDivider } from "../components/objects/Dividers";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import PageHeader from "../components/pageTemplates/PageHeader";
import { FactionDropdownSelector } from "../components/selectors/FactionSelectors";
import IconsSelector from "../components/selectors/IconsSelector";
import ProcessedText from "../components/texts/ProcessedText";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { buildSearchStrings, checkFilterMatch, filterByFilters } from "../lib/filter";

function IdentityTab({ schemaData }) {
    const [identities, identitiesLoading] = useData("identities_mini");
    const [altNames, altNamesLoading] = useData("alt_names");
    const [searchString, setSearchString] = useState("");
    const [factionTagsExcluding, setFactionTagsExcluding] = useState(false);
    const [selectedFactionTags, setSelectedFactionTags] = useState([]);
    const [filters, setFilters] = useState([]);
    const [costs, setCosts] = useState([0, 1, 2, 3, 4, 5, 6]);
    const [sortBy, setSortBy] = useState("id");

    const tagOptions = useMemo(() => {
        const tags = new Set();
        Object.values(schemaData.ids).forEach(x => x.tags.forEach(tag => tags.add(tag)));
        return [...tags].sort();
    }, [schemaData]);

    const idsFiltered = useMemo(() => {
        if (identitiesLoading || altNamesLoading) return [];
        const combinedFilters = [...filters];
        if (selectedFactionTags.length > 0) selectedFactionTags.forEach(x => combinedFilters.push(["tag", x]));

        const objs = Object.entries(schemaData.ids).map(([id, obj]) =>
            ({ id, ...obj, name: identities[id].name, sinnerId: identities[id].sinnerId })
        );

        return filterByFilters(
            "schema",
            objs,
            combinedFilters,
            obj => {
                if (!costs.includes(obj.cost)) return false;
                return searchString.length === 0 || checkFilterMatch(searchString, buildSearchStrings(obj, altNamesLoading ? null : altNames));
            }
        )
            .sort((a, b) => {
                const idComp = a.sinnerId === b.sinnerId ? a.id.localeCompare(b.id) : a.sinnerId - b.sinnerId;
                if (sortBy === "cost") return a.cost === b.cost ? idComp : a.cost - b.cost;
                if (sortBy === "id") return idComp;
            })

    }, [schemaData, identities, identitiesLoading, altNames, altNamesLoading, searchString, selectedFactionTags, filters, costs, sortBy]);

    return <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <span style={{ textAlign: 'end' }}>Search:</span>
            <input value={searchString} onChange={e => setSearchString(e.target.value)} placeholder="Identity Name" />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "end", textAlign: "end", gap: "0.2rem" }}>
                <div {...getGeneralTooltipProps("includeExclude")} className="hover-text">Filter Factions/Tags:</div>
                <div
                    className={`toggle-text ${factionTagsExcluding ? "red" : "green"}`}
                    onClick={() => setFactionTagsExcluding(p => !p)}
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
            <span style={{ textAlign: "end" }}>Costs:</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "0.2rem" }}>
                    {[0, 1, 2, 3, 4, 5, 6].map(x => <label key={x}>
                        <input type="checkbox" checked={costs.includes(x)} onChange={e => {
                            if (e.target.checked) setCosts(p => [...p, x]);
                            else setCosts(p => p.filter(y => y !== x));
                        }} />
                        <span>{x}</span>
                    </label>)}
                </div>
                <div style={{ display: "flex", gap: "0.2rem" }}>
                    <button onClick={() => setCosts([0, 1, 2, 3, 4, 5, 6])}>All</button>
                    <button onClick={() => setCosts([])}>None</button>
                </div>
            </div>

            <span style={{ textAlign: "end" }}>Sort By:</span>
            <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
                <label>
                    <input type="radio" name="sortBy" value={"id"} checked={sortBy === "id"} onChange={e => setSortBy(e.target.value)} />
                    ID
                </label>
                <label>
                    <input type="radio" name="sortBy" value={"cost"} checked={sortBy === "cost"} onChange={e => setSortBy(e.target.value)} />
                    Cost
                </label>
            </div>

            <div style={{ gridColumn: "span 2" }}>
                <IconsSelector type={"column"} categories={["sinner", "status"]} values={filters} setValues={setFilters} />
            </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", justifyItems: "center", gap: "0.5rem", width: "100%" }}>
            {idsFiltered.map(id => <div key={id.id} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem",
                border: "1px solid var(--primary-border-color)", borderRadius: "0.5rem", padding: "0.5rem", boxSizing: "border-box"
            }}>
                <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Cost: {id.cost}</span>
                <IdentityIcon id={id.id} displayName={true} size={128} />
                <div style={{ display: "flex" }}>
                    {(id.keywords ?? []).map(kw => <KeywordIcon key={kw} id={kw} />)}
                </div>
                {(id.tags || []).map(x => <span key={x}
                    style={{ padding: "0.1rem 0.2rem", margin: "0.1rem 0.25rem", background: "var(--bg-hover)", borderRadius: "0.5rem", textAlign: "center" }}>
                    <ProcessedText text={x} />
                </span>
                )}
            </div>)}
        </div>
    </>
}

function PacksTab({ schemaData }) {
    const [searchString, setSearchString] = useState("");
    const [selectedPackId, setSelectedPackId] = useState(null);
    const selectedPack = schemaData.packs[selectedPackId];

    const packsFiltered = useMemo(() => {
        if (searchString.length > 0)
            return Object.entries(schemaData.packs)
                .filter(([, pack]) => checkFilterMatch(searchString, pack.label))
                .map(([id, pack]) => ({ id, ...pack }));

        return Object.entries(schemaData.packs).map(([id, pack]) => ({ id, ...pack }));
    }, [schemaData, searchString]);

    return <>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
            <span style={{ textAlign: 'end' }}>Search:</span>
            <input value={searchString} onChange={e => setSearchString(e.target.value)} placeholder="Pack Name" />
        </div>

        <span className="sub-text">
            Packs may sometimes generate identities and E.G.O that do not belong to them.
        </span>

        {selectedPackId &&
            <div className="panel-container" style={{ alignItems: "center", gap: "0.5rem", maxWidth: "1600px" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{selectedPack.label}</span>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                    {(selectedPack.ids ?? []).map(id => <div key={id} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <IdentityIcon key={id} id={id} displayName={true} size={92} />
                        <span>Cost: {schemaData.ids[id].cost}</span>
                    </div>)}
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                    {(selectedPack.egos ?? []).map(id => <EgoIcon key={id} id={id} displayName={true} type="awaken" size={92} />)}
                </div>
            </div>
        }

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", justifyItems: "center", gap: "0.5rem", width: "100%" }}>
            {packsFiltered.map(pack => <div key={pack.id} className={styles.pack} onClick={() => setSelectedPackId(pack.id)}>
                <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{pack.label}</span>
            </div>)}
        </div>
    </>
}

export default function SchemaDataPage() {
    const [schemaData, schemaDataLoading] = useData("schema");
    const [tab, setTab] = useState("ids");

    if (schemaDataLoading) return <LoadingContentPageTemplate />;

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "1rem", alignItems: "center" }}>
        <PageHeader
            title={"Schema Data"}
            mainDesc={"Browse information on identities and packs in Schemacraft."}
            subDesc={<>
                Browse costs, keywords, and tags for identities and what identities appear in packs.
            </>}
        >
            <div style={{ display: "flex", marginTop: "0.5rem", marginBottom: "1rem", gap: "1rem", justifyContent: "center" }}>
                <div className={`tab-header ${tab === "ids" ? "active" : ""}`} onClick={() => setTab("ids")}>Identities</div>
                <div className={`tab-header ${tab === "packs" ? "active" : ""}`} onClick={() => setTab("packs")}>Packs</div>
            </div>
        </PageHeader>

        <HorizontalDivider />

        {tab === "ids" && <IdentityTab schemaData={schemaData} />}
        {tab === "packs" && <PacksTab schemaData={schemaData} />}
    </div>;
}
