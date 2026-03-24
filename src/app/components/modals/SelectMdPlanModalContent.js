import { useBreakpoint } from "@eldritchtools/shared-components";
import { useEffect, useState } from "react";

import MdPlansSearchDisplay from "../contentCardDisplays/MdPlansSearchDisplay";
import PlansSearchComponent, { prepareMdPlanFilters } from "../search/PlansSearchComponent";

import { useAuth } from "@/app/database/authProvider";
import { searchMdPlans } from "@/app/database/mdPlans";
import { uiStrings } from "@/app/lib/uiStrings";

export default function SelectMdPlanModalContent({ onSelectMdPlan, allowDrafts = false }) {
    const { user } = useAuth();
    const [filters, setFilters] = useState({});
    const [plans, setPlans] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchMode, setSearchMode] = useState("search");

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);

                if (searchMode === "search") {
                    const params = prepareMdPlanFilters(filters, { published: true, ignoreBlockDiscovery: true });
                    const data = await searchMdPlans(params, page);

                    setPlans(data || []);
                } else if (searchMode === "user") {
                    if (user) {
                        const params = { userId: user.id, published: true, ignoreBlockDiscovery: true, sortBy: "new" };
                        const data = await searchMdPlans(params, page);
                        setPlans(data || []);
                    }
                } else if (searchMode === "draft") {
                    if (user) {
                        const params = { userId: user.id, published: false, ignoreBlockDiscovery: true, sortBy: "new" };
                        const data = await searchMdPlans(params, page);
                        setPlans(data || []);
                    }
                }
                setLoading(false);
            } catch (err) {
                console.error("Error loading md plans:", err);
            }
        };

        fetchPlans();
    }, [filters, page, setPlans, searchMode, user]);

    return <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem", maxHeight: "min(1200px, 90vh)", overflowY: "auto", width: "980px", maxWidth: "80vw" }}>
        <div style={{ display: "flex", flexDirection: "row", gap: "1rem", alignSelf: "center", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
            <div className={`tab-header ${searchMode === "search" ? "active" : ""}`} onClick={() => setSearchMode("search")}>Search MD Plans</div>
            <div className={`tab-header ${searchMode === "user" ? "active" : ""}`} onClick={() => setSearchMode("user")}>My Published MD Plans</div>
            {allowDrafts ?
                <div className={`tab-header ${searchMode === "draft" ? "active" : ""}`} onClick={() => setSearchMode("draft")}>My Drafts</div> :
                null
            }
        </div>
        {searchMode === "search" ?
            <PlansSearchComponent searchFunc={setFilters} /> :
            (!user ?
                <span>{uiStrings.noLocalContent("md plans")}</span> :
                null
            )
        }
        <span style={{ textAlign: "center" }}>Adding the same md plan more than once is not supported.</span>
        <div style={{ border: "1px #777 solid" }} />

        {loading ?
            <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>Loading md plans...</p> :
            plans.length === 0 ?
                <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>
                    {page === 1 ? uiStrings.noPublishedContent("md plans") : uiStrings.noMoreContent("md plans")}
                </p> :
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <MdPlansSearchDisplay plans={plans} complete={false} clickOverride={onSelectMdPlan} />

                    <div style={{ display: "flex", gap: "0.5rem", alignSelf: "end" }}>
                        <button className="page-button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                        <button className="page-button" disabled={plans.length > 0} onClick={() => setPage(p => p + 1)}>Next</button>
                    </div>
                </div>
        }
    </div>
}
