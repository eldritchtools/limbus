"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import React, { useEffect, useMemo, useRef, useState } from "react";

import { useData } from "../components/DataProvider";
import EgoIcon from "../components/icons/EgoIcon";
import IdentityIcon from "../components/icons/IdentityIcon";
import { useModal } from "../components/modals/ModalProvider";
import NoPrefetchLink from "../components/NoPrefetchLink";
import { HorizontalDivider } from "../components/objects/Dividers";
import DropdownButton from "../components/objects/DropdownButton";
import { LoadingContentPageTemplate } from "../components/pageTemplates/ContentPageTemplate";
import StatsRadarChart from "../components/ratings/RadarChart";
import IconsSelector from "../components/selectors/IconsSelector";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { getRatingHelpTooltipProps } from "../components/tooltips/RatingHelpTooltip";
import { getRatingTooltipProps } from "../components/tooltips/RatingTooltip";
import { useAuth } from "../database/authProvider";
import { getAggregatesByType, getOverallScore, getReviewScores, getUserReviewsByType } from "../database/reviews";
import { checkFilterMatch, filterByFilters } from "../lib/filter";
import { egoCriteria, identityCriteria } from "../lib/ratings";
import useLocalState from "../lib/useLocalState";

function ItemDisplay({ type, item, rank, rankingScore, communityScore, communityReviewsRef, userScore, userReviewsRef, showBreakdown, onChange }) {
    const { openRatingModal } = useModal();
    const { isMobile } = useBreakpoint();

    const props = communityScore ? getRatingTooltipProps(type, communityScore, userScore) : {};
    const getUserReviews = () => userReviewsRef?.current;
    const getCommunityReviews = () => communityReviewsRef.current;

    props.onClick = () => openRatingModal({
        type: type, id: item.id,
        getCommunityReviews: getCommunityReviews, getUserReviews: getUserReviews, onChange: onChange
    })

    const icon = useMemo(() => {
        return <div style={{ position: "relative", width: "100%" }}>
            {type === "identity" ?
                <IdentityIcon identity={item} uptie={4} displayName={true} displayRarity={true} /> :
                <EgoIcon ego={item} type={"awaken"} displayName={true} displayRarity={true} />
            }
            {rank && <div style={{
                position: "absolute", top: 5, right: 5,
                padding: "2px 4px", borderRadius: "8px",
                background: "rgba(0, 0, 0, 0.7)", backdropFilter: "blur(6px)",
                fontWeight: "bold", fontSize: "1.2rem", lineHeight: 1, color: "#ddd"
            }}>
                #{rank}
            </div>
            }
        </div>
    },
        [type, item, rank]
    )

    if (!rank)
        return <div {...props} style={{ cursor: "pointer" }}>
            {icon}
        </div>;

    const scoreComponent = <span style={{ textAlign: "center" }}>Score: {rankingScore.toFixed(2)}</span>;
    const ratingsComponent = <span style={{ textAlign: "center" }}>User Ratings: {communityScore.votes}</span>;
    const size = isMobile ? 92 : 128;
    const scale = isMobile ? 0.5 : 0.7;

    if (showBreakdown)
        return <div {...props}
            style={{ display: "grid", gridTemplateColumns: `repeat(2, ${size}px)`, alignItems: "center", justifyContent: "center", cursor: "pointer" }}
        >
            {icon}
            <StatsRadarChart type={type} globalData={communityScore?.rating} userData={userScore?.rating} includeLabels={false} scale={scale} />
            {ratingsComponent}
            {scoreComponent}
        </div>
    else
        return <div {...props} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem", cursor: "pointer" }}>
            {icon}
            {scoreComponent}
            {ratingsComponent}
        </div>
}

function RankingDisplay({
    viewMode, rankingMode,
    identities, egos,
    identityReviews, identityReviewsRef, userIdentityReviews, userIdentityReviewsRef,
    egoReviews, egoReviewsRef, userEgoReviews, userEgoReviewsRef,
    setIdentityReviews, setEgoReviews, setUserIdentityReviews, setUserEgoReviews,
    searchString, filters,
    strictFiltering, separateByPoint, globalRanking, showBreakdown
}) {
    const { isMobile } = useBreakpoint();

    const items = useMemo(() => {
        if (viewMode === "identity" && !identityReviews) return [];
        if (viewMode === "ego" && !egoReviews) return [];

        const filtered = [];
        const rankableItems = [];
        const ranks = {};

        const getScore = rankingMode === "overall" ?
            ((id, reviewList) => id in reviewList ? reviewList[id].overallRating : null) :
            ((id, reviewList) => id in reviewList ? reviewList[id].rating[rankingMode] : null)

        const sortFunction = ([ca, ua, xa], [cb, ub, xb]) => {
            if (ca === cb) {
                if (ua === ub) return xa.sinnerId === xb.sinnerId ? xb.id.localeCompare(xa.id) : xa.sinnerId - xb.sinnerId;
                if (ua === null) return 1;
                if (ub === null) return -1;
                return ub - ua;
            }
            if (ca === null) return 1;
            if (cb === null) return -1;
            return cb - ca;
        }

        if (viewMode === "identity") {
            filtered.push(...filterByFilters("identity",
                Object.values(identities),
                filters,
                identity => {
                    if (searchString.length > 0 && !checkFilterMatch(searchString, identity.name)) return false;
                    return true;
                },
                strictFiltering
            )
                .map(identity => [getScore(identity.id, identityReviews), getScore(identity.id, userIdentityReviews ?? {}), identity])
                .sort(sortFunction)
            )

            if (globalRanking) {
                Object.keys(identities).forEach(id => {
                    if (id in identityReviews) rankableItems.push([getScore(id, identityReviews), id]);
                })
            } else {
                filtered.forEach(([cs, , identity]) => {
                    if (cs !== null) rankableItems.push([cs, identity.id]);
                })
            }
        }

        if (viewMode === "ego") {
            filtered.push(...filterByFilters("ego",
                Object.values(egos),
                filters,
                ego => {
                    if (searchString.length > 0 && !checkFilterMatch(searchString, ego.name)) return false;
                    return true;
                },
                strictFiltering
            )
                .map(ego => [getScore(ego.id, egoReviews), getScore(ego.id, userEgoReviews ?? {}), ego])
                .sort(sortFunction)
            )

            if (globalRanking) {
                Object.keys(egos).forEach(id => {
                    if (id in egoReviews) rankableItems.push([getScore(id, egoReviews), id]);
                })
            } else {
                filtered.forEach(([cs, , ego]) => {
                    if (cs !== null) rankableItems.push([cs, ego.id]);
                })
            }
        }

        rankableItems.sort((a, b) => b[0] - a[0]);

        let currentRank, lastScore;
        for (let i = 0; i < rankableItems.length; i++) {
            if (rankableItems[i][0] !== lastScore) {
                currentRank = i + 1;
                lastScore = rankableItems[i][0];
            }

            ranks[rankableItems[i][1]] = currentRank;
        }

        for (let i = 0; i < filtered.length; i++) {
            filtered[i].push(ranks[filtered[i][2].id] ?? null);
        }

        if (separateByPoint) {
            return filtered.reduce((acc, item) => {
                if (item[0] === null) {
                    if ("none" in acc) acc["none"].push(item);
                    else acc["none"] = [item];
                } else {
                    const t = Math.floor(item[0]);
                    if (t in acc) acc[t].push(item);
                    else acc[t] = [item]
                }
                return acc;
            }, {});
        }

        return filtered;
    }, [
        identities, egos, viewMode, rankingMode,
        identityReviews, userIdentityReviews,
        egoReviews, userEgoReviews,
        strictFiltering, searchString,
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

    const itemWidth = isMobile ? 92 : 128;
    const widthMultiplier = showBreakdown ? 2 : 1;

    const contentDisplay = () => {
        const listToComponents = (list, multiplier, bottomBorder) =>
            <div style={{
                display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${itemWidth * (multiplier ? widthMultiplier : 1)}px, 1fr))`,
                width: "100%", gap: "0.5rem",
                paddingBottom: bottomBorder ? "0.5rem" : null,
                borderBottom: bottomBorder ? "2px var(--secondary-border-color) solid" : null
            }}>
                {list.map(([cs, , item, rank]) =>
                    <ItemDisplay
                        key={item.id} type={viewMode} item={item} rank={rank} rankingScore={cs}
                        communityScore={viewMode === "identity" ? identityReviews[item.id] : egoReviews[item.id]}
                        communityReviewsRef={viewMode === "identity" ? identityReviewsRef : egoReviewsRef}
                        userScore={viewMode === "identity" ? userIdentityReviews?.[item.id] : userEgoReviews?.[item.id]}
                        userReviewsRef={viewMode === "identity" ? userIdentityReviewsRef : userEgoReviewsRef}
                        showBreakdown={showBreakdown} onChange={x => onChange(item.id, x)}
                    />
                )}
            </div>

        if (separateByPoint) {
            return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "100%" }}>
                {Object.entries(items)
                    .filter(([threshold]) => threshold !== "none")
                    .sort((a, b) => b[0] - a[0])
                    .map(([threshold, list]) =>
                        <React.Fragment key={threshold}>
                            <div className="title-text" style={{ paddingBottom: "0.5rem", borderBottom: "2px var(--secondary-border-color) solid", textAlign: "center" }}>
                                {threshold}{threshold === "10" ? "" : "+"}
                            </div>
                            {listToComponents(list, true, true)}
                        </React.Fragment>
                    )
                }
                {items["none"]?.length > 0 && <>
                    <div className="title-text" style={{ paddingBottom: "0.5rem", borderBottom: "2px var(--secondary-border-color) solid", textAlign: "center" }}>
                        Unranked
                    </div>
                    {("none" in items) && listToComponents(items["none"], false, false)}
                </>
                }
            </div>
        } else {
            const [ranked, unranked] = items.reduce(([r, u], item) => {
                if (item[0] === null) u.push(item);
                else r.push(item);
                return [r, u];
            }, [[], []]);

            return <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
                {listToComponents(ranked, true, false)}
                {unranked.length > 0 && <>
                    <span className="title-text">Unranked</span>
                    {listToComponents(unranked, false, false)}
                </>
                }
            </div>
        }
    }

    if (viewMode === "identity" && !identityReviews) return <span>Loading...</span>;
    if (viewMode === "ego" && !egoReviews) return <span>Loading...</span>;

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.5rem", width: "100%" }}>
        {contentDisplay()}
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

export default function CompanyPage() {
    const { user, loading } = useAuth();
    const [identities, identitiesLoading] = useData("identities");
    const [egos, egosLoading] = useData("egos");
    const [viewMode, setViewMode] = useLocalState("rankingViewMode", "identity");
    const [rankingMode, setRankingMode] = useState("overall");

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
                    const userReviews = await getUserReviewsByType({ userId: user.id, itemType: "identity" })
                    setUserIdentityReviews(userReviews);
                }
            }

            fetchReviews();
        } else {
            if (egoReviews) return;
            const fetchReviews = async () => {
                const reviews = await getAggregatesByType({ itemType: "ego" });
                setEgoReviews(reviews);

                if (user) {
                    const userReviews = await getUserReviewsByType({ userId: user.id, itemType: "ego" })
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

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
        <h2 style={{ margin: 0 }}>Community Rankings</h2>
        <span style={{ maxWidth: "1000px", textAlign: "left" }}>
            See how the community ranks the identities and E.G.Os in the game. Rankings are calculated from community-submitted ratings at the time the page loads. Refresh if you want to update the rankings.
            <br /> <br />
            Click on the identity or E.G.O to submit your own rating or leave a review. You can also visit their respective pages and check the &quot;Community Rating&quot; tab.
            <br /> <br />
            Please remember that everyone experiences the game differently. Your personal experience may not align with the community average. Be respectful when there are disagreements.
            <br /> <br />
            This page is still an early version and may receive design overhauls and quality-of-life improvements over time. Feel free to share suggestions through the Discord server or the <NoPrefetchLink href={"/feedback"} className="text-link">feedback</NoPrefetchLink> page.
        </span>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", alignItems: "center", justifyContent: "center", gap: "0.5rem", maxWidth: "350px" }}>
                <span style={{ textAlign: 'end' }}>Search:</span>
                <input type="text" placeholder="Search..." value={searchString} onChange={(e) => setSearchString(e.target.value)} />
                <span {...getRatingHelpTooltipProps(viewMode)} className="hover-text" style={{ textAlign: 'end' }}>Ranking:</span>
                <div>
                    <RankingDropdown viewMode={viewMode} rankingMode={rankingMode} setRankingMode={setRankingMode} />
                </div>
                <div />
                <label style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    <input type="checkbox" checked={separateByPoint} onChange={e => setSeparateByPoint(e.target.checked)} />
                    Separate by Point Thresholds
                </label>
                <div />
                <label style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
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

            {viewMode === "identity" ?
                <IconsSelector type={"column"} categories={["identityTier", "sinner", "status", "affinity", "skillType"]} values={filters} setValues={setFilters} /> :
                <IconsSelector type={"column"} categories={["egoTier", "sinner", "status", "affinity", "atkType"]} values={filters} setValues={setFilters} />
            }
        </div>

        <h2 style={{ display: "flex", marginBottom: "1rem", gap: "1rem" }}>
            <div className={`tab-header ${viewMode === "identity" ? "active" : ""}`} onClick={() => setViewMode("identity")}>Identities</div>
            <div className={`tab-header ${viewMode === "ego" ? "active" : ""}`} onClick={() => setViewMode("ego")}>E.G.Os</div>
        </h2>

        <HorizontalDivider />

        <RankingDisplay
            viewMode={viewMode} rankingMode={rankingMode}
            identities={identities} egos={egos}
            identityReviews={identityReviews} egoReviews={egoReviews}
            setIdentityReviews={setIdentityReviews} setEgoReviews={setEgoReviews}
            identityReviewsRef={identityReviewsRef} egoReviewsRef={egoReviewsRef}
            {...userReviewProps}
            searchString={searchString} filters={filters}
            strictFiltering={strictFiltering} separateByPoint={separateByPoint}
            globalRanking={globalRanking} showBreakdown={showBreakdown}
        />
    </div>
}
