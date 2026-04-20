"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import MdPlansSearchDisplay from "@/app/components/contentCardDisplays/MdPlansSearchDisplay";
import PlansSearchComponent, { prepareMdPlanFilters } from "@/app/components/search/PlansSearchComponent";
import { searchMdPlans } from "@/app/database/mdPlans";
import { uiStrings } from "@/app/lib/uiStrings";

export default function SearchMdPlansPage() {
    const searchParams = useSearchParams();

    const filters = useMemo(() => searchParams.entries().reduce((acc, [f, v]) => {
        if (f === "search") acc[f] = v;
        else if (f === "tags") acc[f] = v.split(",");
        return acc;
    }, {}), [searchParams]);

    const [plans, setPlans] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                setLoading(true);

                const params = prepareMdPlanFilters(filters, { published: true, ignoreBlockDiscovery: true });
                const data = await searchMdPlans(params, page);

                setPlans(data || []);
                setLoading(false);
            } catch (err) {
                console.error("Error loading md plans:", err);
            }
        };

        fetchPlans();
    }, [searchParams, filters, page]);

    const triggerSearch = filters => {
        const params = new URLSearchParams(filters);
        window.location.href = `/md-plans/search?${params.toString()}`;
    }

    return <div style={{ display: "flex", flexDirection: "column", textAlign: "center", gap: "1rem" }}>
        <h2 style={{ margin: 0 }}>MD Plans</h2>
        <PlansSearchComponent initialValues={filters} createLink={true} searchFunc={triggerSearch} />
        <div style={{ border: "1px #777 solid" }} />

        {loading ?
            <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>Loading md plans...</p> :
            plans.length === 0 ?
                <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>
                    {page === 1 ? uiStrings.noPublishedContent("md plans") : uiStrings.noMoreContent("md plans")}
                </p> :
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <MdPlansSearchDisplay plans={plans} />

                    <div style={{ display: "flex", gap: "0.5rem", alignSelf: "end" }}>
                        <button className="page-button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                        <button className="page-button" disabled={plans.length > 0} onClick={() => setPage(p => p + 1)}>Next</button>
                    </div>
                </div>
        }
    </div>;
}

