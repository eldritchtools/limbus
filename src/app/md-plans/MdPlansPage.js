"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import MdPlansSearchDisplay from "../components/contentCardDisplays/MdPlansSearchDisplay";
import { HorizontalDivider } from "../components/objects/Dividers";
import PlansSearchComponent from "../components/search/PlansSearchComponent";
import { searchMdPlans } from "../database/mdPlans";
import useLocalState from "../lib/useLocalState";

export default function MdPlansPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab, activeTabInitialized] = useLocalState("mdPlanActiveTab", "popular");
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

        const fetchPlans = async () => {
            try {
                setLoading(true);
                const data = activeTab === "popular" ?
                    await searchMdPlans({ published: true, sortBy: "popular" }, 1) :
                    activeTab === "new" ?
                        await searchMdPlans({ published: true, sortBy: "new" }, 1) :
                        await searchMdPlans({ published: true, sortBy: "random" }, 1)
                if (!canceled) {
                    setPlans(data || []);
                }
            } catch (err) {
                if (!canceled) console.error(err);
            } finally {
                if (!canceled) setLoading(false);
            }
        };

        fetchPlans();
        return () => { canceled = true; };
    }, [activeTab, activeTabInitialized, refreshCounter]);

    const handleTabClick = (tab) => {
        if (activeTab === tab) setRefreshCounter(p => p + 1);
        else setActiveTab(tab);
    }

    const triggerSearch = filters => {
        const params = new URLSearchParams(filters);
        window.location.href = `/md-plans/search?${params.toString()}`;
    }

    return <div style={{ display: "flex", flexDirection: "column", textAlign: "center", gap: "0.5rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>MD Plans</h1>
        <div className="sub-text">Browse community-shared Mirror Dungeon plans.</div>
        <PlansSearchComponent createLink={true} searchFunc={triggerSearch} />
        <HorizontalDivider />
        <div style={{ display: "flex", flexDirection: "row", gap: "1rem", alignSelf: "center", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
            <div className={`tab-header ${activeTab === "popular" ? "active" : ""}`} onClick={() => handleTabClick("popular")}>Popular</div>
            <div className={`tab-header ${activeTab === "new" ? "active" : ""}`} onClick={() => handleTabClick("new")}>New</div>
            <div className={`tab-header ${activeTab === "random" ? "active" : ""}`} onClick={() => handleTabClick("random")}>Random</div>
        </div>
        {loading ?
            <div className="title-text">
                {"Loading MD plans..."}
            </div> :
            <MdPlansSearchDisplay plans={plans} />
        }
    </div>;
}
