"use client";

import { useState } from "react";

import NoPrefetchLink from "../NoPrefetchLink";
import SearchComponentTemplate from "./SearchComponentTemplate";

export default function PlansSearchComponent({ initialValues = {}, createLink = false, searchFunc }) {
    const [filters, setFilters] = useState(null);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <SearchComponentTemplate
            initialValues={initialValues}
            setValues={setFilters}
            filters={["search", "tags", "sortBy"]}
        />
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.2rem" }}>
            <button style={{ fontSize: "1.2rem", cursor: "pointer" }} onClick={() => searchFunc(filters)}>Search MD Plans</button>
            {createLink ?
                <span>or <NoPrefetchLink className="text-link" href={"/md-plans/new"}>create an md plan</NoPrefetchLink></span> :
                null
            }
        </div>
    </div>
}

export function prepareMdPlanFilters(filters, additionalParams = {}) {
    return Object.entries(filters).reduce((acc, [f, v]) => {
        if (f === "search") acc["query"] = v;
        else if (f === "tags" || f === "sortBy" || f === "strictFiltering") acc[f] = v;
        return acc;
    }, additionalParams);
}