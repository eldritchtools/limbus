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
    const [activeTab, setActiveTab, activeTabInitialized] = useLocalState("collectionsActiveTab", "active");
    const [refreshCounter, setRefreshCounter] = useState(0);
    const searchParams = useSearchParams();

    useEffect(() => {
        const mode = searchParams.get('mode');
        if (["active", "top", "new", "random"].includes(mode)) {
            setActiveTab(mode);
        }
    }, [searchParams, setActiveTab]);

    useEffect(() => {
        if (!activeTab || !activeTabInitialized) return;

        let canceled = false;

        const fetchCollections = async () => {
            try {
                setLoading(true);
                let data;
                if(activeTab === "active") data = await searchCollections({ published: true, sortBy: "active" }, 1)
                else if(activeTab === "top") data = await searchCollections({ published: true, sortBy: "top" }, 1)
                else if(activeTab === "new") data = await searchCollections({ published: true, sortBy: "new" }, 1)
                else if(activeTab === "random") data = await searchCollections({ published: true, sortBy: "random" }, 1)

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

    return <>
        <CollectionsSearchComponent createLink={true} searchFunc={triggerSearch} />
        <HorizontalDivider />
        <div style={{ display: "flex", flexDirection: "row", gap: "1rem", alignSelf: "center", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
            <div className={`tab-header ${activeTab === "active" ? "active" : ""}`} onClick={() => handleTabClick("active")}>Active</div>
            <div className={`tab-header ${activeTab === "top" ? "active" : ""}`} onClick={() => handleTabClick("top")}>Top</div>
            <div className={`tab-header ${activeTab === "new" ? "active" : ""}`} onClick={() => handleTabClick("new")}>New</div>
            <div className={`tab-header ${activeTab === "random" ? "active" : ""}`} onClick={() => handleTabClick("random")}>Random</div>
        </div>
        {loading ?
            <div className="title-text">
                {"Loading collections..."}
            </div> :
            <CollectionsSearchDisplay collections={collections} />
        }
    </>;
}
