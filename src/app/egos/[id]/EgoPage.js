"use client";

import React, { useEffect, useState } from "react";

import TeamBuild from "@/app/components/contentCards/TeamBuild";
import { useSkillData } from "@/app/components/dataHooks/skills";
import { useData } from "@/app/components/DataProvider";
import EgoIcon from "@/app/components/icons/EgoIcon";
import KeywordIcon from "@/app/components/icons/KeywordIcon";
import RarityIcon from "@/app/components/icons/RarityIcon";
import SinnerIcon from "@/app/components/icons/SinnerIcon";
import MarkdownRenderer from "@/app/components/markdown/MarkdownRenderer";
import RatingComponent from "@/app/components/ratings/RatingComponent";
import ReviewsComponent from "@/app/components/ratings/ReviewsComponent";
import UptieSelector from "@/app/components/selectors/UptieSelector";
import PassiveCard from "@/app/components/skill/PassiveCard";
import SkillCard from "@/app/components/skill/SkillCard";
import { getGeneralTooltipProps } from "@/app/components/tooltips/GeneralTooltip";
import TooltipTemplate from "@/app/components/tooltips/TooltipTemplate";
import { useAuth } from "@/app/database/authProvider";
import { searchBuilds } from "@/app/database/builds";
import { getItemAggregates, getUserReview } from "@/app/database/reviews";
import { ColoredResistance } from "@/app/lib/colors";
import { affinities, getSeasonString, sinnerIdMapping } from "@/app/lib/constants";
import { constructSkillLabel } from "@/app/lib/skill";
import useLocalState from "@/app/lib/useLocalState";

function RatingTab({ id, showReviews, setShowReviews }) {
    const { user } = useAuth();
    const [userData, setUserData] = useState(null);
    const [globalData, setGlobalData] = useState(null);
    const [loading, setLoading] = useState(true);
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
    
    const onChange = (newData) => {
        setUserData(newData);
        setRefresh(true);
    }

    const showReviewsButton =
        globalData ?
            <button onClick={() => setShowReviews(p => !p)}>{showReviews ? "Hide Reviews" : "Show Reviews"}</button> :
            null

    return <RatingComponent type={"ego"} id={id} globalData={globalData} userData={userData} onChange={onChange} showReviewsButton={showReviewsButton} />
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
    const [tab, setTab] = useLocalState("ratingTab", "latest");
    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", minWidth: "min(480px, 100%)", flex: 1 }}>
        <div style={{display: "flex", alignItems: "center", gap: "1rem"}}>
            <button onClick={() => setShowReviews(false)}>Hide Reviews</button>
            <div className={`tab-header ${tab === "latest" ? "active" : ""}`} onClick={() => setTab("latest")}>Latest</div>
            <div className={`tab-header ${tab === "active" ? "active" : ""}`} onClick={() => setTab("active")}>Active</div>
            <div className={`tab-header ${tab === "top" ? "active" : ""}`} onClick={() => setTab("top")}>Top</div>
        </div>
        <ReviewsComponent type={"ego"} id={id} sortType={tab} />
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
