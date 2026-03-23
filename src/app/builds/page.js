"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import BuildsDisplay from "../components/contentCardDisplays/BuildsSearchDisplay";
import BuildsSearchComponent from "../components/search/BuildsSearchComponent";
import { getPopularBuilds, searchBuilds } from "../database/builds";
import useLocalState from "../lib/useLocalState";

export default function BuildsPage() {
    const [builds, setBuilds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab, activeTabInitialized] = useLocalState("buildsActiveTab", "popular");
    const [refreshCounter, setRefreshCounter] = useState(0);
    const searchParams = useSearchParams();

    useEffect(() => {
        const mode = searchParams.get('mode');
        if (["popular", "new", "random"].includes(mode)) {
            setActiveTab(mode);
        }
    }, [searchParams, setActiveTab]);

    useEffect(() => {
        console.log(activeTab, activeTabInitialized);
        if (!activeTab || !activeTabInitialized) return;

        let canceled = false;

        const fetchBuilds = async () => {
            try {
                setLoading(true);
                const data = activeTab === "popular" ?
                    await getPopularBuilds() :
                    activeTab === "new" ?
                        await searchBuilds({ published: true, sortBy: "new" }, 1) :
                        await searchBuilds({ published: true, sortBy: "random" }, 1);
                if (!canceled) {
                    setBuilds(data || []);
                }
            } catch (err) {
                if (!canceled) console.error(err);
            } finally {
                if (!canceled) setLoading(false);
            }
        };

        fetchBuilds();
        return () => { canceled = true; };
    }, [activeTab, activeTabInitialized, refreshCounter]);

    const handleTabClick = tab => {
        if (activeTab === tab) setRefreshCounter(p => p + 1);
        else setActiveTab(tab);
    }

    const triggerSearch = filters => {
        const params = new URLSearchParams(filters);
        window.location.href = `/builds/search?${params.toString()}`;
    }

    return <div style={{ display: "flex", flexDirection: "column", textAlign: "center", gap: "0.5rem" }}>
        <BuildsSearchComponent createLink={true} searchFunc={triggerSearch} />
        <div style={{ border: "1px #777 solid" }} />
        <div style={{ display: "flex", flexDirection: "row", gap: "1rem", alignSelf: "center", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
            <div className={`tab-header ${activeTab === "popular" ? "active" : ""}`} onClick={() => handleTabClick("popular")}>Popular</div>
            <div className={`tab-header ${activeTab === "new" ? "active" : ""}`} onClick={() => handleTabClick("new")}>New</div>
            <div className={`tab-header ${activeTab === "random" ? "active" : ""}`} onClick={() => handleTabClick("random")}>Random</div>
        </div>
        {loading ?
            <div style={{ color: "#9ca3af" }}>
                {"Loading builds..."}
            </div> :
            <div style={{ display: "flex", flexDirection: "column" }}>
                {activeTab === "popular" ?
                    <p style={{ color: "#aaa", fontSize: "1rem", textAlign: "center", alignSelf: "center", marginTop: 0, marginBottom: "0.5rem" }}>
                        Most popular builds are recomputed every few hours.
                    </p> :
                    null}
                <BuildsDisplay builds={builds} />
            </div>}
    </div>;
}
