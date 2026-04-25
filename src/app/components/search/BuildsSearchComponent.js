"use client";

import { useState } from "react";

import NoPrefetchLink from "../NoPrefetchLink";
import SearchComponentTemplate from "./SearchComponentTemplate";

import { keywordToIdMapping } from "@/app/database/keywordIds";

export default function BuildsSearchComponent({ initialValues = {}, createLink = false, searchFunc }) {
    const [filters, setFilters] = useState(null);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <SearchComponentTemplate
            initialValues={initialValues}
            setValues={setFilters}
            filters={["search", "tags", "identities", "egos", "keywords", "sortBy", "strictFiltering"]}
        />
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", marginTop: "0.2rem" }}>
            <button style={{ fontSize: "1.2rem", cursor: "pointer" }} onClick={() => searchFunc(filters)}>Search Builds</button>
            {createLink ?
                <span>or <NoPrefetchLink className="text-link" href={"/builds/new"}>create a build</NoPrefetchLink></span> :
                null
            }
        </div>
    </div>
}

export function prepareBuildFilters(filters, additionalParams = {}) {
    return Object.entries(filters).reduce((acc, [f, v]) => {
        if (f === "search") acc["query"] = v;
        else if (f === "tags" || f === "sortBy" || f === "strictFiltering") acc[f] = v;
        else if (f === "identities" || f === "egos") {
            const [include, exclude] = v.reduce(([i, e], x) => {
                if (x[0] === "-") e.push(parseInt(x.slice(1)));
                else i.push(parseInt(x));
                return [i, e];
            }, [[], []]);
            if (include.length > 0) acc[f] = include;
            if (exclude.length > 0) acc[`${f}Exclude`] = exclude;
        }
        else if (f === "keywords") {
            const [include, exclude] = v.reduce(([i, e], x) => {
                if (x[0] === "-") e.push(keywordToIdMapping[x.slice(1)]);
                else i.push(keywordToIdMapping[x]);
                return [i, e];
            }, [[], []]);
            if (include.length > 0) acc[f] = include;
            if (exclude.length > 0) acc[`${f}Exclude`] = exclude;
        }
        return acc;
    }, additionalParams);
}