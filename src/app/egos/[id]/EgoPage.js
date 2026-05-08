"use client";

import React, { useEffect, useState } from "react";
import ReactTimeAgo from "react-time-ago";

import TeamBuild from "@/app/components/contentCards/TeamBuild";
import { useSkillData } from "@/app/components/dataHooks/skills";
import { useData } from "@/app/components/DataProvider";
import EgoIcon from "@/app/components/icons/EgoIcon";
import KeywordIcon from "@/app/components/icons/KeywordIcon";
import RarityIcon from "@/app/components/icons/RarityIcon";
import SinnerIcon from "@/app/components/icons/SinnerIcon";
import MarkdownEditorWrapper from "@/app/components/markdown/MarkdownEditorWrapper";
import MarkdownRenderer from "@/app/components/markdown/MarkdownRenderer";
import Slider from "@/app/components/objects/Slider";
import StatsRadarChart from "@/app/components/ratings/RadarChart";
import UptieSelector from "@/app/components/selectors/UptieSelector";
import PassiveCard from "@/app/components/skill/PassiveCard";
import SkillCard from "@/app/components/skill/SkillCard";
import { getGeneralTooltipProps } from "@/app/components/tooltips/GeneralTooltip";
import TooltipTemplate from "@/app/components/tooltips/TooltipTemplate";
import Username from "@/app/components/user/Username";
import { useAuth } from "@/app/database/authProvider";
import { searchBuilds } from "@/app/database/builds";
import { defaultReviewsPageSize, deleteReview, getItemAggregates, getItemReviews, getOverallScore, getReviewScores, getUserReview, submitReview } from "@/app/database/reviews";
import { ColoredResistance } from "@/app/lib/colors";
import { affinities, getSeasonString, sinnerIdMapping } from "@/app/lib/constants";
import { egoCriteria } from "@/app/lib/ratings";
import { constructSkillLabel } from "@/app/lib/skill";
import useLocalState from "@/app/lib/useLocalState";

function RatingTab({ id, showReviews, setShowReviews }) {
    const { user } = useAuth();
    const [userData, setUserData] = useState(null);
    const [globalData, setGlobalData] = useState(null);
    const [rating, setRating] = useState(null);
    const [review, setReview] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [refresh, setRefresh] = useState(true);

    useEffect(() => {
        if (!refresh) return;

        const fetchData = async () => {
            setLoading(true);
            const userData = user ? await getUserReview({ userId: user.id, itemType: "ego", itemId: id }) : null;
            const globalData = await getItemAggregates({ itemType: "ego", itemId: id });

            setUserData(userData);
            setGlobalData(globalData);
            setRefresh(false);
            setLoading(false);
        }

        fetchData();
    }, [user, id, refresh]);

    if (loading) return <span style={{ color: "var(--disabled-text-color)", textAlign: "center" }}>Loading Rating...</span>;

    const rateButton =
        user ?
            <button onClick={() => {
                if (userData) {
                    setRating(getReviewScores(userData));
                    setReview(userData.review_text ?? "");
                } else {
                    setRating(Array.from({ length: 5 }, () => 0))
                    setReview("");
                }
            }}>
                {userData ? "Edit Rating" : "Create Rating"}
            </button> :
            <span>Login to submit a rating</span>

    const submitRating = async rating => {
        setSubmitting(true);

        const result = await submitReview({
            itemType: "ego",
            itemId: id,
            criteria1: rating[0],
            criteria2: rating[1],
            criteria3: rating[2],
            criteria4: rating[3],
            criteria5: rating[4],
            reviewText: review?.trim() || null,
        });

        setUserData(result);
        setRating(null);
        setReview("");
        setRefresh(true);
        setSubmitting(false);
    }

    const deleteRating = async () => {
        setSubmitting(true);
        await deleteReview({ itemType: "ego", itemId: id });
        setRefresh(true);
        setSubmitting(false);
    }


    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", maxWidth: "100%" }}>
        {globalData ?
            <StatsRadarChart type={"ego"} globalData={globalData.rating} userData={rating ?? getReviewScores(userData)} /> :
            <span>No ratings yet. Be the first to rate this E.G.O!</span>
        }
        {
            rating ?
                <>
                    <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "0.2rem", textAlign: "center", alignItems: "center" }}>
                        <span>Overall Rating</span>
                        <span>{getOverallScore(rating).toFixed(2)}</span>
                        {
                            egoCriteria.map(({ label, desc }, i) => <React.Fragment key={label}>
                                <div>
                                    <span {...getGeneralTooltipProps(desc)} className="hover-text">{label}</span>
                                </div>
                                <Slider
                                    value={rating[i]} onChange={v => setRating(p => p.map((pv, j) => i === j ? v : pv))}
                                    min={0} max={10} step={1} compressed={true} sliderWidth={75}
                                />
                            </React.Fragment>)
                        }
                    </div>
                    <span>Consider leaving a review</span>
                    <div style={{ width: "100%" }}>
                        <MarkdownEditorWrapper
                            value={review}
                            onChange={v => setReview(v)}
                            placeholder={"Review for this E.G.O (optional)..."}
                            mini={true} short={true}
                        />
                    </div>
                    <div>
                        <button onClick={() => { setRating(null); setReview(""); }} disabled={submitting}>Cancel</button>
                        <button onClick={() => submitRating(rating)} disabled={submitting}>Submit Rating</button>
                    </div>
                </> :
                <>
                    {globalData ?
                        <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "0.5rem", textAlign: "center" }}>
                            <span>Total Votes</span>
                            <span>{globalData.votes}</span>
                            <span>Overall Rating</span>
                            <span>{getOverallScore(globalData.rating).toFixed(2)}</span>
                            {
                                egoCriteria.map(({ label }, i) => <React.Fragment key={label}>
                                    <span>{label}</span>
                                    <span>{globalData.rating[i].toFixed(2)}</span>
                                </React.Fragment>)
                            }
                        </div> :
                        null
                    }
                    <div>
                        {user && userData &&
                            <button onClick={deleteRating} disabled={submitting}>
                                Delete Rating
                            </button>
                        }
                        {rateButton}
                        {globalData &&
                            <button onClick={() => setShowReviews(p => !p)}>{showReviews ? "Hide Reviews" : "Show Reviews"}</button>
                        }
                    </div>
                </>
        }
    </div >
}

function NotesTab({ notes }) {
    if (!notes || !notes.main) return <div style={{ color: "var(--disabled-text-color)", textAlign: "center" }}>Not yet available...</div>;
    if (!notes.other)
        return <div style={{ display: "flex", flexDirection: "column" }}>
            {notes.main.map((str, i) => <div key={i} style={{ display: "flex", flexDirection: "row", gap: "0.25rem", lineHeight: "1.4" }}>
                • <MarkdownRenderer content={str} />
            </div>)}
        </div>

    return <div style={{ display: "flex", flexDirection: "column" }}>
        <div className="sub-text">Main</div>
        {notes.main.map((str, i) => <div key={i} style={{ display: "flex", flexDirection: "row", gap: "0.25rem", lineHeight: "1.4" }}>
            • <MarkdownRenderer content={str} />
        </div>)}
        <div style={{ height: "0.5rem" }} />
        <div className="sub-text">Other</div>
        {notes.other.map((str, i) => <div key={i} style={{ display: "flex", flexDirection: "row", gap: "0.25rem", lineHeight: "1.4" }}>
            • <MarkdownRenderer content={str} />
        </div>)}
    </div>
}

function BuildsTab({ builds }) {
    if (!builds) return <div style={{ color: "var(--disbled-text-color)", textAlign: "center" }}>Loading builds...</div>;
    if (builds.length === 0) return <div style={{ color: "var(--disbled-text-color)", textAlign: "center" }}>No builds found.</div>;
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: "14px" }}>
        {builds.map(build => <TeamBuild key={build.id} build={build} size={"M"} complete={false} />)}
    </div>
}

function SkillsTab({ awakeningSkills, preAwakeningSkills, corrosionSkills, preCorrosionSkills, passives, prePassives, compareMode, preuptie }) {
    return <div style={{ display: "flex", flexDirection: "column", minWidth: "min(480px, 100%)", flex: 1, gap: "0.5rem" }}>
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
            {awakeningSkills.map((skill, i) => <div key={i} style={{ flex: 1, minWidth: "min(300px, 100%)" }}>
                <SkillCard skill={skill.data} label={constructSkillLabel("awakening")} pre={compareMode ? preAwakeningSkills[i].data : null} />
            </div>)}
        </div>
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
            {corrosionSkills.map((skill, i) => <div key={i} style={{ flex: 1, minWidth: "min(300px, 100%)" }}>
                <SkillCard skill={skill.data} label={constructSkillLabel("corrosion")} pre={compareMode ? preCorrosionSkills[i].data : null} />
            </div>)}
        </div>
        {passives.length > 0 ?
            <div style={{ display: "flex", flexDirection: "column" }}>
                <div className="title-text">Passives</div>
                {passives.map((passive, i) => {
                    if (compareMode && preuptie < 2)
                        return <PassiveCard key={i} passive={passive} background={"rgba(46, 160, 67, 0.35)"} />
                    return <PassiveCard key={i} passive={passive} pre={compareMode ? prePassives[i] : null} />
                })}
            </div> :
            null
        }
    </div>
}

function ReviewsTab({ id, setShowReviews }) {
    const [page, setPage] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReviews = async () => {
            setLoading(true);
            const fetchedReviews = await getItemReviews({ itemType: "ego", itemId: id, page: page });

            setReviews(fetchedReviews);
            setLoading(false);
        }

        loadReviews();
    }, [page, id]);

    if (loading)
        return <span style={{ color: "var(--disabled-text-color)", textAlign: "center", minWidth: "min(480px, 100%)", flex: 1 }}>
            Loading Reviews...
        </span>;

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: "min(480px, 100%)", flex: 1 }}>
        <div>
            <button onClick={() => setShowReviews(false)}>Hide Reviews</button>
        </div>
        {
            reviews.map(review => <div key={review.id} className="panel-container">
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    <StatsRadarChart type={"ego"} userData={getReviewScores(review)} includeLabels={false} scale={.5} />
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.1rem" }}>
                        <span>by <Username username={review.user?.username} data={review} /> • <ReactTimeAgo date={review.updated_at} locale="en-US" timeStyle="mini" /></span>
                        <MarkdownRenderer content={review.review_text} />
                    </div>
                </div>
            </div>)
        }
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", alignSelf: "end" }}>
            <button className="page-button" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</button>
            {page}
            <button className="page-button" disabled={reviews.length < defaultReviewsPageSize} onClick={() => setPage(p => p + 1)}>Next</button>
        </div>
    </div>
}

export default function EgoPage({ params }) {
    const { id } = React.use(params);
    const [egos, egosLoading] = useData("egos");
    const [uptie, setUptie] = useState(4);
    const [preuptie, setPreuptie] = useState(1);
    const [activeTab, setActiveTab] = useLocalState("egoActiveTab", "notes");
    const [builds, setBuilds] = useState(null);
    const [compareMode, setCompareMode] = useState(false);
    const [showReviews, setShowReviews] = useState(false);

    const egoData = egosLoading ? null : egos[id];
    const { awakeningSkills: preAwakeningSkills, corrosionSkills: preCorrosionSkills, passives: prePassives } = useSkillData("ego", id, preuptie);
    const { awakeningSkills, corrosionSkills, passives, notes } = useSkillData("ego", id, uptie);

    useEffect(() => {
        const fetchBuilds = async () => {
            setBuilds(await searchBuilds({ "egos": [id], published: true, sortBy: "popular" }, 1, 6) || []);
        }

        if (activeTab === "builds" && !builds) fetchBuilds();
    }, [activeTab, builds, id])

    if (egosLoading) return null;

    if (!egoData) return <span className="title-text">E.G.O not found</span>

    const handleSetUptie = (v) => {
        if (v === "compare mode") setCompareMode(true);
        else {
            setUptie(v);
            if (v < preuptie) setPreuptie(v);
        }
    }

    const handleSetPreuptie = (v) => {
        setPreuptie(v);
        if (v > uptie) setUptie(v);
    }

    return <>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "row", width: "100%", flexWrap: "wrap", justifyContent: "center", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", width: "min(480px, 100%)" }}>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%" }}>
                        <RarityIcon rarity={egoData.rank.toLowerCase()} style={{ display: "inline", height: "2rem" }} />
                        <div style={{ display: "flex", flexDirection: "column", fontSize: "1.2rem", fontWeight: "bold", alignItems: "center" }}>
                            <span>{sinnerIdMapping[egoData.sinnerId]}</span>
                            <span>{egoData.name}</span>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem", justifyContent: "center", padding: "0.5rem" }}>
                        <SinnerIcon num={egoData.sinnerId} style={{ width: "40px", height: "40px" }} />
                        Threadspin: {compareMode ?
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <UptieSelector value={preuptie} setValue={handleSetPreuptie} />
                                ➔
                                <UptieSelector value={uptie} setValue={handleSetUptie} />
                            </div> :
                            <UptieSelector value={uptie} setValue={handleSetUptie} bottomOption={"compare mode"} />
                        }
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                        <EgoIcon ego={egoData} type={"awaken"} style={{ width: "192px", height: "auto" }} />
                        {"corrosionType" in egoData ? <EgoIcon ego={egoData} type={"erosion"} style={{ width: "192px", height: "auto" }} /> : null}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", border: "1px var(--secondary-border-color) solid", padding: "0.2rem" }}>
                            <span>Release Date</span>
                            <span>{egoData.date}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", border: "1px var(--secondary-border-color) solid", padding: "0.2rem" }}>
                            <span>Season</span>
                            <span>{getSeasonString(egoData.season)}</span>
                        </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", alignItems: "center", textAlign: "center", lineHeight: "1.5" }}>
                        <div style={{ height: "100%", borderLeft: "1px var(--secondary-border-color) solid", borderBottom: "1px var(--secondary-border-color) solid" }}></div>
                        <div style={{ height: "100%", borderBottom: "1px var(--secondary-border-color) solid" }}>Cost</div>
                        <div style={{ height: "100%", borderRight: "1px var(--secondary-border-color) solid", borderBottom: "1px var(--secondary-border-color) solid" }}>Resist</div>
                        {affinities.map(affinity => [
                            <div key={`${affinity}-icon`} style={{ display: "flex", height: "100%", justifyContent: "center", borderLeft: "1px var(--secondary-border-color) solid", borderBottom: "1px var(--secondary-border-color) solid" }}>
                                <KeywordIcon id={affinity} />
                            </div>,
                            <span key={`${affinity}-cost`} style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", borderBottom: "1px var(--secondary-border-color) solid" }}>
                                {affinity in egoData.cost ? egoData.cost[affinity] : <span style={{ color: "var(--disabled-text-color)" }}>0</span>}
                            </span>,
                            <span key={`${affinity}-res`} style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", borderRight: "1px var(--secondary-border-color) solid", borderBottom: "1px var(--secondary-border-color) solid" }}>
                                {<ColoredResistance resist={egoData.resists[affinity]} />}
                            </span>
                        ])}
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", gap: "0.2rem" }}>
                        <div style={{ overflowX: "auto", alignSelf: "center", maxWidth: "100%", paddingBottom: "0.5rem" }}>
                            <div style={{ display: "flex", gap: "1rem", width: "max-content" }}>
                                <div
                                    {...getGeneralTooltipProps("Community voted rating of the E.G.O")}
                                    className={`tab-header ${activeTab === "rating" ? "active" : ""}`}
                                    style={{ fontSize: "1rem" }} onClick={() => setActiveTab("rating")}>
                                    Community Rating
                                </div>
                                <div data-tooltip-id="ego-notes" className={`tab-header ${activeTab === "notes" ? "active" : ""}`} style={{ fontSize: "1rem" }} onClick={() => setActiveTab("notes")}>Notes/Explanation</div>
                                <div
                                    {...getGeneralTooltipProps("Loads the most popular builds that use this E.G.O.")}
                                    className={`tab-header ${activeTab === "builds" ? "active" : ""}`}
                                    style={{ fontSize: "1rem" }} onClick={() => setActiveTab("builds")}>
                                    Popular Builds
                                </div>
                            </div>
                        </div>
                        <TooltipTemplate id="ego-notes" contentFunc={() => <div style={{ padding: "0.5rem" }}>
                            This section is only meant to contain details about the E.G.O&apos;s mechanics.
                            <br />
                            It will generally not contain things such as:
                            <ul>
                                <li>Meta analysis</li>
                                <li>Comparisons to other E.G.Os</li>
                                <li>Rankings</li>
                                <li>Combos with other identities/E.G.Os (unless explicitly stated in their respective kits)</li>
                                <li>Hyper optimizations and special use cases</li>
                                <li>And so on...</li>
                            </ul>
                        </div>}
                        />
                        {
                            activeTab === "notes" ?
                                <NotesTab notes={notes} /> :
                                activeTab === "rating" ?
                                    <RatingTab id={id} showReviews={showReviews} setShowReviews={setShowReviews} /> :
                                    <BuildsTab builds={builds} />
                        }
                    </div>
                </div>

                {showReviews ?
                    <ReviewsTab id={id} setShowReviews={setShowReviews} /> :
                    <SkillsTab
                        awakeningSkills={awakeningSkills} preAwakeningSkills={preAwakeningSkills}
                        corrosionSkills={corrosionSkills} preCorrosionSkills={preCorrosionSkills}
                        passives={passives} prePassives={prePassives}
                        compareMode={compareMode} preuptie={preuptie}
                    />
                }
            </div>
        </div>
    </>
}
