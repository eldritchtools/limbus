"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useEffect, useMemo, useState } from "react";
import React from "react";

import MarkdownRenderer from "@/app/components/markdown/MarkdownRenderer";
import SocialsDisplay from "@/app/components/user/SocialsDisplay";
import { getUserDataFromUsername } from "@/app/database/users";
import { contentConfig } from "@/app/lib/contentConfig";
import { uiStrings } from "@/app/lib/uiStrings";

export default function ProfilePage({ params }) {
    const { username } = React.use(params);
    const parsedUsername = useMemo(() => {
        return decodeURIComponent(username);
    }, [username]);

    const [content, setContent] = useState([]);
    const [contentLoading, setContentLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [flair, setFlair] = useState("");
    const [description, setDescription] = useState("");
    const [socials, setSocials] = useState([]);
    const [userExists, setUserExists] = useState(false);
    const [checkingUser, setCheckingUser] = useState(true);
    const [viewMode, setViewMode] = useState("builds");
    const { isDesktop } = useBreakpoint();

    useEffect(() => {
        getUserDataFromUsername(parsedUsername).then(x => {
            if (x) {
                setUserExists(true);
                setFlair(x.flair ?? "");
                setDescription(x.description ?? "");
                setSocials(x.socials ?? []);
            }
            else setUserExists(false);
            setCheckingUser(false);
        })
    }, [parsedUsername]);

    useEffect(() => {
        const cfg = contentConfig[viewMode];
        if (!cfg) return;

        const handleContent = async () => {
            setContentLoading(true);
            try {
                const result = await cfg.search({ username: parsedUsername, ignoreBlockDiscovery: true, published: true, sortBy: "new" }, page);
                setContent(result);
            } finally {
                setContentLoading(false);
            }
        }

        handleContent();
    }, [parsedUsername, page, viewMode]);

    if (checkingUser) {
        return <div style={{ display: "flex", flexDirection: "column" }}>
            <h2>Checking user {parsedUsername}</h2>
        </div>
    }

    if (!userExists) {
        return <div style={{ display: "flex", flexDirection: "column" }}>
            <h2>User {parsedUsername} not found</h2>
        </div>
    }

    const contentDisplay = () => {
        if (contentLoading) return <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>Loading...</p>;
        const cfg = contentConfig[viewMode];
        if (!cfg) return;

        if (content.length === 0) {
            return <p style={{ color: "#aaa", fontweight: "bold", textAlign: "center" }}>
                {page === 1 ? uiStrings.noPublishedContent(cfg.str) : uiStrings.noMoreContent(cfg.str)}
            </p>;
        } else {
            return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {cfg.content(content)}

                <div style={{ display: "flex", gap: "0.5rem", alignSelf: "end" }}>
                    <button className="page-button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
                    <button className="page-button" disabled={content.length > 0} onClick={() => setPage(p => p + 1)}>Next</button>
                </div>
            </div>;
        }
    }

    const handleSetViewMode = mode => {
        setViewMode(mode);
        setContent([]);
        setPage(1);
    }

    return <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: isDesktop ? "90%" : "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
                <h2 style={{ marginBottom: "0" }}>{parsedUsername}</h2>
                <div><em>{flair}</em></div>
                {socials.length > 0 ? <SocialsDisplay socials={socials} /> : null}
                <div style={{ width: isDesktop ? "70%" : "90%" }}> <MarkdownRenderer content={description} /></div>
            </div>
            <div style={{ alignSelf: "center", border: "1px #777 solid", width: "100%" }} />

            <div style={{ display: "flex", marginTop: "0.5rem", marginBottom: "1rem", gap: "1rem", justifyContent: "center" }}>
                <div className={`tab-header ${viewMode === "builds" ? "active" : ""}`} onClick={() => handleSetViewMode("builds")}>Builds</div>
                <div className={`tab-header ${viewMode === "collections" ? "active" : ""}`} onClick={() => handleSetViewMode("collections")}>Collections</div>
                <div className={`tab-header ${viewMode === "md_plans" ? "active" : ""}`} onClick={() => handleSetViewMode("md_plans")}>MD Plans</div>
            </div>

            {contentDisplay()}
        </div>
    </div>
}
