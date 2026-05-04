"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";

import BuildsSearchDisplay from "../components/contentCardDisplays/BuildsSearchDisplay";
import { useData } from "../components/DataProvider";
import MarkdownRenderer from "../components/markdown/MarkdownRenderer";
import { HorizontalDivider } from "../components/objects/Dividers";
import Tag from "../components/objects/Tag";
import BuildsSearchComponent, { prepareBuildFilters } from "../components/search/BuildsSearchComponent";
import { getPopularBuilds, searchBuilds } from "../database/builds";
import { encounterToOption, getEncounterCategoryOptions, getEncounterOptions } from "../lib/encounters";
import { checkFilterMatch } from "../lib/filter";
import useLocalState from "../lib/useLocalState";
import { selectStyle } from "../styles/selectStyle";

function EncountersSelection({ category, setCategory, encounter, setEncounter, searchParams }) {
    const [encounters, encountersLoading] = useData("encounters");
    const { isMobile } = useBreakpoint();
    const router = useRouter();

    const categoryOptions = useMemo(() => getEncounterCategoryOptions(true), []);

    const encounterOptions = useMemo(() =>
        encountersLoading || !category ? [] : getEncounterOptions(encounters, category),
        [encountersLoading, encounters, category]
    );

    useEffect(() => {
        if (encountersLoading) return;
        const cat = searchParams.get("category");
        const enc = searchParams.get("encounter");

        const catOption = categoryOptions.find(x => x.value === cat);
        if (!catOption || !(enc in encounters[cat])) return;

        setCategory(categoryOptions.find(x => x.value === cat));
        setEncounter(encounterToOption(enc, encounters[cat][enc]));
    }, [searchParams, encounters, encountersLoading, categoryOptions, setCategory, setEncounter]);

    const handleSetEncounter = enc => {
        if (!category || !enc) return;
        const params = new URLSearchParams();
        params.set('mode', "enc");
        params.set("category", category.value);
        params.set("encounter", enc.value);

        router.replace(`/builds?${params.toString()}`, {scroll: false});
    };

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: `auto ${isMobile ? 200 : 300}px`, alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
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
                filterOption={(candidate, input) => checkFilterMatch(input, candidate.data.name)}
                styles={selectStyle}
            />
        </div>

        {category && encounter ?
            <React.Fragment>
                <span className="sub-text" style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", textWrap: "wrap" }}>
                    <MarkdownRenderer content={`Showing builds for the encounter {enc:${category.value}|${encounter.value}}. If you'd like to see your build here, use the corresponding tag.`} />
                    <Tag tag={`${category.value}-${encounter.value}`} type={"build"} />
                </span>
                <span className="sub-text">Clicking on the link will bring you to the encounters page where you can find more details about the encounter or share your experience with it.</span>
            </React.Fragment> :
            null
        }
    </div>
}

export default function BuildsPage() {
    const [builds, setBuilds] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab, activeTabInitialized] = useLocalState("buildsActiveTab", "popular");
    const [encounterCategory, setEncounterCategory] = useState(null);
    const [encounter, setEncounter] = useState(null);
    const [refreshCounter, setRefreshCounter] = useState(0);
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const mode = searchParams.get('mode');
        if (["popular", "new", "random", "enc"].includes(mode)) {
            setActiveTab(mode);
        }
    }, [searchParams, setActiveTab]);

    useEffect(() => {
        if (!activeTab || !activeTabInitialized) return;

        let canceled = false;

        const fetchBuilds = async () => {
            try {
                setLoading(true);
                let data;
                if (activeTab === "popular")
                    data = await getPopularBuilds();
                else if (activeTab === "new")
                    data = await searchBuilds({ published: true, sortBy: "new" }, 1);
                else if (activeTab === "random")
                    data = await searchBuilds({ published: true, sortBy: "random" }, 1);
                else if (activeTab === "enc") {
                    const params = prepareBuildFilters({ tags: [`${encounterCategory.value}-${encounter.value}`] }, { published: true, ignoreBlockDiscovery: true });
                    data = await searchBuilds(params, 1);
                }

                if (!canceled) {
                    setBuilds(data || []);
                }
            } catch (err) {
                if (!canceled) console.error(err);
            } finally {
                if (!canceled) setLoading(false);
            }
        };

        if (activeTab === "enc") {
            if (encounterCategory && encounter) {
                fetchBuilds();
            } else {
                setBuilds([]);
            }
        } else {
            fetchBuilds();
        }

        return () => { canceled = true; };
    }, [activeTab, activeTabInitialized, refreshCounter, encounterCategory, encounter]);

    const handleTabClick = tab => {
        if (activeTab === tab) setRefreshCounter(p => p + 1);
        else setActiveTab(tab);

        const params = new URLSearchParams();
        params.set('mode', String(tab));

        router.push(`/builds?${params.toString()}`);
    }

    const triggerSearch = filters => {
        const params = new URLSearchParams(filters);
        router.push(`/builds/search?${params.toString()}`);
    }

    return <div style={{ display: "flex", flexDirection: "column", textAlign: "center", gap: "0.5rem" }}>
        <h2 style={{ margin: 0 }}>Team Builds</h2>
        <BuildsSearchComponent createLink={true} searchFunc={triggerSearch} />
        <HorizontalDivider />
        <div style={{ display: "flex", flexDirection: "row", gap: "1rem", alignSelf: "center", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
            <div className={`tab-header ${activeTab === "popular" ? "active" : ""}`} onClick={() => handleTabClick("popular")}>Popular</div>
            <div className={`tab-header ${activeTab === "new" ? "active" : ""}`} onClick={() => handleTabClick("new")}>New</div>
            <div className={`tab-header ${activeTab === "random" ? "active" : ""}`} onClick={() => handleTabClick("random")}>Random</div>
            <div className={`tab-header ${activeTab === "enc" ? "active" : ""}`} onClick={() => handleTabClick("enc")}>Encounters</div>
        </div>
        {activeTab === "enc" ?
            <EncountersSelection
                category={encounterCategory} setCategory={setEncounterCategory}
                encounter={encounter} setEncounter={setEncounter}
                searchParams={searchParams}
            /> :
            null
        }
        {loading ?
            <div className="title-text">
                {"Loading builds..."}
            </div> :
            <div style={{ display: "flex", flexDirection: "column" }}>
                {activeTab === "popular" ?
                    <p style={{ color: "var(secondary-text-color)", fontSize: "1rem", textAlign: "center", alignSelf: "center", marginTop: 0, marginBottom: "0.5rem" }}>
                        Most popular builds are recomputed every few hours.
                    </p> :
                    null
                }
                <BuildsSearchDisplay builds={builds} />
            </div>}
    </div>;
}
