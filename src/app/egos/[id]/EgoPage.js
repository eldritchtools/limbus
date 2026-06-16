"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { ArrowsPointingOutIcon } from "@heroicons/react/24/solid";
import React, { useEffect, useMemo, useState } from "react";

import styles from "./EgoPage.module.css";

import TeamBuild from "@/app/components/contentCards/TeamBuild";
import { useSkillData } from "@/app/components/dataHooks/skills";
import { useData } from "@/app/components/DataProvider";
import EgoImage from "@/app/components/icons/EgoImage";
import KeywordIcon from "@/app/components/icons/KeywordIcon";
import RarityIcon from "@/app/components/icons/RarityIcon";
import SinnerIcon from "@/app/components/icons/SinnerIcon";
import MarkdownEditorWrapper from "@/app/components/markdown/MarkdownEditorWrapper";
import MarkdownRenderer from "@/app/components/markdown/MarkdownRenderer";
import { useModal } from "@/app/components/modals/ModalProvider";
import DragContainer from "@/app/components/objects/DragContainer";
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

function HeaderComponent({ egoData }) {
    const [offsets, offsetsLoading] = useData("ego_header_offsets");
    const { openImageModal } = useModal();

    const offset = offsetsLoading ? null : (offsets?.[egoData.id] ?? null)

    return <div className={styles.header}>
        <EgoImage
            className={styles.headerImage} ego={egoData}
            style={{ "--position": offset }}
        />

        <div className={styles.headerOverlay}>
            <div className={styles.headerButtons}>
                <button
                    onClick={() => openImageModal({ type: "ego", data: egoData })}
                    style={{ display: "flex", alignItems: "center", padding: "5px" }}
                >
                    <ArrowsPointingOutIcon style={{ width: "1.25rem", height: "1.25rem", transform: "rotate(90deg)" }} />
                </button>
            </div>
        </div>
    </div>
}

function RatingTab({ id, isMobile }) {
    const { user } = useAuth();
    const [userData, setUserData] = useState(null);
    const [globalData, setGlobalData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refresh, setRefresh] = useState(true);
    const [tab, setTab, tabInitialized] = useLocalState("ratingTab", "top");
    const [userReview, setUserReview] = useState(null);
    const [reviewText, setReviewText] = useState("");
    const [isReviewing, setIsReviewing] = useState(false);

    useEffect(() => {
        if (!refresh) return;

        const fetchData = async () => {
            setLoading(true);
            const userData = user ? await getUserReview({ userId: user.id, itemType: "ego", itemId: id }) : null;
            const globalData = await getItemAggregates({ itemType: "ego", itemId: id });

            setUserData(userData);
            setUserReview(userData);
            setGlobalData(globalData);
            setRefresh(false);
            setLoading(false);
        }

        fetchData();
    }, [user, id, refresh, setUserReview]);

    if (loading) return <span style={{ color: "var(--disabled-text-color)", textAlign: "center" }}>Loading Rating...</span>;

    const onChange = (newData) => {
        setUserData(newData);
        setRefresh(true);
    }

    return <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: isMobile ? 0 : "0.5rem" }}>
        <RatingComponent
            type={"ego"} id={id} globalData={globalData} userData={userData} onChange={onChange}
            reviewText={reviewText} setReviewText={setReviewText} isReviewing={isReviewing} setIsReviewing={setIsReviewing}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
            {isReviewing && <>
                <span className="title-text" style={{ textAlign: "center" }}>Review</span>
                <div style={{ width: "100%" }}>
                    <MarkdownEditorWrapper
                        value={reviewText}
                        onChange={v => setReviewText(v)}
                        placeholder={`Leave a review for this E.G.O (optional)...`}
                    />
                </div>
            </>
            }

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "1rem" }}>
                <div className={`tab-header ${tab === "latest" ? "active" : ""}`} onClick={() => setTab("latest")}>Latest</div>
                <div className={`tab-header ${tab === "active" ? "active" : ""}`} onClick={() => setTab("active")}>Active</div>
                <div className={`tab-header ${tab === "top" ? "active" : ""}`} onClick={() => setTab("top")}>Top</div>
                <div className={`tab-header ${tab === "funny" ? "active" : ""}`} onClick={() => setTab("funny")}>Funny</div>
            </div>
            {tabInitialized && <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                <ReviewsComponent type={"ego"} id={id} sortType={tab} userReview={userReview} />
            </div>
            }
        </div>
    </div>
}

function NotesTab({ notes }) {
    return <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {(!notes || !notes.main) &&
            <div style={{ color: "var(--disabled-text-color)", textAlign: "center" }}>Not yet available...</div>
        }
        {notes && notes.main && <>
            {notes.other && <div className="sub-text">Main</div>}
            {notes.main.map((str, i) => <div key={i} style={{ display: "flex", flexDirection: "row", gap: "0.25rem", lineHeight: "1.4" }}>
                • <MarkdownRenderer content={str} />
            </div>)}
        </>
        }
        {notes && notes.other && <>
            <div style={{ height: "0.5rem" }} />
            <div className="sub-text">Other</div>
            {notes.other.map((str, i) => <div key={i} style={{ display: "flex", flexDirection: "row", gap: "0.25rem", lineHeight: "1.4" }}>
                • <MarkdownRenderer content={str} />
            </div>)}
        </>}
        {/* <HorizontalDivider />
        <span style={{ textAlign: "center" }}>Check out the Community Rating or Community Reviews tabs to view the community&apos;s thoughts or leave your own!</span> */}
    </div>
}

function BuildsTab({ builds }) {
    if (!builds) return <div style={{ color: "var(--disbled-text-color)", textAlign: "center" }}>Loading builds...</div>;
    if (builds.length === 0) return <div style={{ color: "var(--disbled-text-color)", textAlign: "center" }}>No builds found.</div>;
    return <DragContainer>
        <div style={{ display: "flex", gap: "1rem" }}>
            {builds.map(build => <TeamBuild key={build.id} build={build} size={"M"} complete={false} />)}
        </div>
    </DragContainer>
}

function SkillsTab({ awakeningSkills, preAwakeningSkills, corrosionSkills, preCorrosionSkills, passives, prePassives, compareMode, preuptie }) {
    return <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "0.25rem" }}>
        <div className="title-text">Skills</div>
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
            {awakeningSkills.map((skill, i) => <div key={i} style={{ flex: 1, minWidth: "min(500px, 100%)" }}>
                <SkillCard
                    skill={skill.data}
                    label={constructSkillLabel("awakening")}
                    pre={compareMode ? preAwakeningSkills[i].data : null}
                    noBorder={true}
                />
            </div>)}
        </div>
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", borderBottom: "1px var(--primary-border-color) solid" }}>
            {corrosionSkills.map((skill, i) => <div key={i} style={{ flex: 1, minWidth: "min(500px, 100%)" }}>
                <SkillCard
                    skill={skill.data}
                    label={constructSkillLabel("corrosion")}
                    pre={compareMode ? preCorrosionSkills[i].data : null}
                    noBorder={true}
                />
            </div>)}
        </div>
        {passives.length > 0 ?
            <div style={{ display: "flex", flexDirection: "column" }}>
                <div className="title-text">Passives</div>
                {passives.map((passive, i) => {
                    if (compareMode && preuptie < 2)
                        return <PassiveCard key={i}
                            passive={passive}
                            background={"rgba(46, 160, 67, 0.35)"}
                            noBorder={true}
                        />
                    return <PassiveCard key={i}
                        passive={passive}
                        pre={compareMode ? prePassives[i] : null}
                        noBorder={true}
                    />
                })}
            </div> :
            null
        }
    </div>
}

export default function EgoPage({ params }) {
    const { id } = React.use(params);
    const [egos, egosLoading] = useData("egos");
    const [uptie, setUptie] = useState(4);
    const [preuptie, setPreuptie] = useState(1);
    const [activeTab, setActiveTab] = useLocalState("egoActiveTab", "notes");
    const [panelOpen, setPanelOpen] = useLocalState("egoPanelOpen", true);
    const [builds, setBuilds] = useState(null);
    const [compareMode, setCompareMode] = useState(false);

    const egoData = useMemo(() => egosLoading ? null : egos[id], [id, egos, egosLoading]);
    const { awakeningSkills: preAwakeningSkills, corrosionSkills: preCorrosionSkills, passives: prePassives } = useSkillData("ego", id, preuptie);
    const { awakeningSkills, corrosionSkills, passives, notes } = useSkillData("ego", id, uptie);

    const { isMobile } = useBreakpoint();

    useEffect(() => {
        const fetchBuilds = async () => {
            setBuilds(await searchBuilds({ "egos": [id], published: true, sortBy: "popular" }, 1, 6) || []);
        }

        if (activeTab === "builds" && !builds) fetchBuilds();
    }, [activeTab, builds, id])

    useEffect(() => {
        if (!egoData) return;
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (egoData.maxThreadspin) setUptie(egoData.maxThreadspin);
    }, [egoData]);

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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "0.5rem" }}>
            <HeaderComponent egoData={egoData} />

            <div className="panel-container" style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "stretch", gap: "1rem" }}>
                <div style={{ flex: isMobile ? 1 : "0 1 500px", display: "grid", gridTemplateColumns: "auto auto auto", alignItems: "center" }}>
                    <div style={{ gridColumn: "span 3", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                        <RarityIcon rarity={egoData.rank.toLowerCase()} style={{ display: "inline", height: "2rem" }} />
                        <SinnerIcon num={egoData.sinnerId} style={{ width: "40px", height: "40px" }} />
                        <h1 style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: 0 }}>
                            <span style={{ fontSize: "0.8rem" }}>
                                {sinnerIdMapping[egoData.sinnerId]}
                            </span>

                            <span style={{ fontSize: "1.5rem", fontWeight: "bold", textAlign: "center" }}>
                                {egoData.name}
                            </span>
                        </h1>
                    </div>

                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem", justifyContent: "center", padding: "0.5rem" }}>
                        Threadspin: {compareMode ?
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <UptieSelector value={preuptie} setValue={handleSetPreuptie} maxUptie={egoData.maxThreadspin ?? 4} />
                                ➔
                                <UptieSelector value={uptie} setValue={handleSetUptie} maxUptie={egoData.maxThreadspin ?? 4} />
                            </div> :
                            <UptieSelector value={uptie} setValue={handleSetUptie} bottomOption={"compare mode"} maxUptie={egoData.maxThreadspin ?? 4} />
                        }
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
                        <span style={{ fontWeight: "bold" }}>Release Date</span>
                        <span>{egoData.date}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
                        <span style={{ fontWeight: "bold" }}>Season</span>
                        <span>{getSeasonString(egoData.season)}</span>
                    </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(8, auto)", alignItems: "center", textAlign: "center", gap: "0.2rem" }}>
                    <div />
                    {affinities.map(affinity => <KeywordIcon key={`${affinity}-i`} id={affinity} />)}
                    <span>Cost</span>
                    {affinities.map(affinity => affinity in egoData.cost ?
                        <span key={`${affinity}-c`}>{egoData.cost[affinity]}</span> :
                        <span key={`${affinity}-c`} style={{ color: "var(--disabled-text-color)" }}>0</span>
                    )}
                    <span>Resist</span>
                    {affinities.map(affinity => <ColoredResistance key={`${affinity}-r`} resist={egoData.resists[affinity]} />)}
                </div>
            </div>

            <div className="panel-container" style={{ display: "flex", flexDirection: "column", padding: "0.5rem", width: "100%" }}>
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
                    panelOpen && (
                        activeTab === "notes" ?
                            <NotesTab notes={notes} /> :
                            activeTab === "rating" ?
                                <RatingTab id={id} isMobile={isMobile} /> :
                                <BuildsTab builds={builds} />
                    )
                }

                <span className="text-link" style={{ alignSelf: "center" }} onClick={() => setPanelOpen(p => !p)}>
                    {panelOpen ? "▴ Click to Collapse ▴" : "▾ Click to Expand ▾"}
                </span>
            </div>

            <SkillsTab
                awakeningSkills={awakeningSkills} preAwakeningSkills={preAwakeningSkills}
                corrosionSkills={corrosionSkills} preCorrosionSkills={preCorrosionSkills}
                passives={passives} prePassives={prePassives}
                compareMode={compareMode} preuptie={preuptie}
            />
        </div>
    </>
}
