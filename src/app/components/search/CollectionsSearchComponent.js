"use client";

import { useState } from "react";

import NoPrefetchLink from "../NoPrefetchLink";
import SearchComponentTemplate from "./SearchComponentTemplate";

export default function CollectionsSearchComponent({ initialValues = {}, createLink = false, searchFunc }) {
    const [filters, setFilters] = useState(null);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <SearchComponentTemplate
            initialValues={initialValues}
            setValues={setFilters}
            filters={["search", "tags", "sortBy"]}
        />
        <div style={{ display: "flex", gap: "0.8rem", alignItems: "center", marginTop: "0.2rem" }}>
            <button style={{ fontSize: "1.2rem", cursor: "pointer" }} onClick={() => searchFunc(filters)}>Search Collections</button>
            {createLink ?
                <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
                    <span>or</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                        <NoPrefetchLink className="text-link" href={"/collections/new"}>create a collection</NoPrefetchLink>
                        <NoPrefetchLink className="text-link" href={"/my-posts?tab=collections"}>view my collections</NoPrefetchLink>
                    </div>
                </div> :
                null
            }
        </div>
    </div>
}

export function prepareCollectionFilters(filters, additionalParams = {}) {
    return Object.entries(filters).reduce((acc, [f, v]) => {
        if (f === "search") acc["query"] = v;
        else if (f === "tags" || f === "sortBy" || f === "strictFiltering") acc[f] = v;
        return acc;
    }, additionalParams);
}