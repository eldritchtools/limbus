"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import BuildsSearchDisplay from "@/app/components/contentCardDisplays/BuildsSearchDisplay";
import BuildsSearchComponent, { prepareBuildFilters } from "@/app/components/search/BuildsSearchComponent";
import { searchBuilds } from "@/app/database/builds";
import { uiStrings } from "@/app/lib/uiStrings";

export default function SearchBuildsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [filters, page] = useMemo(() => searchParams.entries().reduce(([filters, page], [f, v]) => {
        if (f === "search" || f === "sortBy") filters[f] = v;
        else if (["tags", "identities", "egos", "keywords"].includes(f)) filters[f] = v.split(",");
        else if (f === "strictFiltering") filters[f] = v === "true";
        else if (f === "page") return [filters, Number(v)];
        return [filters, page];
    }, [{}, 1]), [searchParams]);

    const [builds, setBuilds] = useState([]);
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
        router.push(`/builds/search?${params.toString()}`);
    }

    const navigatePage = page => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', String(page))

        router.push(`/builds/search?${params.toString()}`);
    }

    return <div style={{ display: "flex", flexDirection: "column", textAlign: "center", gap: "1rem" }}>
        <h2 style={{ margin: 0 }}>Team Builds</h2>
        <BuildsSearchComponent key={searchParams.toString()} initialValues={filters} createLink={true} searchFunc={triggerSearch} />
        <div style={{ border: "1px #777 solid" }} />

        {loading ?
            <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>Loading builds...</p> :
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {builds.length === 0 ?
                    <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>
                        {page === 1 ? uiStrings.noPublishedContent("builds") : uiStrings.noMoreContent("builds")}
                    </p> :
                    <BuildsSearchDisplay builds={builds} />
                }

                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", alignSelf: "end" }}>
                    <button className="page-button" disabled={page === 1} onClick={() => navigatePage(page - 1)}>Prev</button>
                    {page}
                    <button className="page-button" disabled={builds.length < 24} onClick={() => navigatePage(page + 1)}>Next</button>
                </div>
            </div>
        }
    </div>;
}
