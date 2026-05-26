"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Select from "react-select";

import EncounterDetails from "./EncounterDetails";
import BuildsSearchDisplay from "../components/contentCardDisplays/BuildsSearchDisplay";
import { useData } from "../components/DataProvider";
import NoPrefetchLink from "../components/NoPrefetchLink";
import { HorizontalDivider } from "../components/objects/Dividers";
import Tag from "../components/objects/Tag";
import CommentSection from "../components/pageTemplates/CommentSection";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import { prepareBuildFilters } from "../components/search/BuildsSearchComponent";
import { searchBuilds } from "../database/builds";
import { getEncounterCategoryOptions, getEncounterOptions } from "../lib/encounters";
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

    const createBuildLink = useMemo(() => {
        const params = new URLSearchParams({ tag: tag });
        return `/builds/new?${params.toString()}`
    }, [tag]);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "0.5rem" }}>
        <span>
            If you&apos;d like to see your build here, use the tag <Tag tag={tag} type={"build"} /> or <NoPrefetchLink href={createBuildLink} className="text-link">click here</NoPrefetchLink> to go straight to a new build with the tag already in place.
        </span>
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
            {["reflectrial", "story", "luxcavation", "rr"].includes(category) ? <div className={`tab-header ${tab === "builds" ? "active" : ""}`} onClick={() => setTab("builds")}>Builds</div> : null}
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
    const { isMobile } = useBreakpoint();
    const router = useRouter();

    const searchParams = useSearchParams().entries().reduce((acc, [f, v]) => {
        if (f === "category") acc["category"] = v;
        if (f === "encounter") acc["encounter"] = v;
        return acc;
    }, {});

    const categoryOptions = useMemo(() => getEncounterCategoryOptions(), []);

    const selectedCategory = useMemo(
        () => categoryOptions.find(x => x.value === searchParams.category) ?? null,
        [categoryOptions, searchParams.category]
    );

    const encounterOptions = useMemo(() =>
        encountersLoading || !selectedCategory ? [] : getEncounterOptions(encounters, selectedCategory),
        [encountersLoading, encounters, selectedCategory]
    );

    const selectedEncounter = useMemo(
        () => encounterOptions.find(x => x.value === searchParams.encounter) ?? null,
        [encounterOptions, searchParams.encounter]
    );

    const handleSetCategory = cat => {
        const params = new URLSearchParams();
        params.set("category", cat.value);

        router.replace(`/encounters?${params.toString()}`, { scroll: false });
    }

    const handleSetEncounter = enc => {
        if (!selectedCategory || !enc) return;
        const params = new URLSearchParams();
        params.set("category", selectedCategory.value);
        params.set("encounter", enc.value);

        router.replace(`/encounters?${params.toString()}`, { scroll: false });
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
                    value={selectedCategory}
                    onChange={handleSetCategory}
                    placeholder={"Choose category..."}
                    filterOption={(candidate, input) => checkFilterMatch(input, candidate.label)}
                    styles={selectStyle}
                />
                <span style={{ fontWeight: "bold", textAlign: "end" }}>Encounter</span>
                <Select
                    options={encounterOptions}
                    value={selectedEncounter}
                    onChange={handleSetEncounter}
                    placeholder={"Choose encounter..."}
                    filterOption={(candidate, input) => checkFilterMatch(input, [candidate.data.name, candidate.data.altName])}
                    styles={selectStyle}
                />
            </div>
        </div>
        <HorizontalDivider />
        {selectedCategory && selectedEncounter ?
            <Encounter category={selectedCategory.value} categoryName={selectedCategory.label} encounter={selectedEncounter.value} /> :
            null
        }
    </div>;
}
