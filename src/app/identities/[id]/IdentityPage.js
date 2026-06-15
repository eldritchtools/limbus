"use client";

import { useBreakpoint } from "@eldritchtools/shared-components";
import { ArrowPathIcon, ArrowsPointingOutIcon } from "@heroicons/react/24/solid";
import React, { useEffect, useState } from "react";

import styles from "./IdentityPage.module.css";

import TeamBuild from "@/app/components/contentCards/TeamBuild";
import { useSkillData } from "@/app/components/dataHooks/skills";
import { useData } from "@/app/components/DataProvider";
import Icon from "@/app/components/icons/Icon";
import IdentityImage from "@/app/components/icons/IdentityImage";
import KeywordIcon from "@/app/components/icons/KeywordIcon";
import RarityIcon from "@/app/components/icons/RarityIcon";
import SinnerIcon from "@/app/components/icons/SinnerIcon";
import MarkdownEditorWrapper from "@/app/components/markdown/MarkdownEditorWrapper";
import MarkdownRenderer from "@/app/components/markdown/MarkdownRenderer";
import { useModal } from "@/app/components/modals/ModalProvider";
import DragContainer from "@/app/components/objects/DragContainer";
import NumberInputWithButtons from "@/app/components/objects/NumberInputWithButtons";
import RatingComponent from "@/app/components/ratings/RatingComponent";
import ReviewsComponent from "@/app/components/ratings/ReviewsComponent";
import UptieSelector from "@/app/components/selectors/UptieSelector";
import PassiveCard from "@/app/components/skill/PassiveCard";
import SkillCard from "@/app/components/skill/SkillCard";
import DiffedText from "@/app/components/texts/DiffedText";
import { getGeneralTooltipProps } from "@/app/components/tooltips/GeneralTooltip";
import TooltipTemplate from "@/app/components/tooltips/TooltipTemplate";
import { useAuth } from "@/app/database/authProvider";
import { searchBuilds } from "@/app/database/builds";
import { getItemAggregates, getUserReview } from "@/app/database/reviews";
import { ColoredResistance } from "@/app/lib/colors";
import { getSeasonString, LEVEL_CAP, sinnerIdMapping } from "@/app/lib/constants";
import { constructDefenseLevel, constructHp, constructSpeed } from "@/app/lib/identity";
import { constructSkillLabel } from "@/app/lib/skill";
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
            </div>
            {tabInitialized && <div style={{ maxHeight: "600px", overflowY: "auto" }}>
                <ReviewsComponent type={"identity"} id={id} sortType={tab} userReview={userReview} />
            </div>}
        </div>
    </div>
}

function NotesTab({ notes }) {
    return <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {(!notes || !notes.usage) &&
            <div style={{ color: "var(--disabled-text-color)", textAlign: "center" }}>Not yet available...</div>
        }
        {notes && notes.usage && <>
            {notes.other && <div className="sub-text">Usage Tips</div>}
            {notes.usage.map((str, i) => <div key={i} style={{ display: "flex", flexDirection: "row", gap: "0.25rem", lineHeight: "1.4" }}>
                • <MarkdownRenderer content={str} />
            </div>)}
        </>
        }
        {notes && notes.other && <>
            <div style={{ height: "0.5rem" }} />
            <div className="sub-text">Other Details</div>
            {notes.other.map((str, i) => <div key={i} style={{ display: "flex", flexDirection: "row", gap: "0.25rem", lineHeight: "1.4" }}>
                • <MarkdownRenderer content={str} />
            </div>)}
        </>}
        {/* <HorizontalDivider />
        <span style={{ textAlign: "center" }}>Check out the Community Rating or Community Reviews tabs to view the community&apos;s thoughts or leave your own!</span> */}
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

function SkillsTab({ identityData, level, skills, preSkills, combatPassives, supportPassives, passivesPreMapping, compareMode }) {
    return <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "0.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "0.25rem" }}>
            <div className="title-text">Skills</div>
            {[1, 2, 3, 4].map(tier => {
                const list = identityData.skillTypes.filter(skill => skill.type.tier === tier);
                if (list.length === 0) return null;
                return <div key={tier} style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", paddingBottom: "0.25rem", gap: "0.2rem", borderBottom: "1px var(--primary-border-color) solid" }}>
                    {list.map((skill, index) => skills[skill.id] ? <div key={skill.id} style={{ flex: 1, minWidth: "min(500px, 100%)" }}>
                        <SkillCard
                            skill={skills[skill.id].data}
                            count={skill.num} level={level}
                            label={constructSkillLabel("attack", tier, index)}
                            pre={compareMode ? (preSkills[skill.id]?.data ?? {}) : null}
                            noBorder={true}
                        />
                    </div> : null)}
                </div>
            })}
            <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", gap: "0.2rem", paddingBottom: "0.25rem", borderBottom: "1px var(--primary-border-color) solid" }}>
                {identityData.defenseSkillTypes.map(skill => skills[skill.id] ? <div key={skill.id} style={{ flex: 1, minWidth: "min(500px, 100%)" }}>
                    <SkillCard
                        skill={skills[skill.id].data}
                        level={level}
                        label={constructSkillLabel("defense")}
                        pre={compareMode ? (preSkills[skill.id]?.data ?? {}) : null}
                        noBorder={true}
                    />
                </div> : null)}
            </div>
            {combatPassives.length > 0 ?
                <div style={{ display: "flex", flexDirection: "column", borderBottom: "1px var(--primary-border-color) solid" }}>
                    <div className="title-text">Combat Passives</div>
                    {combatPassives.map((passive, i) => <div key={i} style={{ flex: 1, minWidth: "min(500px, 100%)" }}>
                        {compareMode ? (
                            passivesPreMapping[passive.name] ?
                                <PassiveCard
                                    passive={passive}
                                    pre={passivesPreMapping[passive.name]}
                                    noBorder={true}
                                /> :
                                <PassiveCard
                                    passive={passive}
                                    background={"rgba(46, 160, 67, 0.35)"}
                                    noBorder={true}
                                />
                        ) :
                            <PassiveCard
                                passive={passive}
                                noBorder={true}
                            />
                        }
                    </div>)}
                </div> :
                null
            }
            {supportPassives.length > 0 ?
                <div style={{ display: "flex", flexDirection: "column" }}>
                    <div className="title-text">Support Passives</div>
                    <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap", minWidth: "min(500px, 100%)" }}>
                        {supportPassives.map((passive, i) => <div key={i} style={{ flex: 1 }}>
                            {compareMode ? (
                                passivesPreMapping[passive.name] ?
                                    <PassiveCard
                                        passive={passive}
                                        pre={passivesPreMapping[passive.name]}
                                        noBorder={true}
                                    /> :
                                    <PassiveCard
                                        passive={passive}
                                        background={"rgba(46, 160, 67, 0.35)"}
                                        noBorder={true}
                                    />
                            ) :
                                <PassiveCard
                                    passive={passive}
                                    noBorder={true}
                                />
                            }
                        </div>)}
                    </div>
                </div> :
                null
            }
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
    const [panelOpen, setPanelOpen] = useLocalState("identityPanelOpen", true);
    const [builds, setBuilds] = useState(null);
    const [compareMode, setCompareMode] = useState(false);

    const identityData = identitiesLoading ? null : identities[id];
    const { skills: preSkills, combatPassives: preCombatPassives, supportPassives: preSupportPassives } = useSkillData("identity", id, preuptie);
    const { skills, combatPassives, supportPassives, notes } = useSkillData("identity", id, uptie);

    const { isMobile } = useBreakpoint();

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
                                {x}
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
                            style={{ fontSize: "1rem" }} onClick={() => setActiveTab("rating")}>
                            Community Rating
                        </div>
                        <div
                            data-tooltip-id="identity-notes"
                            className={`tab-header ${activeTab === "notes" ? "active" : ""}`}
                            style={{ fontSize: "1rem" }} onClick={() => setActiveTab("notes")}>
                            Tips/Summary
                        </div>
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
                identityData={identityData} level={level}
                skills={skills} preSkills={preSkills}
                combatPassives={combatPassives} supportPassives={supportPassives}
                passivesPreMapping={passivesPreMapping} compareMode={compareMode}
            />
        </div>
    </>
}
