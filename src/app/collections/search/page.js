"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import CollectionsSearchDisplay from "@/app/components/contentCardDisplays/CollectionsSearchDisplay";
import CollectionsSearchComponent, { prepareCollectionFilters } from "@/app/components/search/CollectionsSearchComponent";
import { searchCollections } from "@/app/database/collections";
import { uiStrings } from "@/app/lib/uiStrings";

export default function SearchCollectionsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [filters, page] = useMemo(() => searchParams.entries().reduce(([filters, page], [f, v]) => {
        if (f === "search") filters[f] = v;
        else if (f === "tags") filters[f] = v.split(",");
        else if (f === "page") return [filters, Number(v)];
        return [filters, page];
    }, [{}, 1]), [searchParams]);

    const [collections, setCollections] = useState([]);
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
        router.push(`/collections/search?${params.toString()}`);
    }

    const navigatePage = page => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', String(page))

        router.push(`/collections/search?${params.toString()}`);
    }

    return <div style={{ display: "flex", flexDirection: "column", textAlign: "center", gap: "1rem" }}>
        <h2 style={{ margin: 0 }}>Collections</h2>
        <CollectionsSearchComponent key={searchParams.toString()} initialValues={filters} createLink={true} searchFunc={triggerSearch} />
        <div style={{ border: "1px #777 solid" }} />

        {loading ?
            <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>Loading collections...</p> :
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {collections.length === 0 ?
                    <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>
                        {page === 1 ? uiStrings.noPublishedContent("collections") : uiStrings.noMoreContent("collections")}
                    </p> :
                    <CollectionsSearchDisplay collections={collections} />
                }

                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", alignSelf: "end" }}>
                    <button className="page-button" disabled={page === 1} onClick={() => navigatePage(page - 1)}>Prev</button>
                    {page}
                    <button className="page-button" disabled={collections.length < 10} onClick={() => navigatePage(page + 1)}>Next</button>
                </div>
            </div>
        }
    </div>;
}
