"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

import CompanyDisplay from "@/app/components/company/CompanyDisplay";
import { useData } from "@/app/components/DataProvider";
import MarkdownRenderer from "@/app/components/markdown/MarkdownRenderer";
import { HorizontalDivider } from "@/app/components/objects/Dividers";
import { LoadingContentPageTemplate } from "@/app/components/pageTemplates/ContentPageTemplate";
import Review from "@/app/components/ratings/Review";
import SocialsDisplay from "@/app/components/user/SocialsDisplay";
import { getUserReviews } from "@/app/database/reviews";
import { getUserDataFromUsername } from "@/app/database/users";
import { contentConfig } from "@/app/lib/contentConfig";
import { buildSearchStrings, checkFilterMatch } from "@/app/lib/filter";
import { uiStrings } from "@/app/lib/uiStrings";

export default function ProfilePage({ params, sp_tab, sp_page }) {
    const { username } = React.use(params);
    const parsedUsername = useMemo(() => {
        return decodeURIComponent(username);
    }, [username]);

    const [identities, identitiesLoading] = useData("identities");
    const [egos, egosLoading] = useData("egos");
    const [altNames, altNamesLoading] = useData("alt_names");
    const [userId, setUserId] = useState(null);
    const [content, setContent] = useState([]);
    const [reviews, setReviews] = useState(null);
    const [reviewSearch, setReviewSearch] = useState("");
    const [contentLoading, setContentLoading] = useState(false);
    const [flair, setFlair] = useState("");
    const [description, setDescription] = useState("");
    const [socials, setSocials] = useState([]);
    const [userExists, setUserExists] = useState(false);
    const [checkingUser, setCheckingUser] = useState(true);
    const { isDesktop } = useBreakpoint();

    const searchParams = useSearchParams();
    const router = useRouter();

    const [tab, setTab] = useState(sp_tab ?? "builds");
    const [page, setPage] = useState(sp_page ?? 1);

    useEffect(() => {
        getUserDataFromUsername(parsedUsername).then(x => {
            if (x) {
                setUserExists(true);
                setUserId(x.id);
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
        if (!userId) return;

        if (tab === "reviews") {
            const loadReviews = async () => {
                const result = await getUserReviews({ userId: userId });
                setReviews(result);
            }

            loadReviews();
            return;
        }

        const cfg = contentConfig[tab];
        if (!cfg) return;

        const handleContent = async () => {
            setContentLoading(true);
            try {
                const result = await cfg.search({ userId: userId, ignoreBlockDiscovery: true, published: true, sortBy: "new" }, page);
                setContent(result);
            } finally {
                setContentLoading(false);
            }
        }

        handleContent();
    }, [userId, page, tab]);

    const changeTab = tab => {
        setContent([]);
        setTab(tab);
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', String(tab))

        window.history.replaceState(window.history.state, "", `/profiles/${username}?${params.toString()}`);
    }

    const navigatePage = page => {
        setPage(page);
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', String(page))

        window.history.replaceState(window.history.state, "", `/profiles/${username}?${params.toString()}`);
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
        if (tab === "reviews") {
            if (!reviews || identitiesLoading || egosLoading) return <LoadingContentPageTemplate />;

            const navigateToRanking = () => {
                const params = new URLSearchParams();
                params.set("tab", "reviewer");
                params.set("username", username);

                router.push(`/rankings?${params.toString()}`);
            }

            const reviewComponents = Object.entries(reviews)
                .filter(([, review]) => review.review_text && review.review_text.length > 0)
                .filter(([, review]) => {
                    if (reviewSearch.length === 0) return true;
                    const data = String(review.item_id)[0] === "1" ? identities[review.item_id] : egos[review.item_id];
                    return checkFilterMatch(reviewSearch, buildSearchStrings(data, altNamesLoading ? null : altNames));
                })
                .sort((a, b) => b[1].bump_count - a[1].bump_count)
                .map(([, review]) =>
                    <Review
                        key={review.id}
                        reviewData={review}
                        backReview={review}
                        usernameOverride={parsedUsername}
                        expanded={true}
                    />
                )

            return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ alignSelf: "center" }}>
                    <input value={reviewSearch} onChange={e => setReviewSearch(e.target.value)} placeholder={"Search Identity/E.G.O..."} />
                    <button onClick={() => navigateToRanking()} >Go to Ranking</button>
                </div>

                {
                    reviewComponents.length === 0 ?
                        <div className="title-text" style={{textAlign: "center"}}>
                            No ratings with reviews. Go to Ranking to see all ratings. 
                        </div> :
                        reviewComponents
                }
            </div>
        }

        if (contentLoading) return <LoadingContentPageTemplate />
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
                <h1 style={{ fontSize: "1.75rem", marginBottom: "0" }}>{parsedUsername}</h1>
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
                <div className={`tab-header ${tab === "reviews" ? "active" : ""}`} onClick={() => changeTab("reviews")}>Reviews</div>
            </div>

            {contentDisplay()}
        </div>
    </div>
}
