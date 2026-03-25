"use client";

import { useEffect, useState } from "react";

import MdPlansSearchDisplay from "../components/contentCardDisplays/MdPlansSearchDisplay";
import PlansSearchComponent from "../components/search/PlansSearchComponent";
import { searchMdPlans } from "../database/mdPlans";
import useLocalState from "../lib/useLocalState";

export default function MdPlansPage() {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab, activeTabInitialized] = useLocalState("mdPlanActiveTab", "popular");
    const [refreshCounter, setRefreshCounter] = useState(0);

    useEffect(() => {
        if (!activeTab || !activeTabInitialized) return;

        let canceled = false;

        const fetchPlans = async () => {
            try {
                setLoading(true);
                const data = activeTab === "popular" ?
                    await searchMdPlans({ published: true, sortBy: "popular" }, 1) :
                    activeTab === "recent" ?
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
        <PlansSearchComponent createLink={true} searchFunc={triggerSearch} />
        <div style={{ border: "1px #777 solid" }} />
        <div style={{ display: "flex", flexDirection: "row", gap: "1rem", alignSelf: "center", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
            <div className={`tab-header ${activeTab === "popular" ? "active" : ""}`} onClick={() => handleTabClick("popular")}>Popular</div>
            <div className={`tab-header ${activeTab === "new" ? "active" : ""}`} onClick={() => handleTabClick("new")}>New</div>
            <div className={`tab-header ${activeTab === "random" ? "active" : ""}`} onClick={() => handleTabClick("random")}>Random</div>
        </div>
        {loading ?
            <div style={{ color: "#9ca3af" }}>
                {"Loading MD plans..."}
            </div> :
            <MdPlansSearchDisplay plans={plans} />
        }
    </div>;
}
