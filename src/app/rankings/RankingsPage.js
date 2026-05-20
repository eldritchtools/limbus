"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

import RankingDisplay from "./RankingDisplay";
import { rankingsFilter } from "./rankingsFilter";
import { useData } from "../components/DataProvider";
import Avatar from "../components/icons/Avatar";
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
    setUserReviews(p => ({ ...p, [id]: { ...x, overallRating: getOverallScore(scores), rating: scores } }));
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
    const [altNames, altNamesLoading] = useData("alt_names");

    const items = useMemo(() => rankingsFilter({
        type: viewMode, reviews, userReviews,
        rankingMode, identities, egos, minRatings: MIN_RATINGS_MAPPING[minRatings],
        filters, searchString, globalRanking, strictFiltering, separateByPoint,
        altNames: altNamesLoading ? null : altNames
    }), [
        identities, egos, viewMode, rankingMode,
        reviews, userReviews,
        strictFiltering, searchString, minRatings,
        filters, separateByPoint, globalRanking,
        altNames, altNamesLoading
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
    username
}) {
    const [altNames, altNamesLoading] = useData("alt_names");
    const { user, profile } = useAuth();
    const [topReviewers, setTopReviewers] = useState([]);
    const [otherReviewers, setOtherReviewers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUserReviews, setSelectedUserReviews] = useState({});
    const [userInput, setUserInput] = useState(username ?? "");
    const [message, setMessage] = useState("");
    const [selectedReview, setSelectedReview] = useState(null);
    const router = useRouter();

    const reviewersMapping = useMemo(() => {
        const mapping = {};
        topReviewers.forEach(reviewer => { mapping[reviewer.username] = { id: reviewer.user_id, avatarId: reviewer.avatar_id } });
        otherReviewers.forEach(reviewer => { mapping[reviewer.username] = { id: reviewer.user_id, avatarId: reviewer.avatar_id } });
        return mapping;
    }, [topReviewers, otherReviewers]);

    useEffect(() => {
        if (!loading || topReviewers.length > 0) return;
        const loadReviewers = async () => {
            const result = await getPopularReviewers();
            setTopReviewers(result.filter(x => x.username && x.total_bumps > 0));
            setLoading(false);
        }

        loadReviewers();
    }, [loading, topReviewers]);

    useEffect(() => {
        if (!username) {
            setSelectedUserReviews([]);
            return;
        }

        setUserInput(username);

        const loadReviews = async () => {
            let userId = reviewersMapping[username]?.id;
            if (!userId) {
                const fetched = await getUserDataFromUsername(username, "id, avatar_id");
                if (fetched) {
                    setOtherReviewers(p => ([...p, { user_id: fetched.id, username: username, avatar_id: fetched.avatar_id }]));
                    userId = fetched.id;
                    setUserInput(username);
                    setMessage("");
                } else {
                    setMessage("Username not found!")
                    setLoading(false);
                    return;
                }
            }

            const result = await getUserReviews({ userId });
            const processedResult = Object.entries(result).reduce((acc, [id, review]) => {
                acc[id] = { ...review, votes: 1 };
                return acc;
            }, {});

            setSelectedUserReviews(processedResult);
            setLoading(false);
        }

        loadReviews();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [username, router]);

    const setSelectedUser = async (username) => {
        const params = new URLSearchParams();
        params.set("tab", "reviewer");
        if (username) params.set("username", username);

        router.push(`/rankings?${params.toString()}`, { scroll: false });
    }

    const selectedId = useMemo(() => reviewersMapping[username]?.id, [reviewersMapping, username]);

    const items = useMemo(() => {
        return rankingsFilter({
            type: "both", reviews: user && selectedId === user.id ? userReviews : selectedUserReviews,
            rankingMode, identities, egos,
            filters, searchString, globalRanking, strictFiltering, separateByPoint,
            userReviews, altNames: altNamesLoading ? null : altNames
        })
    }, [
        selectedUserReviews, selectedId, user, userReviews,
        identities, egos, rankingMode,
        strictFiltering, searchString,
        filters, separateByPoint, globalRanking,
        altNames, altNamesLoading
    ]);

    if (loading) return <LoadingContentPageTemplate />;

    if (selectedId) {
        const additionalProps = user && selectedId === user.id ?
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
                <button onClick={() => { setSelectedUser(null); setSelectedReview(null); }}>Go Back</button>
                <h2 className="title-text" style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    <Avatar avatarId={reviewersMapping[username].avatarId} size={32} />
                    {username}&apos;s Ranking
                </h2>
            </div>
            {user && selectedId === user.id &&
                <span className="sub-text" style={{ textAlign: "center" }}>
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
                onKeyDown={e => { if (e.key === 'Enter') setSelectedUser(userInput); }}
            />
            <button onClick={() => setSelectedUser(userInput)} disabled={loading}>Search</button>
            {user &&
                <button onClick={() => { setSelectedUser(profile.username); setMessage(""); }}>View my Ranking</button>
            }
        </div>
        <div className="sub-text" style={{ color: uiColors.red }}>{message}</div>
        <h2 className="title-text">or choose from the most popular reviewers</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "0.5rem", width: "min(1300px, 100%)" }}>
            {topReviewers.map(reviewer =>
                <div key={reviewer.user_id} className="text-link"
                    style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}
                    onClick={() => {
                        setSelectedUser(reviewer.username);
                        setLoading(true);
                    }}>
                    <Avatar avatarId={reviewer.avatar_id} size={24} />
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

export default function RankingsPage({ tab, username }) {
    const { user, loading } = useAuth();
    const [identities, identitiesLoading] = useData("identities");
    const [egos, egosLoading] = useData("egos");
    const [storedViewMode, setStoredViewMode] = useLocalState("rankingViewMode", "identity");
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

    const viewMode = useMemo(() => tab ?? storedViewMode, [tab, storedViewMode]);

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
        setStoredViewMode(tab);
        const params = new URLSearchParams();
        params.set('tab', String(tab));

        router.push(`/rankings?${params.toString()}`, { scroll: false });
        // window.history.replaceState(window.history.state, "", `/rankings?${params.toString()}`);
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
        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Community Rankings</h1>
        <p style={{ maxWidth: "1000px", margin: 0 }}>
            View community rankings of Identities and E.G.O based on user ratings and reviews.
        </p>
        <div className="sub-text">
            Click on an Identity or E.G.O to submit your own rating or leave a review.
            <br /> <br />
            Rankings are based on community-submitted ratings when the page loads. Refresh to update results.
            <br /> <br />
            Please remember that everyone experiences the game differently. Your personal experience may not align with the community average. Be respectful when there are disagreements.
        </div>

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
                username={username}
            />
        }
    </div>
}
