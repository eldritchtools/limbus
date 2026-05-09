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
import IconsSelector from "../components/selectors/IconsSelector";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { getRatingHelpTooltipProps } from "../components/tooltips/RatingHelpTooltip";
import { getRatingTooltipProps } from "../components/tooltips/RatingTooltip";
import { useAuth } from "../database/authProvider";
import { getAggregatesByType, getOverallScore, getReviewScores, getUserReviewsByType } from "../database/reviews";
import { checkFilterMatch, filterByFilters } from "../lib/filter";
import { egoCriteria, identityCriteria } from "../lib/ratings";
import useLocalState from "../lib/useLocalState";

function ItemDisplay({ type, item, rank, rankingScore, communityScore, communityReviewsRef, userScore, userReviewsRef, onChange }) {
    const props = communityScore ? getRatingTooltipProps(type, communityScore, userScore) : {};
    const { openRatingModal } = useModal();

    const getUserReviews = () => userReviewsRef.current;
    const getCommunityReviews = () => communityReviewsRef.current;

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.2rem" }}>
        <div
            {...props}
            style={{ position: "relative", width: "100%", cursor: "pointer" }}
            onClick={() => openRatingModal({
                type: type, id: item.id,
                // communityRating: communityScore, userScore: userScore,
                getCommunityReviews: getCommunityReviews, getUserReviews: getUserReviews, onChange: onChange
            })}
        >
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
        {rank && <>
            <span>Score: {rankingScore}</span>
            <span>User Ratings: {communityScore.votes}</span>
        </>
        }
    </div>
}

function RankingDisplay({
    viewMode, rankingMode,
    identities, egos,
    identityReviews, identityReviewsRef, userIdentityReviews, userIdentityReviewsRef,
    egoReviews, egoReviewsRef, userEgoReviews, userEgoReviewsRef,
    setIdentityReviews, setEgoReviews, setUserIdentityReviews, setUserEgoReviews,
    searchString, filters,
    strictFiltering, separateByPoint, globalRanking
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

            const scores = getReviewScores(user);
            const overall = getOverallScore(scores);
            const votesBasis = (global?.votes ?? 0) + (delta > 0 ? 1 : 0);
            return {
                votes: (global?.votes ?? 0) + 1 * delta,
                rating: (global?.ratings ?? Array.from({ length: 5 }, () => 0)).map((score, i) => score + scores[i] / votesBasis * delta),
                overallRating: (global?.overallRating ?? 0) + overall / votesBasis * delta
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

    const contentDisplay = () => {
        const listToComponents = list =>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? 92 : 128}px, 1fr))`, width: "100%", gap: "0.5rem" }}>
                {list.map(([cs, , item, rank]) =>
                    <ItemDisplay
                        key={item.id} type={viewMode} item={item} rank={rank} rankingScore={cs}
                        communityScore={viewMode === "identity" ? identityReviews[item.id] : egoReviews[item.id]}
                        communityReviewsRef={viewMode === "identity" ? identityReviewsRef : egoReviewsRef}
                        userScore={viewMode === "identity" ? userIdentityReviews?.[item.id] : userEgoReviews?.[item.id]}
                        userReviewsRef={viewMode === "identity" ? userIdentityReviewsRef : userEgoReviewsRef}
                        onChange={x => onChange(item.id, x)}
                    />
                )}
            </div>

        if (separateByPoint) {
            return <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
                <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", alignItems: "center", justifyContent: "start", gap: "0.5rem", width: "100%" }}>
                    {Object.entries(items)
                        .filter(([threshold]) => threshold !== "none")
                        .sort((a, b) => b[0] - a[0])
                        .map(([threshold, list]) =>
                            <React.Fragment key={threshold}>
                                <span className="title-text">{threshold}{threshold === "10" ? "" : "+"}</span>
                                {listToComponents(list)}
                            </React.Fragment>
                        )
                    }
                </div>
                <span className="title-text">Unranked</span>
                {("none" in items) && listToComponents(items["none"])}
            </div>
        } else {
            const [ranked, unranked] = items.reduce(([r, u], item) => {
                if (item[0] === null) u.push(item);
                else r.push(item);
                return [r, u];
            }, [[], []]);

            return <div style={{ display: "flex", flexDirection: "column", gap: "1rem", width: "100%" }}>
                {listToComponents(ranked)}
                <span className="title-text">Unranked</span>
                {listToComponents(unranked)}
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
            See how the community ranks the identities and E.G.Os in the game. Rankings are calculated from community-submitted ratings.
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
            strictFiltering={strictFiltering} separateByPoint={separateByPoint} globalRanking={globalRanking}
        />
    </div>
}
