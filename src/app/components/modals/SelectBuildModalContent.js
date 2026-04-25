"use client";

import { useEffect, useState } from "react";

import BuildsSearchDisplay from "../contentCardDisplays/BuildsSearchDisplay";
import BuildsSearchComponent, { prepareBuildFilters } from "../search/BuildsSearchComponent";

import { useAuth } from "@/app/database/authProvider";
import { searchBuilds } from "@/app/database/builds";
import { uiStrings } from "@/app/lib/uiStrings";

export default function SelectBuildModalContent({ onSelectBuild, allowDrafts = false }) {
    const { user } = useAuth();
    const [filters, setFilters] = useState({});
    const [builds, setBuilds] = useState([]);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const [searchMode, setSearchMode] = useState("search");

    useEffect(() => {
        const fetchBuilds = async () => {
            try {
                setLoading(true);

                if (searchMode === "search") {
                    const params = prepareBuildFilters(filters, { includeEgos: true, published: true, ignoreBlockDiscovery: true });
                    const data = await searchBuilds(params, page);

                    setBuilds(data || []);
                } else if (searchMode === "user") {
                    if (user) {
                        const params = { userId: user.id, includeEgos: true, ignoreBlockDiscovery: true, published: true, sortBy: "new" };
                        const data = await searchBuilds(params, page);
                        setBuilds(data || []);
                    } else {
                        setBuilds([]);
                    }
                } else if (searchMode === "draft") {
                    if (user) {
                        const params = { userId: user.id, includeEgos: true, ignoreBlockDiscovery: true, published: false, sortBy: "new" };
                        const data = await searchBuilds(params, page);
                        setBuilds(data || []);
                    } else {
                        setBuilds([]);
                    }
                }
                setLoading(false);
            } catch (err) {
                console.error("Error loading builds:", err);
            }
        };

        fetchBuilds();

    }, [filters, page, setBuilds, searchMode, user]);

    return <div style={{ display: "flex", flexDirection: "column", gap: "1rem", padding: "1rem", maxHeight: "min(1200px, 90vh)", overflowY: "auto", width: "980px", maxWidth: "80vw" }}>
        <div style={{ display: "flex", flexDirection: "row", gap: "1rem", alignSelf: "center", marginTop: "0.5rem", marginBottom: "0.5rem" }}>
            <div className={`tab-header ${searchMode === "search" ? "active" : ""}`} onClick={() => setSearchMode("search")}>Search Builds</div>
            {user ?
                <div className={`tab-header ${searchMode === "user" ? "active" : ""}`} onClick={() => setSearchMode("user")}>My Published Builds</div> :
                null
            }
            {allowDrafts ?
                <div className={`tab-header ${searchMode === "draft" ? "active" : ""}`} onClick={() => setSearchMode("draft")}>My Drafts</div> :
                null
            }
        </div>
        {searchMode === "search" ?
            <BuildsSearchComponent searchFunc={setFilters} /> :
            (!user ?
                <span>{uiStrings.noLocalContent("builds")}</span> :
                null
            )
        }
        <span style={{ textAlign: "center" }}>Adding the same build more than once is not supported.</span>
        <div style={{ border: "1px #777 solid" }} />

        {loading ?
            <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>Loading builds...</p> :
            builds.length === 0 ?
                <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>
                    {page === 1 ? uiStrings.noPublishedContent("builds") : uiStrings.noMoreContent("builds")}
                </p> :
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    <BuildsSearchDisplay builds={builds} complete={false} clickOverride={onSelectBuild} sizeOverride={"S"} />

                    <div style={{ display: "flex", gap: "0.5rem", alignSelf: "end" }}>
                        <button className="page-button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                        <button className="page-button" disabled={builds.length < 24} onClick={() => setPage(p => p + 1)}>Next</button>
                    </div>
                </div>
        }
    </div>
}
