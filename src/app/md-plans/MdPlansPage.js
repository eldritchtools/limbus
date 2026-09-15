"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import MdPlansSearchDisplay from "../components/contentCardDisplays/MdPlansSearchDisplay";
import { HorizontalDivider } from "../components/objects/Dividers";
import PlansSearchComponent from "../components/search/PlansSearchComponent";
import { searchMdPlans } from "../database/mdPlans";
import useLocalState from "../lib/useLocalState";

export default function MdPlansPage({ activeMdPlans }) {
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab, activeTabInitialized] = useLocalState("mdPlanActiveTab", "active");
    const [refreshCounter, setRefreshCounter] = useState(0);
    const searchParams = useSearchParams();

    useEffect(() => {
        const mode = searchParams.get('mode');
        if (["active", "top", "new", "random"].includes(mode)) {
            setActiveTab(mode);
        }
    }, [searchParams, setActiveTab]);

    useEffect(() => {
        if (!activeTab || !activeTabInitialized || activeTab === "active") return;

        let canceled = false;

        const fetchPlans = async () => {
            try {
                setLoading(true);
                const data = activeTab === "top" ?
                    await searchMdPlans({ published: true, sortBy: "top" }, 1) :
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
        <p style={{ margin: 0 }}>Browse community-created Mirror Dungeon plans. </p>
        <p className="sub-text" style={{ margin: 0, alignSelf: "center", maxWidth: "1280px"}}>
            Browse Mirror Dungeon plans shared by the community, or create and share your own. Explore popular, recent, and random plans, or search for plans that fit a particular run or strategy.
            <br /><br />
            Each plan combines a team setup with a detailed Mirror Dungeon route, including starting buffs, E.G.O Gifts to get, a floor plan, adversities, and so on. The team section provides the Identities, E.G.O, deployment order, and other details needed to use the planned setup. A tracking mode is provided for users to mark Gifts and floors as they progress through a planned run.
            <br /><br />
            Plans can be searched and filtered using the available tags to help you find a run that suits what you&apos;re looking for.
        </p>
        <PlansSearchComponent createLink={true} searchFunc={triggerSearch} />
        <HorizontalDivider />
        <div style={{ display: "flex", flexDirection: "row", gap: "1rem", alignSelf: "center", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
            <div className={`tab-header ${activeTab === "active" ? "active" : ""}`} onClick={() => handleTabClick("active")}>Active</div>
            <div className={`tab-header ${activeTab === "top" ? "active" : ""}`} onClick={() => handleTabClick("top")}>Top</div>
            <div className={`tab-header ${activeTab === "new" ? "active" : ""}`} onClick={() => handleTabClick("new")}>New</div>
            <div className={`tab-header ${activeTab === "random" ? "active" : ""}`} onClick={() => handleTabClick("random")}>Random</div>
        </div>
        {loading ?
            <div className="title-text">
                {"Loading MD plans..."}
            </div> :
            activeTab === "active" ?
                <MdPlansSearchDisplay plans={activeMdPlans} /> :
                <MdPlansSearchDisplay plans={plans} />
        }
    </div>;
}
