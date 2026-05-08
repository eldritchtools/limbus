"use client";

import React, { useEffect, useState } from "react";
import ReactTimeAgo from "react-time-ago";

import TeamBuild from "@/app/components/contentCards/TeamBuild";
import { useSkillData } from "@/app/components/dataHooks/skills";
import { useData } from "@/app/components/DataProvider";
import Icon from "@/app/components/icons/Icon";
import IdentityIcon from "@/app/components/icons/IdentityIcon";
import KeywordIcon from "@/app/components/icons/KeywordIcon";
import RarityIcon from "@/app/components/icons/RarityIcon";
import SinnerIcon from "@/app/components/icons/SinnerIcon";
import MarkdownEditorWrapper from "@/app/components/markdown/MarkdownEditorWrapper";
import MarkdownRenderer from "@/app/components/markdown/MarkdownRenderer";
import NumberInputWithButtons from "@/app/components/objects/NumberInputWithButtons";
import Slider from "@/app/components/objects/Slider";
import StatsRadarChart from "@/app/components/ratings/RadarChart";
import UptieSelector from "@/app/components/selectors/UptieSelector";
import PassiveCard from "@/app/components/skill/PassiveCard";
import SkillCard from "@/app/components/skill/SkillCard";
import DiffedText from "@/app/components/texts/DiffedText";
import { getGeneralTooltipProps } from "@/app/components/tooltips/GeneralTooltip";
import TooltipTemplate from "@/app/components/tooltips/TooltipTemplate";
import Username from "@/app/components/user/Username";
import { useAuth } from "@/app/database/authProvider";
import { searchBuilds } from "@/app/database/builds";
import { defaultReviewsPageSize, deleteReview, getItemAggregates, getItemReviews, getOverallScore, getReviewScores, getUserReview, submitReview } from "@/app/database/reviews";
import { ColoredResistance } from "@/app/lib/colors";
import { getSeasonString, LEVEL_CAP, sinnerIdMapping } from "@/app/lib/constants";
import { constructDefenseLevel, constructHp, constructSpeed } from "@/app/lib/identity";
import { identityCriteria } from "@/app/lib/ratings";
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
            const userData = user ? await getUserReview({ userId: user.id, itemType: "identity", itemId: id }) : null;
            const globalData = await getItemAggregates({ itemType: "identity", itemId: id });

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
            itemType: "identity",
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
        await deleteReview({ itemType: "identity", itemId: id });
        setRefresh(true);
        setSubmitting(false);
    }

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25rem", maxWidth: "100%" }}>
        {globalData ?
            <StatsRadarChart type={"identity"} globalData={globalData.rating} userData={rating ?? getReviewScores(userData)} /> :
            <span>No ratings yet. Be the first to rate this identity!</span>
        }
        {
            rating ?
                <>
                    <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "0.2rem", textAlign: "center", alignItems: "center" }}>
                        <span>Overall Rating</span>
                        <span>{getOverallScore(rating).toFixed(2)}</span>
                        {
                            identityCriteria.map(({ label, desc }, i) => <React.Fragment key={label}>
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
                            placeholder={"Review for this identity (optional)..."}
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
                                identityCriteria.map(({ label }, i) => <React.Fragment key={label}>
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
    if (!notes || !notes.usage) return <div style={{ color: "var(--disabled-text-color)", textAlign: "center" }}>Not yet available...</div>;
    if (!notes.other)
        return <div style={{ display: "flex", flexDirection: "column" }}>
            {notes.usage.map((str, i) => <div key={i} style={{ display: "flex", flexDirection: "row", gap: "0.25rem", lineHeight: "1.4" }}>
                • <MarkdownRenderer content={str} />
            </div>)}
        </div>

    return <div style={{ display: "flex", flexDirection: "column" }}>
        <div className="sub-text">Usage Tips</div>
        {notes.usage.map((str, i) => <div key={i} style={{ display: "flex", flexDirection: "row", gap: "0.25rem", lineHeight: "1.4" }}>
            • <MarkdownRenderer content={str} />
        </div>)}
        <div style={{ height: "0.5rem" }} />
        <div className="sub-text">Other Details</div>
        {notes.other.map((str, i) => <div key={i} style={{ display: "flex", flexDirection: "row", gap: "0.25rem", lineHeight: "1.4" }}>
            • <MarkdownRenderer content={str} />
        </div>)}
    </div>
}

function BuildsTab({ builds }) {
    if (!builds) return <div style={{ color: "var(--disabled-text-color)", textAlign: "center" }}>Loading builds...</div>;
    if (builds.length === 0) return <div style={{ color: "var(--disabled-text-color)", textAlign: "center" }}>No builds found.</div>;
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", marginLeft: "14px" }}>
        {builds.map(build => <TeamBuild key={build.id} build={build} size={"M"} complete={false} />)}
    </div>
}

function SkillsTab({ identityData, level, skills, preSkills, combatPassives, supportPassives, passivesPreMapping, compareMode }) {
    return <div style={{ display: "flex", flexDirection: "column", minWidth: "min(480px, 100%)", flex: 1, gap: "0.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "0.5rem" }}>
            {[1, 2, 3, 4].map(tier => {
                const list = identityData.skillTypes.filter(skill => skill.type.tier === tier);
                if (list.length === 0) return null;
                return <div key={tier} style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
                    {list.map((skill, index) => skills[skill.id] ? <div key={skill.id} style={{ flex: 1, minWidth: "min(400px, 100%)" }}>
                        <SkillCard
                            skill={skills[skill.id].data}
                            count={skill.num} level={level}
                            label={constructSkillLabel("attack", tier, index)}
                            pre={compareMode ? (preSkills[skill.id]?.data ?? {}) : null}
                        />
                    </div> : null)}
                </div>
            })}
            <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
                {identityData.defenseSkillTypes.map(skill => skills[skill.id] ? <div key={skill.id} style={{ flex: 1, minWidth: "min(400px, 100%)" }}>
                    <SkillCard
                        skill={skills[skill.id].data}
                        level={level}
                        label={constructSkillLabel("defense")}
                        pre={compareMode ? (preSkills[skill.id]?.data ?? {}) : null}
                    />
                </div> : null)}
            </div>
            {combatPassives.length > 0 ?
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div className="title-text">Combat Passives</div>
                    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
                        {combatPassives.map((passive, i) => <div key={i} style={{ flex: 1, minWidth: "min(400px, 100%)" }}>
                            {compareMode ? (
                                passivesPreMapping[passive.name] ?
                                    <PassiveCard
                                        passive={passive}
                                        pre={passivesPreMapping[passive.name]}
                                    /> :
                                    <PassiveCard
                                        passive={passive}
                                        background={"rgba(46, 160, 67, 0.35)"}
                                    />
                            ) :
                                <PassiveCard passive={passive} />
                            }
                        </div>)}
                    </div>
                </div> :
                null
            }
            {supportPassives.length > 0 ?
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div className="title-text">Support Passives</div>
                    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", minWidth: "min(400px, 100%)" }}>
                        {supportPassives.map((passive, i) => <div key={i} style={{ flex: 1 }}>
                            {compareMode ? (
                                passivesPreMapping[passive.name] ?
                                    <PassiveCard
                                        passive={passive}
                                        pre={passivesPreMapping[passive.name]}
                                    /> :
                                    <PassiveCard
                                        passive={passive}
                                        background={"rgba(46, 160, 67, 0.35)"}
                                    />
                            ) :
                                <PassiveCard passive={passive} />
                            }
                        </div>)}
                    </div>
                </div> :
                null
            }
        </div>

    </div>
}

function ReviewsTab({ id, setShowReviews }) {
    const [page, setPage] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadReviews = async () => {
            setLoading(true);
            const fetchedReviews = await getItemReviews({ itemType: "identity", itemId: id, page: page });

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
                    <StatsRadarChart type={"identity"} userData={getReviewScores(review)} includeLabels={false} scale={.5} />
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

export default function IdentityPage({ params }) {
    const { id } = React.use(params);
    const [identities, identitiesLoading] = useData("identities");
    const [level, setLevel] = useState(LEVEL_CAP);
    const [uptie, setUptie] = useState(4);
    const [preuptie, setPreuptie] = useState(1);
    const [activeTab, setActiveTab] = useLocalState("identityActiveTab", "notes");
    const [builds, setBuilds] = useState(null);
    const [compareMode, setCompareMode] = useState(false);
    const [showReviews, setShowReviews] = useState(false);

    const identityData = identitiesLoading ? null : identities[id];
    const { skills: preSkills, combatPassives: preCombatPassives, supportPassives: preSupportPassives } = useSkillData("identity", id, preuptie);
    const { skills, combatPassives, supportPassives, notes } = useSkillData("identity", id, uptie);

    useEffect(() => {
        const fetchBuilds = async () => {
            setBuilds(await searchBuilds({ "identities": [id], published: true, sortBy: "popular" }, 1, 6) || []);
        }

        if (activeTab === "builds" && !builds) fetchBuilds();
    }, [activeTab, builds, id])

    if (identitiesLoading) return null;

    if (!identityData) return <span className="title-text">Identity not found</span>

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

    const passivesPreMapping = {}
    if (compareMode) {
        combatPassives.forEach(passive => {
            const match = preCombatPassives.find(x => x.name === passive.name);
            if (match) passivesPreMapping[passive.name] = match;
        })

        supportPassives.forEach(passive => {
            const match = preSupportPassives.find(x => x.name === passive.name);
            if (match) passivesPreMapping[passive.name] = match;
        })
    }

    return <>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "row", width: "100%", flexWrap: "wrap", justifyContent: "center", gap: "1rem" }}>
                <div style={{ display: "flex", flexDirection: "column", padding: "0.5rem", width: "min(480px, 100%)" }}>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "100%" }}>
                        <RarityIcon rarity={identityData.rank} style={{ display: "inline", height: "2rem" }} />
                        <div style={{ display: "flex", flexDirection: "column", fontSize: "1.2rem", fontWeight: "bold", alignItems: "center", textAlign: "center" }}>
                            <span>{sinnerIdMapping[identityData.sinnerId]}</span>
                            <span>{identityData.name}</span>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem", justifyContent: "center", padding: "0.5rem" }}>
                        <SinnerIcon num={identityData.sinnerId} style={{ width: "40px", height: "40px" }} />
                        Uptie: {compareMode ?
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <UptieSelector value={preuptie} setValue={handleSetPreuptie} />
                                ➔
                                <UptieSelector value={uptie} setValue={handleSetUptie} />
                            </div> :
                            <UptieSelector value={uptie} setValue={handleSetUptie} bottomOption={"compare mode"} />
                        }
                        Level: <NumberInputWithButtons value={level} setValue={setLevel} min={1} max={LEVEL_CAP} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "row", justifyContent: "center" }}>
                        <IdentityIcon identity={identityData} uptie={2} style={{ width: "192px", height: "auto" }} />
                        {identityData.tags.includes("Base Identity") ? null : <IdentityIcon identity={identityData} uptie={4} style={{ width: "192px", height: "auto" }} />}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", textAlign: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column", border: "1px var(--secondary-border-color) solid", padding: "0.2rem" }}>
                            <span>Release Date</span>
                            <span>{identityData.date}</span>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", border: "1px var(--secondary-border-color) solid", padding: "0.2rem" }}>
                            <span>Season</span>
                            <span>{getSeasonString(identityData.season)}</span>
                        </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", textAlign: "center" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", alignItems: "center", border: "1px var(--secondary-border-color) solid" }}>
                            <div style={{ display: "flex", justifyContent: "center" }}><Icon path={"hp"} style={{ width: "32px", height: "32px" }} /></div>
                            <span style={{ borderLeft: "1px var(--secondary-border-color) solid" }}>{constructHp(identityData, level)}</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", alignItems: "center", border: "1px var(--secondary-border-color) solid" }}>
                            <div style={{ display: "flex", justifyContent: "center" }}><Icon path={"speed"} style={{ width: "32px", height: "32px" }} /></div>
                            <span style={{ borderLeft: "1px var(--secondary-border-color) solid" }}>{
                                compareMode ?
                                    <DiffedText before={constructSpeed(identityData, preuptie)} after={constructSpeed(identityData, uptie)} /> :
                                    constructSpeed(identityData, uptie)
                            }</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", alignItems: "center", border: "1px var(--secondary-border-color) solid" }}>
                            <div style={{ display: "flex", justifyContent: "center" }}><Icon path={"defense level"} style={{ width: "32px", height: "32px" }} /></div>
                            <span style={{ borderLeft: "1px var(--secondary-border-color) solid" }}>{constructDefenseLevel(identityData, level)}</span>
                        </div>
                    </div>
                    <div style={{ border: "1px var(--secondary-border-color) solid", padding: "0.2rem", textAlign: "center" }}>Resists</div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", textAlign: "center" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", alignItems: "center", border: "1px var(--secondary-border-color) solid" }}>
                            <div style={{ display: "flex", justifyContent: "center" }}><KeywordIcon id={"Slash"} /></div>
                            <span style={{ borderLeft: "1px var(--secondary-border-color) solid" }}><ColoredResistance resist={identityData.resists.slash} /></span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", alignItems: "center", border: "1px var(--secondary-border-color) solid" }}>
                            <div style={{ display: "flex", justifyContent: "center" }}><KeywordIcon id={"Pierce"} /></div>
                            <span style={{ borderLeft: "1px var(--secondary-border-color) solid" }}><ColoredResistance resist={identityData.resists.pierce} /></span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", alignItems: "center", border: "1px var(--secondary-border-color) solid" }}>
                            <div style={{ display: "flex", justifyContent: "center" }}><KeywordIcon id={"Blunt"} /></div>
                            <span style={{ borderLeft: "1px var(--secondary-border-color) solid" }}><ColoredResistance resist={identityData.resists.blunt} /></span>
                        </div>
                    </div>
                    <div style={{ border: "1px var(--secondary-border-color) solid", padding: "0.2rem", textAlign: "center", display: "flex", flexDirection: "column" }}>
                        <div style={{ borderBottom: "1px var(--secondary-border-color) solid" }}>Keywords</div>
                        <div style={{ marginTop: "0.2rem" }}>{(identityData.skillKeywordList || []).map(x => <KeywordIcon key={x} id={x} />)}</div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", border: "1px var(--secondary-border-color) solid", padding: "0.5rem", gap: "0.2rem" }}>
                        <div style={{ overflowX: "auto", alignSelf: "center", maxWidth: "100%", paddingBottom: "0.5rem" }}>
                            <div style={{ display: "flex", gap: "1rem", width: "max-content" }}>
                                <div
                                    {...getGeneralTooltipProps("Community voted rating of the identity")}
                                    className={`tab-header ${activeTab === "rating" ? "active" : ""}`}
                                    style={{ fontSize: "1rem" }} onClick={() => setActiveTab("rating")}>
                                    Community Rating
                                </div>
                                <div data-tooltip-id="identity-notes" className={`tab-header ${activeTab === "notes" ? "active" : ""}`} style={{ fontSize: "1rem" }} onClick={() => setActiveTab("notes")}>Tips/Summary</div>
                                <div
                                    {...getGeneralTooltipProps("Loads the most popular builds that use this identity.")}
                                    className={`tab-header ${activeTab === "builds" ? "active" : ""}`}
                                    style={{ fontSize: "1rem" }} onClick={() => setActiveTab("builds")}>
                                    Popular Builds
                                </div>
                            </div>
                        </div>
                        <TooltipTemplate id="identity-notes" contentFunc={() => <div style={{ padding: "0.5rem" }}>
                            This section is only meant to contain details about the identity&apos;s mechanics.
                            <br />
                            It will generally not contain things such as:
                            <ul>
                                <li>Meta analysis</li>
                                <li>Comparisons to other identities</li>
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
                        identityData={identityData} level={level}
                        skills={skills} preSkills={preSkills}
                        combatPassives={combatPassives} supportPassives={supportPassives}
                        passivesPreMapping={passivesPreMapping} compareMode={compareMode}
                    />
                }
            </div>
        </div>
    </>
}
