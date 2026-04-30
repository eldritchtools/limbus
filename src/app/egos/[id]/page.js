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
import UptieSelector from "@/app/components/selectors/UptieSelector";
import PassiveCard from "@/app/components/skill/PassiveCard";
import SkillCard from "@/app/components/skill/SkillCard";
import TooltipTemplate from "@/app/components/tooltips/TooltipTemplate";
import { searchBuilds } from "@/app/database/builds";
import { ColoredResistance } from "@/app/lib/colors";
import { affinities, getSeasonString, sinnerIdMapping } from "@/app/lib/constants";
import { constructSkillLabel } from "@/app/lib/skill";


function NotesTab({ notes }) {
    if (!notes || !notes.main) return <div style={{ color: "#777", textAlign: "center" }}>Not yet available...</div>;
    if (!notes.other)
        return <div style={{ display: "flex", flexDirection: "column" }}>
            {notes.main.map((str, i) => <div key={i} style={{ display: "flex", flexDirection: "row", gap: "0.25rem", lineHeight: "1.4" }}>
                • <MarkdownRenderer content={str} />
            </div>)}
        </div>

    return <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ color: "#aaa", fontSize: "0.8rem" }}>Main</div>
        {notes.main.map((str, i) => <div key={i} style={{ display: "flex", flexDirection: "row", gap: "0.25rem", lineHeight: "1.4" }}>
            • <MarkdownRenderer content={str} />
        </div>)}
        <div style={{ height: "0.5rem" }} />
        <div style={{ color: "#aaa", fontSize: "0.8rem" }}>Other</div>
        {notes.other.map((str, i) => <div key={i} style={{ display: "flex", flexDirection: "row", gap: "0.25rem", lineHeight: "1.4" }}>
            • <MarkdownRenderer content={str} />
        </div>)}
    </div>
}

function BuildsTab({ builds }) {
    if (!builds) return <div style={{ color: "#777", textAlign: "center" }}>Loading builds...</div>;
    if (builds.length === 0) return <div style={{ color: "#777", textAlign: "center" }}>No builds found.</div>;
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: "14px" }}>
        {builds.map(build => <TeamBuild key={build.id} build={build} size={"M"} complete={false} />)}
    </div>
}

export default function EgoPage({ params }) {
    const { id } = React.use(params);
    const [egos, egosLoading] = useData("egos");
    const [uptie, setUptie] = useState(4);
    const [preuptie, setPreuptie] = useState(1);
    const [activeTab, setActiveTab] = useState("notes");
    const [builds, setBuilds] = useState(null);
    const [compareMode, setCompareMode] = useState(false);

    const egoData = egosLoading ? null : egos[id];
    const { awakeningSkills: preAwakeningSkills, corrosionSkills: preCorrosionSkills, passives: prePassives } = useSkillData("ego", id, preuptie);
    const { awakeningSkills, corrosionSkills, passives, notes } = useSkillData("ego", id, uptie);

    useEffect(() => {
        const fetchBuilds = async () => {
            setBuilds(await searchBuilds({ "egos": [id], published: true, sortBy: "popular" }, 1, 6) || []);
        }

        if (activeTab === "builds" && !builds) fetchBuilds();
    }, [activeTab, builds, id])

    useEffect(() => {
        if (egoData) document.title = `${sinnerIdMapping[egoData.sinnerId]} ${egoData.name} | Limbus Company Team Building Hub`;
    }, [egoData])

    if (egosLoading) return null;

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

    console.log(preAwakeningSkills);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
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
                    <div style={{ display: "flex", flexDirection: "column", border: "1px #777 dotted", padding: "0.2rem" }}>
                        <span>Release Date</span>
                        <span>{egoData.date}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", border: "1px #777 dotted", padding: "0.2rem" }}>
                        <span>Season</span>
                        <span>{getSeasonString(egoData.season)}</span>
                    </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", alignItems: "center", textAlign: "center", lineHeight: "1.5" }}>
                    <div style={{ height: "100%", borderLeft: "1px #777 dotted", borderBottom: "1px #777 dotted" }}></div>
                    <div style={{ height: "100%", borderBottom: "1px #777 dotted" }}>Cost</div>
                    <div style={{ height: "100%", borderRight: "1px #777 dotted", borderBottom: "1px #777 dotted" }}>Resist</div>
                    {affinities.map(affinity => [
                        <div key={`${affinity}-icon`} style={{ display: "flex", height: "100%", justifyContent: "center", borderLeft: "1px #777 dotted", borderBottom: "1px #777 dotted" }}>
                            <KeywordIcon id={affinity} />
                        </div>,
                        <span key={`${affinity}-cost`} style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", borderBottom: "1px #777 dotted" }}>
                            {affinity in egoData.cost ? egoData.cost[affinity] : <span style={{ color: "#777" }}>0</span>}
                        </span>,
                        <span key={`${affinity}-res`} style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", borderRight: "1px #777 dotted", borderBottom: "1px #777 dotted" }}>
                            {<ColoredResistance resist={egoData.resists[affinity]} />}
                        </span>
                    ])}
                </div>
                <div style={{ display: "flex", flexDirection: "column", border: "1px #777 dotted", padding: "0.5rem", gap: "0.2rem" }}>
                    <div style={{ display: "flex", gap: "1rem", alignSelf: "center" }}>
                        <div data-tooltip-id="ego-notes" className={`tab-header ${activeTab === "notes" ? "active" : ""}`} style={{ fontSize: "1rem" }} onClick={() => setActiveTab("notes")}>Notes/Explanation</div>
                        <div data-tooltip-id="ego-builds" className={`tab-header ${activeTab === "builds" ? "active" : ""}`} style={{ fontSize: "1rem" }} onClick={() => setActiveTab("builds")}>Popular Builds</div>
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
                    <TooltipTemplate id="ego-builds" contentFunc={() => <div style={{ padding: "0.5rem" }}>Loads the most popular builds that use this identity.</div>} />
                    {
                        activeTab === "notes" ?
                            <NotesTab notes={notes} /> :
                            <BuildsTab builds={builds} />
                    }
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", minWidth: "min(480px, 100%)", flex: 1, gap: "0.5rem" }}>
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
                        <div style={{ color: "#aaa", fontWeight: "bold", fontSize: "1.25rem" }}>Passives</div>
                        {passives.map((passive, i) => {
                            if (compareMode && preuptie < 2)
                                return <PassiveCard key={i} passive={passive} background={"rgba(46, 160, 67, 0.35)"} />
                            return <PassiveCard key={i} passive={passive} pre={compareMode ? prePassives[i] : null} />
                        })}
                    </div> :
                    null
                }
            </div>
        </div>
    </div>
}
