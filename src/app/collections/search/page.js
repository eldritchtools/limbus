"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import CollectionsSearchDisplay from "@/app/components/contentCardDisplays/CollectionsSearchDisplay";
import CollectionsSearchComponent, { prepareCollectionFilters } from "@/app/components/search/CollectionsSearchComponent";
import { searchCollections } from "@/app/database/collections";
import { uiStrings } from "@/app/lib/uiStrings";

export default function SearchCollectionsPage() {
    const searchParams = useSearchParams();

    const filters = useMemo(() => searchParams.entries().reduce((acc, [f, v]) => {
        if (f === "search") acc[f] = v;
        else if (f === "tags") acc[f] = v.split(",");
        return acc;
    }, {}), [searchParams]);

    const [collections, setCollections] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                setLoading(true);

                const params = prepareCollectionFilters(filters, { published: true, ignoreBlockDiscovery: true });
                const data = await searchCollections(params, page);

                setCollections(data || []);
                setLoading(false);
            } catch (err) {
                console.error("Error loading collections:", err);
            }
        };

        fetchCollections();
    }, [searchParams, filters, page]);

    const triggerSearch = filters => {
        const params = new URLSearchParams(filters);
        window.location.href = `/collections/search?${params.toString()}`;
    }

    return <div style={{ display: "flex", flexDirection: "column", textAlign: "center", gap: "1rem" }}>
        <h2 style={{ margin: 0 }}>Collections</h2>
        <CollectionsSearchComponent initialValues={filters} createLink={true} searchFunc={triggerSearch} />
        <div style={{ border: "1px #777 solid" }} />

        {loading ?
            <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>Loading collections...</p> :
            collections.length === 0 ?
                <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>
                    {page === 1 ? uiStrings.noPublishedContent("collections") : uiStrings.noMoreContent("collections")}
                </p> :
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <CollectionsSearchDisplay collections={collections} />

                    <div style={{ display: "flex", gap: "0.5rem", alignSelf: "end" }}>
                        <button className="page-button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                        <button className="page-button" disabled={collections.length < 10} onClick={() => setPage(p => p + 1)}>Next</button>
                    </div>
                </div>
        }
    </div>;
}
