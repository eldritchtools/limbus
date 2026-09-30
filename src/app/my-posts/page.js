"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import NoPrefetchLink from "../components/NoPrefetchLink";
import { useAuth } from "../database/authProvider";
import { uiColors } from "../lib/colors";
import { contentConfig } from "../lib/contentConfig";
import { uiStrings } from "../lib/uiStrings";
import useLocalState from "../lib/useLocalState";

export default function MyPostsPage() {
    const { user, loading } = useAuth();
    const searchParams = useSearchParams();
    const router = useRouter();

    const [content, setContent] = useState([]);
    const [contentLoading, setContentLoading] = useState(false);
    const [page, setPage] = useState(1);

    const [storedMainTab, setStoredMainTab, mainActiveTabInitialized] = useLocalState("myPostsMainTab", "builds");
    const [storedSubTab, setStoredSubTab, subTabInitialized] = useLocalState("myPostsSubTab", "published");

    const mainActiveTab = searchParams.get("tab") || storedMainTab;
    const activeTab = searchParams.get("subTab") || storedSubTab;

    useEffect(() => {
        if (!mainActiveTabInitialized || !subTabInitialized) return;
        const cfg = contentConfig[mainActiveTab];
        if (!cfg) return;
        const baseParams = { ignoreBlockDiscovery: true, sortBy: "new" };

        const handleContent = async () => {
            setContentLoading(true);
            try {
                let result;

                if (activeTab === "published") {
                    result = user
                        ? await cfg.search({ userId: user.id, published: true, ...baseParams }, page)
                        : [];
                }

                if (activeTab === "drafts") {
                    result = user
                        ? await cfg.search({ userId: user.id, published: false, ...baseParams }, page)
                        : await cfg.local.getAll();
                }

                if (activeTab === "saved") {
                    if (user) {
                        result = await cfg.getSaved(user.id, page);
                    } else {
                        const saved = await cfg.localSaved.getAll();
                        result = await cfg.search({ [cfg.idKey]: saved.map(x => x.id), published: true, ...baseParams }, page);
                    }
                }

                setContent(result);
            } finally {
                setContentLoading(false);
            }
        }

        handleContent();
    }, [user, activeTab, page, mainActiveTab, mainActiveTabInitialized, subTabInitialized]);

    if (loading)
        return <div>
            <h2>Loading Profile...</h2>
        </div>;

    const contentDisplay = () => {
        if (contentLoading) return <p className="title-text" style={{ textAlign: "center" }}>Loading...</p>;
        const cfg = contentConfig[mainActiveTab];
        if (!cfg) return;

        const components = [];
        if (!user) {
            if (activeTab === "drafts") {
                components.push(<div key={"draft-warn"} style={{ color: uiColors.red, paddingBottom: "0.5rem" }}>
                    {uiStrings.contentNoUser(cfg.str)}
                </div>)
            } else if (activeTab === "saved") {
                components.push(<div key={"save-warn"} style={{ color: uiColors.red, paddingBottom: "0.5rem" }}>
                    {uiStrings.savedContentNoUser(cfg.str)}
                </div>)
            }
        }

        if (content.length === 0) {
            if (page === 1) {
                let str;
                if (activeTab === "published") str = user ? uiStrings.noPublishedContent(cfg.str) : "";
                else if (activeTab === "drafts") str = uiStrings.noDrafts;
                else if (activeTab === "saved") str = uiStrings.noSavedContent(cfg.str);
                if (str) {
                    components.push(<p key={"no-content"} className="title-text" style={{ textAlign: "center" }}>
                        {str}
                    </p>)
                }
            } else {
                components.push(<p key={"no-content"} className="title-text" style={{ textAlign: "center" }}>
                    {uiStrings.noMoreContent(cfg.str)}
                </p>)
            }
        } else {
            components.push(
                <div key={"content"} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {cfg.content(content)}

                    <div style={{ display: "flex", gap: "0.5rem", alignSelf: "end" }}>
                        <button className="page-button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                        <button className="page-button" disabled={content.length > 0} onClick={() => setPage(p => p + 1)}>Next</button>
                    </div>
                </div>
            );
        }

        return components;
    }

    const handleSetMainActiveTab = tab => {
        setStoredMainTab(tab);
        setContent([]);
        setPage(1);

        const params = new URLSearchParams(searchParams);
        params.set("tab", tab);

        router.replace(`my-posts?${params.toString()}`, { scroll: false });

    }

    const handleSetActiveTab = tab => {
        setStoredSubTab(tab);
        setContent([]);
        setPage(1);

        const params = new URLSearchParams(searchParams);
        params.set("subTab", tab);

        router.replace(`my-posts?${params.toString()}`, { scroll: false });
    }

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        <h2 style={{ margin: 0 }}>My Posts</h2>
        <h2 style={{ display: "flex", marginBottom: "1rem", gap: "1rem" }}>
            <div className={`tab-header ${mainActiveTab === "builds" ? "active" : ""}`} onClick={() => handleSetMainActiveTab("builds")}>Builds</div>
            <div className={`tab-header ${mainActiveTab === "collections" ? "active" : ""}`} onClick={() => handleSetMainActiveTab("collections")}>Collections</div>
            <div className={`tab-header ${mainActiveTab === "md_plans" ? "active" : ""}`} onClick={() => handleSetMainActiveTab("md_plans")}>MD Plans</div>
        </h2>
        <div style={{ display: "flex", marginBottom: "1rem", gap: "1rem" }}>
            {mainActiveTab === "builds" ?
                <NoPrefetchLink href="/builds/new" style={{ textDecoration: "none" }}>
                    <div className="tab-header">+New Build</div>
                </NoPrefetchLink> :
                mainActiveTab === "collections" ?
                    <NoPrefetchLink href="/collections/new" style={{ textDecoration: "none" }}>
                        <div className="tab-header">+New Collection</div>
                    </NoPrefetchLink> :
                    <NoPrefetchLink href="/md-plans/new" style={{ textDecoration: "none" }}>
                        <div className="tab-header">+New MD Plans</div>
                    </NoPrefetchLink>
            }
            {user ?
                <div className={`tab-header ${activeTab === "published" ? "active" : ""}`} onClick={() => handleSetActiveTab("published")}>Published</div> :
                null}
            <div className={`tab-header ${activeTab === "drafts" ? "active" : ""}`} onClick={() => handleSetActiveTab("drafts")}>Drafts</div>
            <div className={`tab-header ${activeTab === "saved" ? "active" : ""}`} onClick={() => handleSetActiveTab("saved")}>Saved</div>
        </div>

        {contentDisplay()}
    </div>
}
