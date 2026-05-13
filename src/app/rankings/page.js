"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

import RankingDisplay from "./RankingDisplay";
import { rankingsFilter } from "./rankingsFilter";
import { useData } from "../components/DataProvider";
import NoPrefetchLink from "../components/NoPrefetchLink";
import { HorizontalDivider } from "../components/objects/Dividers";
import DropdownButton from "../components/objects/DropdownButton";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import Review from "../components/ratings/Review";
import IconsSelector from "../components/selectors/IconsSelector";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { getRatingHelpTooltipProps } from "../components/tooltips/RatingHelpTooltip";
import { useAuth } from "../database/authProvider";
import { getAggregatesByType, getOverallScore, getPopularReviewers, getReviewScores, getUserReviews } from "../database/reviews";
import { getUserDataFromUsername } from "../database/users";
import { uiColors } from "../lib/colors";
import { egoCriteria, identityCriteria } from "../lib/ratings";
import useLocalState from "../lib/useLocalState";

const MIN_RATINGS_MAPPING = {
    0: 0,
    1: 10,
    2: 25,
    3: 50,
    4: 100,
    5: 250
}

function GlobalRankingDisplay({
    viewMode, rankingMode,
    identities, egos,
    identityReviews, identityReviewsRef, userIdentityReviews, userIdentityReviewsRef,
    egoReviews, egoReviewsRef, userEgoReviews, userEgoReviewsRef,
    setIdentityReviews, setEgoReviews, setUserIdentityReviews, setUserEgoReviews,
    searchString, filters, minRatings,
    strictFiltering, separateByPoint, globalRanking, showBreakdown
}) {
    const items = useMemo(() => rankingsFilter({
        type: viewMode, identityReviews, egoReviews,
        rankingMode, identities, egos, minRatings: MIN_RATINGS_MAPPING[minRatings],
        filters, searchString, globalRanking, strictFiltering, separateByPoint,
        userIdentityReviews, userEgoReviews
    }), [
        identities, egos, viewMode, rankingMode,
        identityReviews, userIdentityReviews,
        egoReviews, userEgoReviews,
        strictFiltering, searchString, minRatings,
        filters, separateByPoint, globalRanking
    ]);

    const onChange = async (id, x) => {
        const modEntry = (global, user, delta) => {
            if (!user) return global;

            const userScores = user.rating ? user.rating : getReviewScores(user);
            if (!global) {
                return {
                    votes: 1,
                    rating: userScores,
                    overallRating: getOverallScore(userScores)
                }
            }

            const newRating = global.rating.map((score, i) => ((score * global.votes) + delta * userScores[i]) / (global.votes + delta));
            return {
                votes: global.votes + delta,
                rating: newRating,
                overallRating: getOverallScore(newRating)
            }
        }

        if (x === null) {
            if (viewMode === "identity") {
                setUserIdentityReviews(p => {
                    const { [id]: rem, ...newObj } = p;
                    return newObj;
                });

                const newReviews = modEntry(identityReviewsRef.current[id], userIdentityReviewsRef.current[id], -1);
                if (newReviews.votes === 0) {
                    setIdentityReviews(p => {
                        const { [id]: rem, ...newObj } = p;
                        return newObj;
                    });
                } else {
                    setIdentityReviews(p => ({ ...p, [id]: newReviews }));
                }
            } else {
                setUserEgoReviews(p => {
                    const { [id]: rem, ...newObj } = p;
                    return newObj;
                });

                const newReviews = modEntry(egoReviewsRef.current[id], userEgoReviewsRef.current[id], -1);
                if (newReviews.votes === 0) {
                    setEgoReviews(p => {
                        const { [id]: rem, ...newObj } = p;
                        return newObj;
                    });
                } else {
                    setEgoReviews(p => ({ ...p, [id]: newReviews }));
                }
            }
            return;
        }

        const scores = getReviewScores(x);
        if (viewMode === "identity") {
            setUserIdentityReviews(p => ({ ...p, [id]: { overallRating: getOverallScore(scores), rating: scores } }));
            setIdentityReviews(p => ({
                ...p, [id]:
                    modEntry(modEntry(identityReviewsRef.current[id], userIdentityReviewsRef.current[id], -1), x, 1)
            }));
        } else {
            setUserEgoReviews(p => ({ ...p, [id]: { overallRating: getOverallScore(scores), rating: scores } }));
            setEgoReviews(p => ({
                ...p, [id]:
                    modEntry(modEntry(egoReviewsRef.current[id], userEgoReviewsRef.current[id], -1), x, 1)
            }));
        }
    }

    if (viewMode === "identity" && !identityReviews) return <span>Loading...</span>;
    if (viewMode === "ego" && !egoReviews) return <span>Loading...</span>;

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.5rem", width: "100%" }}>
        <RankingDisplay
            viewMode={viewMode} items={items} modalOnChange={onChange}
            reviews={viewMode === "identity" ? identityReviews : egoReviews}
            reviewsRef={viewMode === "identity" ? identityReviewsRef : egoReviewsRef}
            userReviews={viewMode === "identity" ? userIdentityReviews : userEgoReviews}
            userReviewsRef={viewMode === "identity" ? userIdentityReviewsRef : userEgoReviewsRef}
            showBreakdown={showBreakdown}
            separateByPoint={separateByPoint}
        />
    </div>
}

function ReviewerDisplay({
    rankingMode, identities, egos,
    userIdentityReviews, userEgoReviews,
    searchString, filters,
    strictFiltering, separateByPoint, globalRanking, showBreakdown
}) {
    const [reviewers, setReviewers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [username, setUsername] = useState(null);
    const [reviews, setReviews] = useState({});
    const [userInput, setUserInput] = useState("");
    const [message, setMessage] = useState("");
    const [selectedReview, setSelectedReview] = useState(null);

    useEffect(() => {
        if (!loading || reviewers.length > 0) return;
        const loadReviewers = async () => {
            const result = await getPopularReviewers();
            setReviewers(result.filter(x => x.username && x.total_bumps > 0));
            setLoading(false);
        }

        loadReviewers();
    }, [loading, reviewers]);

    useEffect(() => {
        if (!selected) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setReviews([]);
            return;
        }

        const loadReviews = async () => {
            const result = await getUserReviews({ userId: selected });
            const processedResult = Object.entries(result).reduce((acc, [id, review]) => {
                acc[id] = {...review, votes: 1};
                return acc;
            }, {});
            setReviews(processedResult);
            setLoading(false);
        }

        loadReviews();
    }, [selected]);

    const searchUser = async () => {
        setLoading(true);
        const user = await getUserDataFromUsername(userInput, "id");
        if (user) {
            setSelected(user.id);
            setUsername(userInput);
            setMessage("");
        } else {
            setMessage("Username not found!")
            setLoading(false);
        }
    }

    const items = useMemo(() => {
        const [identityReviews, egoReviews] = Object.entries(reviews).reduce(([idDict, egoDict], [itemId, next]) => {
            if (next.item_type === "identity") idDict[itemId] = next;
            else egoDict[itemId] = next;
            return [idDict, egoDict];
        }, [[], []]);

        return rankingsFilter({
            type: "users", identityReviews, egoReviews,
            rankingMode, identities, egos,
            filters, searchString, globalRanking, strictFiltering, separateByPoint,
            userIdentityReviews, userEgoReviews
        })
    }, [
        reviews,
        identities, egos, rankingMode,
        userIdentityReviews, userEgoReviews,
        strictFiltering, searchString,
        filters, separateByPoint, globalRanking
    ]);

    const userReviews = useMemo(() => ({ ...userIdentityReviews, ...userEgoReviews }), [userIdentityReviews, userEgoReviews]);

    if (loading) return <LoadingContentPageTemplate />;

    if (selected)
        return <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                <button onClick={() => { setSelected(null); setUsername(null); setSelectedReview(null); }}>Go Back</button>
                <h2 className="title-text">{username}&apos;s Ranking</h2>
            </div>

            {selectedReview &&
                <Review
                    key={selectedReview.id}
                    reviewData={selectedReview}
                    backReview={selectedReview}
                    usernameOverride={username}
                    expanded={true}
                />
            }

            <RankingDisplay
                items={items} onClick={review => setSelectedReview(review)}
                reviews={reviews}
                userReviews={userReviews}
                showBreakdown={showBreakdown}
                separateByPoint={separateByPoint}
            />
        </div>

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <h2 className="title-text">Input a user:</h2>
        <div style={{ display: "flex", gap: "0.2rem" }}>
            <input
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                placeholder={"Username..."}
                onKeyDown={e => { if (e.key === 'Enter') searchUser(); }}
            />
            <button onClick={searchUser} disabled={loading}>Search</button>
        </div>
        <div className="sub-text" style={{ color: uiColors.red }}>{message}</div>
        <h2 className="title-text">or select from the most popular reviewers</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "0.5rem", width: "min(1300px, 100%)" }}>
            {reviewers.map(reviewer =>
                <div key={reviewer.user_id} className="text-link"
                    onClick={() => {
                        setSelected(reviewer.user_id);
                        setUsername(reviewer.username);
                        setLoading(true);
                    }}>
                    {reviewer.username}
                </div>
            )}
        </div>
    </div>
}

function RankingDropdown({ viewMode, rankingMode, setRankingMode }) {
    const options = useMemo(() => {
        const criteria = viewMode === "identity" ? identityCriteria : egoCriteria;
        const options = { "overall": "Overall Ranking" };
        criteria.forEach(({ label }, i) => options[i] = label);
        return options;
    }, [viewMode]);

    return <DropdownButton value={rankingMode} setValue={setRankingMode} options={options} />
}

export default function RankingsPage() {
    const { user, loading } = useAuth();
    const [identities, identitiesLoading] = useData("identities");
    const [egos, egosLoading] = useData("egos");
    const [viewMode, setViewMode] = useLocalState("rankingViewMode", "identity");
    const [rankingMode, setRankingMode] = useState("overall");
    const [minRatings, setMinRatings] = useLocalState("rankingMinRatings", 2);

    const [identityReviews, setIdentityReviews] = useState(null);
    const [egoReviews, setEgoReviews] = useState(null);
    const identityReviewsRef = useRef(identityReviews);
    const egoReviewsRef = useRef(egoReviews);
    useEffect(() => { identityReviewsRef.current = identityReviews }, [identityReviews]);
    useEffect(() => { egoReviewsRef.current = egoReviews }, [egoReviews]);

    const [userIdentityReviews, setUserIdentityReviews] = useState(null);
    const [userEgoReviews, setUserEgoReviews] = useState(null);
    const userIdentityReviewsRef = useRef(userIdentityReviews);
    const userEgoReviewsRef = useRef(userEgoReviews);
    useEffect(() => { userIdentityReviewsRef.current = userIdentityReviews }, [userIdentityReviews]);
    useEffect(() => { userEgoReviewsRef.current = userEgoReviews }, [userEgoReviews]);

    const [searchString, setSearchString] = useState("");
    const [filters, setFilters] = useLocalState("rankingFilters", []);
    const [strictFiltering, setStrictFiltering] = useLocalState("rankingStrictFiltering", false);
    const [separateByPoint, setSeparateByPoint] = useLocalState("rankingSeparateByPoint", false);
    const [globalRanking, setGlobalRanking] = useLocalState("rankingGlobalRanking", false);
    const [showBreakdown, setShowBreakdown] = useLocalState("rankingShowBreakdown", false);

    useEffect(() => {
        if (loading) return;

        if (viewMode === "identity") {
            if (identityReviews) return;
            const fetchReviews = async () => {
                const reviews = await getAggregatesByType({ itemType: "identity" });
                setIdentityReviews(reviews);

                if (user) {
                    const userReviews = await getUserReviews({ userId: user.id, itemType: "identity" })
                    setUserIdentityReviews(userReviews);
                }
            }

            fetchReviews();
        } else if (viewMode === "ego") {
            if (egoReviews) return;
            const fetchReviews = async () => {
                const reviews = await getAggregatesByType({ itemType: "ego" });
                setEgoReviews(reviews);

                if (user) {
                    const userReviews = await getUserReviews({ userId: user.id, itemType: "ego" })
                    setUserEgoReviews(userReviews);
                }
            }

            fetchReviews();
        }
    }, [viewMode, loading, identityReviews, egoReviews, user]);

    if (loading || identitiesLoading || egosLoading) return <LoadingContentPageTemplate />

    const userReviewProps = user ? {
        userIdentityReviews: userIdentityReviews, userEgoReviews: userEgoReviews,
        userIdentityReviewsRef: userIdentityReviewsRef, userEgoReviewsRef: userEgoReviewsRef,
        setUserIdentityReviews: setUserIdentityReviews, setUserEgoReviews: setUserEgoReviews
    } :
        {};

    const filterCategories =
        viewMode === "identity" ?
            ["identityTier", "sinner", "status", "affinity", "skillType"] :
            viewMode === "ego" ?
                ["egoTier", "sinner", "status", "affinity", "atkType"] :
                ["identityTier", "egoTier", "sinner", "status", "affinity", "atkType"]

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
        <h2 style={{ margin: 0 }}>Community Rankings</h2>
        <p style={{ maxWidth: "1000px", textAlign: "left" }}>
            See how the community ranks the identities and E.G.Os in the game. Rankings are calculated from community-submitted ratings at the time the page loads. Refresh if you want to update the rankings.
            <br /> <br />
            Click on the identity or E.G.O to submit your own rating or leave a review. You can also visit their respective pages and check the &quot;Community Rating&quot; tab.
            <br /> <br />
            Please remember that everyone experiences the game differently. Your personal experience may not align with the community average. Be respectful when there are disagreements.
            <br /> <br />
            This page is still an early version and may receive design overhauls and quality-of-life improvements over time. Feel free to share suggestions through the Discord server or the <NoPrefetchLink href={"/feedback"} className="text-link">feedback</NoPrefetchLink> page.
        </p>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", alignItems: "center", justifyContent: "center", gap: "0.5rem", maxWidth: "350px" }}>
                <span style={{ textAlign: 'end' }}>Search:</span>
                <input type="text" placeholder="Search..." value={searchString} onChange={(e) => setSearchString(e.target.value)} />
                <div style={{ display: "flex", justifyContent: "end" }}>
                    <span {...getRatingHelpTooltipProps(viewMode)} className="hover-text" style={{ textAlign: 'end' }}>Ranking:</span>
                </div>
                <div>
                    <RankingDropdown viewMode={viewMode} rankingMode={rankingMode} setRankingMode={setRankingMode} />
                </div>
                <span {...getGeneralTooltipProps("Minimum number of ratings needed to be ranked")} className="hover-text" style={{ textAlign: 'end' }}>Min Ratings:</span>
                <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", filter: viewMode === "reviewer" ? "brightness(0.5)" : null }}>
                    <input
                        type="range" min={0} max={5} step={1} value={minRatings}
                        onChange={(e) => setMinRatings(Number(e.target.value))}
                        style={{ width: "100px" }} disabled={viewMode === "reviewer"}
                    />
                    <span>
                        {MIN_RATINGS_MAPPING[minRatings] ? `${MIN_RATINGS_MAPPING[minRatings]}+ Ratings` : "Any"}
                    </span>
                </div>
                <div />
                <label style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    <input type="checkbox" checked={separateByPoint} onChange={e => setSeparateByPoint(e.target.checked)} />
                    Separate by Point Thresholds
                </label>
                <div />
                <label style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.2rem" }}>
                    <input type="checkbox" checked={strictFiltering} onChange={e => setStrictFiltering(e.target.checked)} />
                    Strict Filtering
                    <span className="sub-text">(Require all selected filters)</span>
                </label>
                <div />
                <label
                    {...getGeneralTooltipProps("If checked, computes ranking across all identities/E.G.Os instead of only the filtered ones.")}
                    style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}
                >
                    <input type="checkbox" checked={globalRanking} onChange={e => setGlobalRanking(e.target.checked)} />
                    <span className="hover-text">Use Global Rankings</span>
                </label>
                <div />
                <label
                    {...getGeneralTooltipProps("If checked, shows the breakdown of scores on all items.\nCaution: This may cause weaker devices to lag.")}
                    style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}
                >
                    <input type="checkbox" checked={showBreakdown} onChange={e => setShowBreakdown(e.target.checked)} />
                    <span className="hover-text">Show Score Breakdowns</span>
                </label>
            </div>

            <IconsSelector type={"column"} categories={filterCategories} values={filters} setValues={setFilters} />
        </div>

        <h2 style={{ display: "flex", marginBottom: "1rem", gap: "1rem" }}>
            <div className={`tab-header ${viewMode === "identity" ? "active" : ""}`} onClick={() => setViewMode("identity")}>Identities</div>
            <div className={`tab-header ${viewMode === "ego" ? "active" : ""}`} onClick={() => setViewMode("ego")}>E.G.Os</div>
            <div className={`tab-header ${viewMode === "reviewer" ? "active" : ""}`} onClick={() => setViewMode("reviewer")}>Reviewers</div>
        </h2>

        <HorizontalDivider />

        {viewMode === "identity" || viewMode === "ego" ?
            <GlobalRankingDisplay
                viewMode={viewMode} rankingMode={rankingMode}
                identities={identities} egos={egos}
                identityReviews={identityReviews} egoReviews={egoReviews}
                setIdentityReviews={setIdentityReviews} setEgoReviews={setEgoReviews}
                identityReviewsRef={identityReviewsRef} egoReviewsRef={egoReviewsRef}
                {...userReviewProps}
                searchString={searchString} filters={filters} minRatings={minRatings}
                strictFiltering={strictFiltering} separateByPoint={separateByPoint}
                globalRanking={globalRanking} showBreakdown={showBreakdown}
            /> :
            <ReviewerDisplay
                rankingMode={rankingMode}
                identities={identities} egos={egos}
                {...userReviewProps}
                searchString={searchString} filters={filters}
                strictFiltering={strictFiltering} separateByPoint={separateByPoint}
                globalRanking={globalRanking} showBreakdown={showBreakdown}
            />
        }
    </div>
}
