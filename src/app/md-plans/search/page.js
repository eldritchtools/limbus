"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import MdPlansSearchDisplay from "@/app/components/contentCardDisplays/MdPlansSearchDisplay";
import PlansSearchComponent, { prepareMdPlanFilters } from "@/app/components/search/PlansSearchComponent";
import { searchMdPlans } from "@/app/database/mdPlans";
import { uiStrings } from "@/app/lib/uiStrings";

export default function SearchMdPlansPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [filters, page] = useMemo(() => searchParams.entries().reduce(([filters, page], [f, v]) => {
        if (f === "search") filters[f] = v;
        else if (f === "tags") filters[f] = v.split(",");
        else if (f === "page") return [filters, Number(v)];
        return [filters, page];
    }, [{}, 1]), [searchParams]);

    const [plans, setPlans] = useState([]);
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
        router.push(`/md-plans/search?${params.toString()}`);
    }

    const navigatePage = page => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', String(page))

        router.push(`/md-plans/search?${params.toString()}`);
    }

    return <div style={{ display: "flex", flexDirection: "column", textAlign: "center", gap: "1rem" }}>
        <h2 style={{ margin: 0 }}>MD Plans</h2>
        <PlansSearchComponent key={searchParams.toString()} initialValues={filters} createLink={true} searchFunc={triggerSearch} />
        <div style={{ border: "1px #777 solid" }} />

        {loading ?
            <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>Loading md plans...</p> :
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {plans.length === 0 ?
                    <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>
                        {page === 1 ? uiStrings.noPublishedContent("md plans") : uiStrings.noMoreContent("md plans")}
                    </p> :
                    <MdPlansSearchDisplay plans={plans} />
                }
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", alignSelf: "end" }}>
                    <button className="page-button" disabled={page === 1} onClick={() => navigatePage(page - 1)}>Prev</button>
                    {page}
                    <button className="page-button" disabled={plans.length < 30} onClick={() => navigatePage(page + 1)}>Next</button>
                </div>
            </div>
        }
    </div>;
}

