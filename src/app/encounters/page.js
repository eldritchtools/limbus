"use client";

import { useEffect, useMemo, useState } from "react";
import Select from "react-select";

import EncounterDetails from "./EncounterDetails";
import BuildsSearchDisplay from "../components/contentCardDisplays/BuildsSearchDisplay";
import { useData } from "../components/DataProvider";
import Tag from "../components/objects/Tag";
import CommentSection from "../components/pageTemplates/CommentSection";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import { prepareBuildFilters } from "../components/search/BuildsSearchComponent";
import { searchBuilds } from "../database/builds";
import { checkFilterMatch } from "../lib/filter";
import { uiStrings } from "../lib/uiStrings";
import { selectStyle } from "../styles/selectStyle";

function BuildsSection({ tag }) {
    const [builds, setBuilds] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBuilds = async () => {
            try {
                setLoading(true);
                const params = prepareBuildFilters({ tags: [tag] }, { published: true, ignoreBlockDiscovery: true });
                const data = await searchBuilds(params, page);

                setBuilds(data || []);
                setLoading(false);
            } catch (err) {
                console.error("Error loading builds:", err);
            }
        };

        fetchBuilds();
    }, [tag, page]);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "0.5rem" }}>
        <span>If you&apos;d like to see your build here, use the tag <Tag tag={tag} type={"build"} />.</span>
        {loading ?
            <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>Loading builds...</p> :
            builds.length === 0 ?
                <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>
                    {page === 1 ? uiStrings.noPublishedContent("builds") : uiStrings.noMoreContent("builds")}
                </p> :
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <BuildsSearchDisplay builds={builds} />

                    <div style={{ display: "flex", gap: "0.5rem", alignSelf: "end" }}>
                        <button className="page-button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                        <button className="page-button" disabled={builds.length > 0} onClick={() => setPage(p => p + 1)}>Next</button>
                    </div>
                </div>}
    </div>
}

function Encounter({ category, categoryName, encounter }) {
    const [encounterData, encounterLoading] = useData(`encounters/${category}/${encounter}`);
    const [tab, setTab] = useState("details");

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setTab("details");
    }, [category, categoryName, encounter])

    if (encounterLoading) return <h3>Loading...</h3>;

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "0.5rem" }}>
        <h3 style={{ margin: 0 }}>{categoryName}: {encounterData.name}</h3>

        <div style={{ display: "flex", marginBottom: "1rem", gap: "1rem" }}>
            <div className={`tab-header ${tab === "details" ? "active" : ""}`} onClick={() => setTab("details")}>Details</div>
            {category === "reflectrial" ? <div className={`tab-header ${tab === "builds" ? "active" : ""}`} onClick={() => setTab("builds")}>Builds</div> : null}
        </div>

        {tab === "details" ?
            <EncounterDetails data={encounterData} /> :
            tab === "builds" ?
                <BuildsSection tag={`${category}-${encounter}`} /> :
                null
        }
        <div style={{ border: "1px #777 solid", width: "100%" }} />

        <div style={{ width: "clamp(300px, 100%, 1200px)", alignSelf: "center" }}>
            <CommentSection targetType={"encounter"} targetId={encounterData.siteId} ownerId={"None"} />
        </div>
    </div>
}

export default function EncountersPage() {
    const [encounters, encountersLoading] = useData("encounters");
    const [category, setCategory] = useState(null);
    const [encounter, setEncounter] = useState(null);

    const categoryOptions = useMemo(() => encountersLoading ? [] : [
        { value: "md", label: "Mirror Dungeon" },
        { value: "reflectrial", label: "Reflectrial" }
    ], [encountersLoading]);

    const encounterOptions = useMemo(() => category ? Object.entries(encounters[category.value]).map(([id, name]) => ({
        value: id,
        label: `${name} (${id})`
    })) : [], [category, encounters]);

    if (encountersLoading) return <LoadingContentPageTemplate />;

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "1rem", alignItems: "center" }}>
        <h2 style={{ margin: 0 }}>Encounters</h2>
        <span style={{ maxWidth: "1000px", textAlign: "center" }}>Check out details for various encounters in the game. This is an early version of this page. More encounters, details, and QoL will gradually be added to this page over time. Feel free to suggest encounters you want to see added or prioritized.</span>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 300px", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Category</span>
                <Select
                    options={categoryOptions}
                    value={category}
                    onChange={v => { setCategory(v); setEncounter(null); }}
                    placeholder={"Choose category..."}
                    filterOption={(candidate, input) => checkFilterMatch(input, candidate.label)}
                    styles={selectStyle}
                />
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Encounter</span>
                <Select
                    options={encounterOptions}
                    value={encounter}
                    onChange={setEncounter}
                    placeholder={"Choose encounter..."}
                    filterOption={(candidate, input) => checkFilterMatch(input, candidate.label)}
                    styles={selectStyle}
                />
            </div>
        </div>
        <div style={{ border: "1px #777 solid", width: "100%" }} />
        {category && encounter ?
            <Encounter category={category.value} categoryName={category.label} encounter={encounter.value} /> :
            null
        }
    </div>;
}
