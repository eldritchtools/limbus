"use client";

import { useRouter } from "next/navigation";
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

async function modalOnChange(id, x, {
    reviewsRef, userReviewsRef, setReviews, setUserReviews
}) {
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
        setUserReviews(p => {
            const { [id]: rem, ...newObj } = p;
            return newObj;
        });

        const newReviews = modEntry(reviewsRef.current[id], userReviewsRef.current[id], -1);
        if (newReviews.votes === 0) {
            setReviews(p => {
                const { [id]: rem, ...newObj } = p;
                return newObj;
            });
        } else {
            setReviews(p => ({ ...p, [id]: newReviews }));
        }
        return;
    }

    const scores = getReviewScores(x);
    setUserReviews(p => ({ ...p, [id]: { overallRating: getOverallScore(scores), rating: scores } }));
    setReviews(p => ({
        ...p, [id]:
            modEntry(modEntry(reviewsRef.current[id], userReviewsRef.current[id], -1), x, 1)
    }));
}

function GlobalRankingDisplay({
    viewMode, rankingMode,
    identities, egos,
    reviews, reviewsRef, userReviews, userReviewsRef,
    setReviews, setUserReviews,
    searchString, filters, minRatings,
    strictFiltering, separateByPoint, globalRanking, showBreakdown
}) {
    const items = useMemo(() => rankingsFilter({
        type: viewMode, reviews, userReviews,
        rankingMode, identities, egos, minRatings: MIN_RATINGS_MAPPING[minRatings],
        filters, searchString, globalRanking, strictFiltering, separateByPoint
    }), [
        identities, egos, viewMode, rankingMode,
        reviews, userReviews,
        strictFiltering, searchString, minRatings,
        filters, separateByPoint, globalRanking
    ]);

    const onChange = (id, x) => modalOnChange(id, x, {
        reviewsRef, userReviewsRef, setReviews, setUserReviews
    });

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.5rem", width: "100%" }}>
        <RankingDisplay
            viewMode={viewMode} items={items} modalOnChange={onChange}
            reviews={reviews}
            reviewsRef={reviewsRef}
            userReviews={userReviews}
            userReviewsRef={userReviewsRef}
            showBreakdown={showBreakdown}
            separateByPoint={separateByPoint}
        />
    </div>
}

function ReviewerDisplay({
    rankingMode, identities, egos,
    reviews, reviewsRef, userReviews, userReviewsRef,
    setReviews, setUserReviews,
    searchString, filters,
    strictFiltering, separateByPoint, globalRanking, showBreakdown,
    initUsername
}) {
    const { user, profile } = useAuth();
    const [reviewers, setReviewers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [username, setUsername] = useState(null);
    const [selectedUserReviews, setSelectedUserReviews] = useState({});
    const [userInput, setUserInput] = useState("");
    const [message, setMessage] = useState("");
    const [selectedReview, setSelectedReview] = useState(null);
    const router = useRouter();

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
            setSelectedUserReviews([]);

            const params = new URLSearchParams();
            params.set("tab", "reviewer");

            window.history.replaceState(window.history.state, "", `/rankings?${params.toString()}`);
            return;
        }

        const loadReviews = async () => {
            const result = await getUserReviews({ userId: selected });
            const processedResult = Object.entries(result).reduce((acc, [id, review]) => {
                acc[id] = { ...review, votes: 1 };
                return acc;
            }, {});
            setSelectedUserReviews(processedResult);

            const params = new URLSearchParams();
            params.set("tab", "reviewer");
            params.set("username", username)

            window.history.replaceState(window.history.state, "", `/rankings?${params.toString()}`);
            
            setLoading(false);
        }

        loadReviews();
    }, [selected, username, router]);

    const searchUser = useCallback(async (username) => {
        setLoading(true);
        const fetched = await getUserDataFromUsername(username, "id");
        if (fetched) {
            setSelected(fetched.id);
            setUsername(username);
            setMessage("");
        } else {
            setMessage("Username not found!")
            setLoading(false);
        }
    }, [setLoading, setSelected, setUsername, setMessage]);

    useEffect(() => {
        if(initUsername && initUsername.length > 0) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setUserInput(initUsername);
            searchUser(initUsername);
        }
    }, [initUsername, searchUser])

    const items = useMemo(() => {
        return rankingsFilter({
            type: "both", reviews: selected === user.id ? userReviews : selectedUserReviews,
            rankingMode, identities, egos,
            filters, searchString, globalRanking, strictFiltering, separateByPoint,
            userReviews
        })
    }, [
        selectedUserReviews, selected, user, userReviews,
        identities, egos, rankingMode,
        strictFiltering, searchString,
        filters, separateByPoint, globalRanking
    ]);

    if (loading) return <LoadingContentPageTemplate />;

    if (selected) {
        const additionalProps = selected === user.id ?
            {
                modalOnChange: (id, x) => modalOnChange(id, x, {
                    reviewsRef, userReviewsRef, setReviews, setUserReviews
                }),
                reviews: reviews,
                reviewsRef: reviewsRef,
                userReviewsRef: userReviewsRef
            } :
            {
                onClick: review => setSelectedReview(review),
                reviews: selectedUserReviews
            }

        return <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", justifyContent: "center" }}>
                <button onClick={() => { setSelected(null); setUsername(null); setSelectedReview(null); }}>Go Back</button>
                <h2 className="title-text">{username}&apos;s Ranking</h2>
            </div>
            {selected === user.id &&
                <span className="sub-text" style={{textAlign: "center"}}>
                    When viewing your own ranking, you can see the global ranking and submit your own ratings.
                </span>}

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
                items={items}
                {...additionalProps}
                userReviews={userReviews}
                showBreakdown={showBreakdown}
                separateByPoint={separateByPoint}
            />
        </div>
    }

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
        <h2 className="title-text">Input a user:</h2>
        <div style={{ display: "flex", gap: "0.2rem" }}>
            <input
                value={userInput}
                onChange={e => setUserInput(e.target.value)}
                placeholder={"Username..."}
                onKeyDown={e => { if (e.key === 'Enter') searchUser(userInput); }}
            />
            <button onClick={() => searchUser(userInput)} disabled={loading}>Search</button>
            <button onClick={() => { setSelected(user.id); setUsername(profile.username); setMessage(""); }}>View my Ranking</button>
        </div>
        <div className="sub-text" style={{ color: uiColors.red }}>{message}</div>
        <h2 className="title-text">or choose from the most popular reviewers</h2>
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

export default function RankingsPage({tab, username}) {
    const { user, loading } = useAuth();
    const [identities, identitiesLoading] = useData("identities");
    const [egos, egosLoading] = useData("egos");
    const [viewMode, setViewMode] = useLocalState("rankingViewMode", "identity", tab);
    const [rankingMode, setRankingMode] = useState("overall");
    const [minRatings, setMinRatings] = useLocalState("rankingMinRatings", 2);

    const [identityReviewsLoaded, setIdentityReviewsLoaded] = useState(false);
    const [egoReviewsLoaded, setEgoReviewsLoaded] = useState(false);

    const [reviews, setReviews] = useState(null);
    const reviewsRef = useRef(reviews);
    useEffect(() => { reviewsRef.current = reviews }, [reviews]);

    const [userReviews, setUserReviews] = useState(null);
    const userReviewsRef = useRef(userReviews);
    useEffect(() => { userReviewsRef.current = userReviews }, [userReviews]);

    const [searchString, setSearchString] = useState("");
    const [filters, setFilters] = useLocalState("rankingFilters", []);
    const [strictFiltering, setStrictFiltering] = useLocalState("rankingStrictFiltering", false);
    const [separateByPoint, setSeparateByPoint] = useLocalState("rankingSeparateByPoint", false);
    const [globalRanking, setGlobalRanking] = useLocalState("rankingGlobalRanking", false);
    const [showBreakdown, setShowBreakdown] = useLocalState("rankingShowBreakdown", false);

    const router = useRouter();

    useEffect(() => {
        if (loading) return;

        if (viewMode === "identity" || viewMode === "reviewer") {
            if (!identityReviewsLoaded) {
                const fetchReviews = async () => {
                    const reviews = await getAggregatesByType({ itemType: "identity" });
                    setReviews(p => ({ ...p, ...reviews }));

                    if (user) {
                        const userReviews = await getUserReviews({ userId: user.id, itemType: "identity" })
                        setUserReviews(p => ({ ...p, ...userReviews }));
                    }
                    setIdentityReviewsLoaded(true);
                }

                fetchReviews();
            }
        }

        if (viewMode === "ego" || viewMode === "reviewer") {
            if (!egoReviewsLoaded) {
                const fetchReviews = async () => {
                    const reviews = await getAggregatesByType({ itemType: "ego" });
                    setReviews(p => ({ ...p, ...reviews }));

                    if (user) {
                        const userReviews = await getUserReviews({ userId: user.id, itemType: "ego" })
                        setUserReviews(p => ({ ...p, ...userReviews }));
                    }
                    setEgoReviewsLoaded(true);
                }

                fetchReviews();
            }
        }
    }, [viewMode, loading, identityReviewsLoaded, egoReviewsLoaded, user]);

    const changeTab = tab => {
        setViewMode(tab);
        const params = new URLSearchParams();
        params.set('tab', String(tab));

        window.history.replaceState(window.history.state, "", `/rankings?${params.toString()}`);
    }

    if (loading || identitiesLoading || egosLoading) return <LoadingContentPageTemplate />

    const userReviewProps = user ? {
        userReviews: userReviews,
        userReviewsRef: userReviewsRef,
        setUserReviews: setUserReviews
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
            <div className={`tab-header ${viewMode === "identity" ? "active" : ""}`} onClick={() => changeTab("identity")}>Identities</div>
            <div className={`tab-header ${viewMode === "ego" ? "active" : ""}`} onClick={() => changeTab("ego")}>E.G.Os</div>
            <div className={`tab-header ${viewMode === "reviewer" ? "active" : ""}`} onClick={() => changeTab("reviewer")}>Reviewers</div>
        </h2>

        <HorizontalDivider />

        {viewMode === "identity" || viewMode === "ego" ?
            <GlobalRankingDisplay
                viewMode={viewMode} rankingMode={rankingMode}
                identities={identities} egos={egos}
                reviews={reviews} setReviews={setReviews} reviewsRef={reviewsRef}
                {...userReviewProps}
                searchString={searchString} filters={filters} minRatings={minRatings}
                strictFiltering={strictFiltering} separateByPoint={separateByPoint}
                globalRanking={globalRanking} showBreakdown={showBreakdown}
            /> :
            <ReviewerDisplay
                rankingMode={rankingMode}
                identities={identities} egos={egos}
                reviews={reviews} setReviews={setReviews} reviewsRef={reviewsRef}
                {...userReviewProps}
                searchString={searchString} filters={filters}
                strictFiltering={strictFiltering} separateByPoint={separateByPoint}
                globalRanking={globalRanking} showBreakdown={showBreakdown}
                initUsername={username}
            />
        }
    </div>
}
