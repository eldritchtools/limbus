"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { ArrowPathIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/solid";
import React, { useEffect, useState } from "react";

import styles from "./IdentityPage.module.css";
import { SkillsTab } from "./IdentityPageComponents";

import TeamBuild from "@/app/components/contentCards/TeamBuild";
import { useData, useDataProvider } from "@/app/components/DataProvider";
import Icon from "@/app/components/icons/Icon";
import IdentityImage from "@/app/components/icons/IdentityImage";
import KeywordIcon from "@/app/components/icons/KeywordIcon";
import RarityIcon from "@/app/components/icons/RarityIcon";
import SinnerIcon from "@/app/components/icons/SinnerIcon";
import MarkdownEditorWrapper from "@/app/components/markdown/MarkdownEditorWrapper";
import { useModal } from "@/app/components/modals/ModalProvider";
import DragContainer from "@/app/components/objects/DragContainer";
import NumberInputWithButtons from "@/app/components/objects/NumberInputWithButtons";
import RatingComponent from "@/app/components/ratings/RatingComponent";
import ReviewsComponent from "@/app/components/ratings/ReviewsComponent";
import UptieSelector from "@/app/components/selectors/UptieSelector";
import DiffedText from "@/app/components/texts/DiffedText";
import ProcessedText from "@/app/components/texts/ProcessedText";
import { getGeneralTooltipProps } from "@/app/components/tooltips/GeneralTooltip";
import TooltipTemplate from "@/app/components/tooltips/TooltipTemplate";
import { useAuth } from "@/app/database/authProvider";
import { searchBuilds } from "@/app/database/builds";
import { getItemAggregates, getUserReview } from "@/app/database/reviews";
import { ColoredResistance } from "@/app/lib/colors";
import { getSeasonString, LEVEL_CAP, sinnerIdMapping } from "@/app/lib/constants";
import { constructDefenseLevel, constructHp, constructSpeed } from "@/app/lib/identity";
import { compileSkillData } from "@/app/lib/skill";
import useLocalState from "@/app/lib/useLocalState";

function HeaderComponent({ identityData }) {
    const [offsets, offsetsLoading] = useData("identity_header_offsets");
    const [uptie, setUptie] = useState(true);
    const { openImageModal } = useModal();

    const offset = offsetsLoading ? null : (offsets?.[identityData.id]?.[uptie ? 1 : 0] ?? null)

    return <div className={styles.header}>
        <IdentityImage
            className={styles.headerImage} identity={identityData} uptie={uptie}
            style={{ "--position": offset }}
        />

        <div className={styles.headerOverlay}>
            <div className={styles.headerButtons}>
                <button
                    onClick={() => openImageModal({ type: "identity", data: identityData, mod: uptie })}
                    style={{ display: "flex", alignItems: "center", padding: "5px" }}
                >
                    <ArrowsPointingOutIcon style={{ width: "1.25rem", height: "1.25rem", transform: "rotate(90deg)" }} />
                </button>
                {!identityData.tags.includes("Base Identity") &&
                    <button onClick={() => setUptie(p => !p)} style={{ display: "flex", alignItems: "center", padding: "5px" }}>
                        <ArrowPathIcon style={{ width: "1.25rem", height: "1.25rem", transform: "rotate(90deg)" }} />
                    </button>
                }
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
            const userData = user ? await getUserReview({ userId: user.id, itemType: "identity", itemId: id }) : null;
            const globalData = await getItemAggregates({ itemType: "identity", itemId: id });

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
            type={"identity"} id={id} globalData={globalData} userData={userData} onChange={onChange}
            reviewText={reviewText} setReviewText={setReviewText} isReviewing={isReviewing} setIsReviewing={setIsReviewing}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", flex: 1 }}>
            {isReviewing && <>
                <span className="title-text" style={{ textAlign: "center" }}>Review</span>
                <div style={{ width: "100%" }}>
                    <MarkdownEditorWrapper
                        value={reviewText}
                        onChange={v => setReviewText(v)}
                        placeholder={`Leave a review for this identity (optional)...`}
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
                <ReviewsComponent type={"identity"} id={id} sortType={tab} userReview={userReview} />
            </div>}
        </div>
    </div>
}

function BuildsTab({ builds }) {
    if (!builds) return <div style={{ color: "var(--disabled-text-color)", textAlign: "center" }}>Loading builds...</div>;
    if (builds.length === 0) return <div style={{ color: "var(--disabled-text-color)", textAlign: "center" }}>No builds found.</div>;
    return <DragContainer>
        <div style={{ display: "flex", gap: "1rem" }}>
            {builds.map(build => <TeamBuild key={build.id} build={build} size={"M"} complete={false} />)}
        </div>
    </DragContainer>
}

export default function IdentityPage({ params, identityData, initSkillData, notesTab, initSkillsTab }) {
    const { getData } = useDataProvider();
    const { id } = React.use(params);
    const [level, setLevel] = useState(LEVEL_CAP);
    const [uptie, setUptie] = useState(4);
    const [preuptie, setPreuptie] = useState(1);
    const [activeTab, setActiveTab] = useLocalState("identityActiveTab", "notes");
    const [panelOpen, setPanelOpen] = useLocalState("identityPanelOpen", true);
    const [builds, setBuilds] = useState(null);
    const [compareMode, setCompareMode] = useState(false);
    const [skillData, setSkillData] = useState({ 4: initSkillData });

    const { skills, combatPassives, supportPassives } = skillData[uptie];

    const { skills: preSkills, combatPassives: preCombatPassives, supportPassives: preSupportPassives } =
        compareMode ? skillData[preuptie] : { skills: null, combatPassives: null, supportPassives: null }

    const { isMobile } = useBreakpoint();

    if (!identityData) return <span className="title-text">Identity not found</span>

    const handleSetUptie = async (v) => {
        if (v === "compare mode") {
            if (!(preuptie in skillData)) {
                const data = await getData(`identities/${id}`);
                setSkillData(p => ({ ...p, [preuptie]: compileSkillData("identity", identityData, data, v) }));
            }
            setCompareMode(true);
        }
        else {
            if (!(v in skillData)) {
                const data = await getData(`identities/${id}`);
                setSkillData(p => ({ ...p, [v]: compileSkillData("identity", identityData, data, v) }));
            }

            setUptie(v);
            if (v < preuptie) setPreuptie(v);
        }
    }

    const handleSetPreuptie = async v => {
        if (!(v in skillData)) {
            const data = await getData(`identities/${id}`);
            setSkillData(p => ({ ...p, [v]: compileSkillData("identity", identityData, data, v) }));
        }

        setPreuptie(v);
        if (v > uptie) setUptie(v);
    }

    const handleSetActiveTab = async tab => {
        setActiveTab(tab);
        if (tab === "builds" && !builds) {
            setBuilds(await searchBuilds({ "identities": [id], published: true, sortBy: "popular" }, 1, 6) || []);
        }
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
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "0.5rem" }}>
            <HeaderComponent identityData={identityData} />

            <div className="panel-container" style={{ display: "flex", flexDirection: isMobile ? "column" : "row", alignItems: "stretch", gap: "1rem" }}>
                <div style={{ flex: isMobile ? 1 : "0 1 500px", display: "grid", gridTemplateColumns: "auto" }}>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                        <RarityIcon rarity={identityData.rank} style={{ display: "inline", height: "2rem" }} />
                        <SinnerIcon num={identityData.sinnerId} style={{ width: "40px", height: "40px" }} />
                        <h1 style={{ display: "flex", flexDirection: "column", alignItems: "center", margin: 0 }}>
                            <span style={{ fontSize: "0.8rem" }}>
                                {sinnerIdMapping[identityData.sinnerId]}
                            </span>

                            <span style={{ fontSize: "1.5rem", fontWeight: "bold", textAlign: "center" }}>
                                {identityData.name}
                            </span>
                        </h1>
                    </div>

                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "0.5rem", justifyContent: "center", padding: "0.5rem" }}>
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
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "auto auto", gridTemplateRows: "auto auto", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", whiteSpace: "nowrap" }}>
                        <div style={{ padding: "0.2rem", textAlign: "center", fontWeight: "bold" }}>Stats</div>
                        <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                            <div style={{ display: "flex", justifyContent: "center" }}><Icon path={"hp"} style={{ width: "32px", height: "32px" }} /></div>
                            <span>{constructHp(identityData, level)}</span>
                            <div style={{ display: "flex", justifyContent: "center" }}><Icon path={"speed"} style={{ width: "32px", height: "32px" }} /></div>
                            <span>{
                                compareMode ?
                                    <DiffedText before={constructSpeed(identityData, preuptie)} after={constructSpeed(identityData, uptie)} /> :
                                    constructSpeed(identityData, uptie)
                            }</span>
                            <div style={{ display: "flex", justifyContent: "center" }}><Icon path={"defense level"} style={{ width: "32px", height: "32px" }} /></div>
                            <span>{constructDefenseLevel(identityData, level)}</span>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
                        <div style={{ padding: "0.2rem", textAlign: "center", fontWeight: "bold" }}>Resists</div>
                        <div style={{ display: "flex", gap: "0.2rem", alignItems: "center" }}>
                            <div style={{ display: "flex", justifyContent: "center" }}><KeywordIcon id={"Slash"} /></div>
                            <span><ColoredResistance resist={identityData.resists.slash} /></span>
                            <div style={{ display: "flex", justifyContent: "center" }}><KeywordIcon id={"Pierce"} /></div>
                            <span><ColoredResistance resist={identityData.resists.pierce} /></span>
                            <div style={{ display: "flex", justifyContent: "center" }}><KeywordIcon id={"Blunt"} /></div>
                            <span><ColoredResistance resist={identityData.resists.blunt} /></span>
                        </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", flex: 1 }} >
                        <div style={{ padding: "0.2rem", textAlign: "center", fontWeight: "bold" }}>Keywords</div>
                        <div style={{ display: "flex", gap: "0.2rem", justifyContent: "center" }}>
                            {(identityData.skillKeywordList || []).map(x => <KeywordIcon key={x} id={x} />)}
                        </div>
                    </div>
                </div>

                <div style={{ flex: isMobile ? 1 : "0 1 400px", display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gridTemplateRows: "auto auto", minWidth: 0 }}>
                    <div style={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
                        <span style={{ fontWeight: "bold" }}>Release Date</span>
                        <span>{identityData.date}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
                        <span style={{ fontWeight: "bold" }}>Season</span>
                        <span>{getSeasonString(identityData.season)}</span>
                    </div>
                    <div style={{ gridColumn: "span 2", padding: "0.2rem", textAlign: "center", display: "flex", flexDirection: "column" }}>
                        <div style={{ fontWeight: "bold" }}>Tags/Factions</div>
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", marginTop: "0.2rem" }}>
                            {(identityData.tags || []).map(x => <span key={x}
                                style={{ padding: "0.1rem 0.2rem", margin: "0.1rem 0.25rem", background: "var(--bg-hover)", borderRadius: "0.5rem" }}>
                                <ProcessedText text={x} />
                            </span>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="panel-container" style={{ display: "flex", flexDirection: "column", padding: "0.5rem", width: "100%" }}>
                <div style={{ overflowX: "auto", alignSelf: "center", maxWidth: "100%", paddingBottom: "0.5rem" }}>
                    <div style={{ display: "flex", gap: "1rem", width: "max-content" }}>
                        <div
                            {...getGeneralTooltipProps("Community voted rating of the identity")}
                            className={`tab-header ${activeTab === "rating" ? "active" : ""}`}
                            style={{ fontSize: "1rem" }} onClick={() => handleSetActiveTab("rating")}>
                            Community Rating
                        </div>
                        <div
                            data-tooltip-id="identity-notes"
                            className={`tab-header ${activeTab === "notes" ? "active" : ""}`}
                            style={{ fontSize: "1rem" }} onClick={() => handleSetActiveTab("notes")}>
                            Tips/Summary
                        </div>
                        <div
                            {...getGeneralTooltipProps("Loads the most popular builds that use this identity.")}
                            className={`tab-header ${activeTab === "builds" ? "active" : ""}`}
                            style={{ fontSize: "1rem" }} onClick={() => handleSetActiveTab("builds")}>
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
                    panelOpen && (
                        activeTab === "notes" ?
                            notesTab :
                            activeTab === "rating" ?
                                <RatingTab id={id} isMobile={isMobile} /> :
                                <BuildsTab builds={builds} />
                    )
                }

                <span className="text-link" style={{ alignSelf: "center" }} onClick={() => setPanelOpen(p => !p)}>
                    {panelOpen ? "▴ Click to Collapse ▴" : "▾ Click to Expand ▾"}
                </span>
            </div>

            {!compareMode && uptie === 4 ? initSkillsTab :
                <SkillsTab
                    identityData={identityData} level={level}
                    skills={skills} preSkills={preSkills}
                    combatPassives={combatPassives} supportPassives={supportPassives}
                    passivesPreMapping={passivesPreMapping} compareMode={compareMode}
                />
            }
        </div>
    </>
}
