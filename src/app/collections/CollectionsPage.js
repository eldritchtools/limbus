"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import CollectionsSearchDisplay from "../components/contentCardDisplays/CollectionsSearchDisplay";
import { HorizontalDivider } from "../components/objects/Dividers";
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
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Collections</h1>
        <p style={{ margin: 0 }}>Browse collections organizing related builds and Mirror Dungeon plans. </p>
        <p className="sub-text" style={{ margin: 0 }}>Some collections accept community submissions, allowing owners to review and curate contributions from other users.</p>
        <CollectionsSearchComponent createLink={true} searchFunc={triggerSearch} />
        <HorizontalDivider />
        <div style={{ display: "flex", flexDirection: "row", gap: "1rem", alignSelf: "center", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
            <div className={`tab-header ${activeTab === "popular" ? "active" : ""}`} onClick={() => handleTabClick("popular")}>Popular</div>
            <div className={`tab-header ${activeTab === "new" ? "active" : ""}`} onClick={() => handleTabClick("new")}>New</div>
            <div className={`tab-header ${activeTab === "random" ? "active" : ""}`} onClick={() => handleTabClick("random")}>Random</div>
        </div>
        {loading ?
            <div className="title-text">
                {"Loading collections..."}
            </div> :
            <CollectionsSearchDisplay collections={collections} />
        }
    </div>;
}
