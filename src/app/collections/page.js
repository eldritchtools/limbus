"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import CollectionsSearchDisplay from "../components/contentCardDisplays/CollectionsSearchDisplay";
import CollectionsSearchComponent from "../components/search/CollectionsSearchComponent";
import { searchCollections } from "../database/collections";
import useLocalState from "../lib/useLocalState";

export default function CollectionsPage() {
    const [collections, setCollections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab, activeTabInitialized] = useLocalState("collectionsActiveTab", "popular");
    const [refreshCounter, setRefreshCounter] = useState(0);
    const searchParams = useSearchParams();

    useEffect(() => {
        const mode = searchParams.get('mode');
        if (["popular", "new", "random"].includes(mode)) {
            setActiveTab(mode);
        }
    }, [searchParams, setActiveTab]);

    useEffect(() => {
        if (!activeTab || !activeTabInitialized) return;

        let canceled = false;

        const fetchCollections = async () => {
            try {
                setLoading(true);
                const data = activeTab === "popular" ?
                    await searchCollections({ published: true, sortBy: "popular" }, 1) :
                    activeTab === "new" ?
                        await searchCollections({ published: true, sortBy: "new" }, 1) :
                        await searchCollections({ published: true, sortBy: "random" }, 1)
                if (!canceled) {
                    setCollections(data || []);
                }
            } catch (err) {
                if (!canceled) console.error(err);
            } finally {
                if (!canceled) setLoading(false);
            }
        };

        fetchCollections();
        return () => { canceled = true; };
    }, [activeTab, activeTabInitialized, refreshCounter]);

    const handleTabClick = (tab) => {
        if (activeTab === tab) setRefreshCounter(p => p + 1);
        else setActiveTab(tab);
    }

    const triggerSearch = filters => {
        const params = new URLSearchParams(filters);
        window.location.href = `/collections/search?${params.toString()}`;
    }

    return <div style={{ display: "flex", flexDirection: "column", textAlign: "center", gap: "0.5rem" }}>
        <div>
            Collections are lists of builds and md plans managed by users. Some collections may be open to contributions from other users.
        </div>
        <CollectionsSearchComponent createLink={true} searchFunc={triggerSearch} />
        <div style={{ border: "1px #777 solid" }} />
        <div style={{ display: "flex", flexDirection: "row", gap: "1rem", alignSelf: "center", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
            <div className={`tab-header ${activeTab === "popular" ? "active" : ""}`} onClick={() => handleTabClick("popular")}>Popular</div>
            <div className={`tab-header ${activeTab === "new" ? "active" : ""}`} onClick={() => handleTabClick("new")}>New</div>
            <div className={`tab-header ${activeTab === "random" ? "active" : ""}`} onClick={() => handleTabClick("random")}>Random</div>
        </div>
        {loading ?
            <div style={{ color: "#9ca3af" }}>
                {"Loading collections..."}
            </div> :
            <CollectionsSearchDisplay collections={collections} />
        }
    </div>;
}
