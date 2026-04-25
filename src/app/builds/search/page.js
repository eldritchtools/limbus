"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import BuildsSearchDisplay from "@/app/components/contentCardDisplays/BuildsSearchDisplay";
import BuildsSearchComponent, { prepareBuildFilters } from "@/app/components/search/BuildsSearchComponent";
import { searchBuilds } from "@/app/database/builds";
import { uiStrings } from "@/app/lib/uiStrings";

export default function SearchBuildsPage() {
    const searchParams = useSearchParams();

    const filters = useMemo(() => searchParams.entries().reduce((acc, [f, v]) => {
        if (f === "search" || f === "sortBy") acc[f] = v;
        else if (["tags", "identities", "egos", "keywords"].includes(f)) acc[f] = v.split(",");
        else if (f === "strictFiltering") acc[f] = v === "true";
        return acc;
    }, {}), [searchParams]);

    const [builds, setBuilds] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBuilds = async () => {
            try {
                setLoading(true);
                const params = prepareBuildFilters(filters, { published: true, ignoreBlockDiscovery: true });
                const data = await searchBuilds(params, page);

                setBuilds(data || []);
                setLoading(false);
            } catch (err) {
                console.error("Error loading builds:", err);
            }
        };

        fetchBuilds();
    }, [filters, page]);

    const triggerSearch = filters => {
        const params = new URLSearchParams(filters);
        window.location.href = `/builds/search?${params.toString()}`;
    }

    return <div style={{ display: "flex", flexDirection: "column", textAlign: "center", gap: "1rem" }}>
        <h2 style={{ margin: 0 }}>Team Builds</h2>
        <BuildsSearchComponent initialValues={filters} createLink={true} searchFunc={triggerSearch} />
        <div style={{ border: "1px #777 solid" }} />

        {loading ?
            <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>Loading builds...</p> :
            builds.length === 0 ?
                <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>
                    {page === 1 ? uiStrings.noPublishedContent("builds") : uiStrings.noMoreContent("builds")}
                </p> :
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <BuildsSearchDisplay builds={builds} />

                    <div style={{ display: "flex", gap: "0.5rem", alignSelf: "end" }}>
                        <button className="page-button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                        <button className="page-button" disabled={builds.length < 24} onClick={() => setPage(p => p + 1)}>Next</button>
                    </div>
                </div>}
    </div>;
}
