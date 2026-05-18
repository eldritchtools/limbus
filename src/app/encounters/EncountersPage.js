"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";

import EncounterDetails from "./EncounterDetails";
import BuildsSearchDisplay from "../components/contentCardDisplays/BuildsSearchDisplay";
import { useData } from "../components/DataProvider";
import { HorizontalDivider } from "../components/objects/Dividers";
import Tag from "../components/objects/Tag";
import CommentSection from "../components/pageTemplates/CommentSection";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import { prepareBuildFilters } from "../components/search/BuildsSearchComponent";
import { searchBuilds } from "../database/builds";
import { encounterToOption, getEncounterCategoryOptions, getEncounterOptions } from "../lib/encounters";
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
            <p style={{ color: "var(--secondary-text-color)", fontweight: "bold", textAlign: "center" }}>Loading builds...</p> :
            builds.length === 0 ?
                <p style={{ color: "var(--secondary-text-color)", fontweight: "bold", textAlign: "center" }}>
                    {page === 1 ? uiStrings.noPublishedContent("builds") : uiStrings.noMoreContent("builds")}
                </p> :
                <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "0.5rem" }}>
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
            {["reflectrial", "story", "luxcavation"].includes(category) ? <div className={`tab-header ${tab === "builds" ? "active" : ""}`} onClick={() => setTab("builds")}>Builds</div> : null}
        </div>

        {tab === "details" ?
            <EncounterDetails data={encounterData} /> :
            tab === "builds" ?
                <BuildsSection tag={`${category}-${encounter}`} /> :
                null
        }
        <HorizontalDivider />

        <div style={{ width: "clamp(300px, 100%, 1200px)", alignSelf: "center" }}>
            <CommentSection targetType={"encounter"} targetId={encounterData.siteId} ownerId={"None"} />
        </div>
    </div>
}

export default function EncountersPage() {
    const [encounters, encountersLoading] = useData("encounters");
    const [category, setCategory] = useState(null);
    const [encounter, setEncounter] = useState(null);
    const {isMobile} = useBreakpoint();
    const router = useRouter();

    const searchParams = useSearchParams().entries().reduce((acc, [f, v]) => {
        if (f === "category") acc["category"] = v;
        if (f === "encounter") acc["encounter"] = v;
        return acc;
    }, {});

    const categoryOptions = useMemo(() => getEncounterCategoryOptions(), []);

    const encounterOptions = useMemo(() => 
        encountersLoading || !category ? [] : getEncounterOptions(encounters, category), 
        [encountersLoading, encounters, category]
    );

    useEffect(() => {
        if (encountersLoading) return;
        const cat = searchParams.category;
        const enc = searchParams.encounter;
        if (cat && cat in encounters && enc && enc in encounters[cat]) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setCategory(categoryOptions.find(x => x.value === cat));
            setEncounter(encounterToOption(enc, encounters[cat][enc]))
        }
    }, [encountersLoading, searchParams, categoryOptions, encounters])

    const handleSetEncounter = enc => {
        if (!category || !enc) return;
        const params = new URLSearchParams();
        params.set("category", category.value);
        params.set("encounter", enc.value);

        router.replace(`/encounters?${params.toString()}`, {scroll: false});
    };

    if (encountersLoading) return <LoadingContentPageTemplate />;

    return <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "1rem", alignItems: "center" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Encounters</h1>
        <span style={{ maxWidth: "1000px", textAlign: "center" }}>Browse encounter details, related team builds, and community comments.</span>
        <div className="sub-text">This is an early version of this page. More encounters, details, and quality-of-life improvements will gradually be added to this page over time. Suggestions for encounters to prioritize are welcome.</div>
        <div style={{ display: "flex", gap: "2rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: `auto ${isMobile ? 200 : 300}px`, alignItems: "center", justifyContent: "center", gap: "0.5rem", textAlign: "center" }}>
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
                    onChange={handleSetEncounter}
                    placeholder={"Choose encounter..."}
                    filterOption={(candidate, input) => checkFilterMatch(input, [candidate.data.name, candidate.data.altName])}
                    styles={selectStyle}
                />
            </div>
        </div>
        <HorizontalDivider />
        {category && encounter ?
            <Encounter category={category.value} categoryName={category.label} encounter={encounter.value} /> :
            null
        }
    </div>;
}
