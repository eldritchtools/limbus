"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import CompanyDisplay from "@/app/components/company/CompanyDisplay";
import MarkdownRenderer from "@/app/components/markdown/MarkdownRenderer";
import { HorizontalDivider } from "@/app/components/objects/Dividers";
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
    const [flair, setFlair] = useState("");
    const [description, setDescription] = useState("");
    const [socials, setSocials] = useState([]);
    const [userExists, setUserExists] = useState(false);
    const [checkingUser, setCheckingUser] = useState(true);
    const { isDesktop } = useBreakpoint();

    const searchParams = useSearchParams();
    const router = useRouter();

    const tab = searchParams.get("tab") ?? "builds";
    const page = searchParams.get("page") ? Number(searchParams.get("page")) : 1

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
        if (tab === "company") return;
        const cfg = contentConfig[tab];
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
    }, [parsedUsername, page, tab]);

    const changeTab = tab => {
        setContent([]);
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', String(tab))

        router.push(`/profiles/${username}?${params.toString()}`);
    }

    const navigatePage = page => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', String(page))

        router.push(`/profiles/${username}?${params.toString()}`);
    }

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
        if (tab === "company") return <CompanyDisplay username={username} />;
        if (contentLoading) return <p className="title-text" style={{ textAlign: "center" }}>Loading...</p>;
        const cfg = contentConfig[tab];
        if (!cfg) return;

        if (content.length === 0) {
            return <p className="title-text" style={{ textAlign: "center" }}>
                {page === 1 ? uiStrings.noPublishedContent(cfg.str) : uiStrings.noMoreContent(cfg.str)}
            </p>;
        } else {
            return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {cfg.content(content)}

                <div style={{ display: "flex", gap: "0.5rem", alignSelf: "end" }}>
                    <button className="page-button" disabled={page === 1} onClick={() => navigatePage(page - 1)}>Prev</button>
                    <button className="page-button" disabled={content.length < cfg.defaultPageSize} onClick={() => navigatePage(page + 1)}>Next</button>
                </div>
            </div>;
        }
    }

    return <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: isDesktop ? "90%" : "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center" }}>
                <h2 style={{ marginBottom: "0" }}>{parsedUsername}</h2>
                <div><em>{flair}</em></div>
                {socials.length > 0 ? <SocialsDisplay socials={socials} /> : null}
                <div style={{ width: isDesktop ? "70%" : "90%" }}> <MarkdownRenderer content={description} /></div>
            </div>

            <HorizontalDivider />

            <div style={{ display: "flex", marginTop: "0.5rem", marginBottom: "1rem", gap: "1rem", justifyContent: "center" }}>
                <div className={`tab-header ${tab === "builds" ? "active" : ""}`} onClick={() => changeTab("builds")}>Builds</div>
                <div className={`tab-header ${tab === "collections" ? "active" : ""}`} onClick={() => changeTab("collections")}>Collections</div>
                <div className={`tab-header ${tab === "md_plans" ? "active" : ""}`} onClick={() => changeTab("md_plans")}>MD Plans</div>
                <div className={`tab-header ${tab === "company" ? "active" : ""}`} onClick={() => changeTab("company")}>Company</div>
            </div>

            {contentDisplay()}
        </div>
    </div>
}
