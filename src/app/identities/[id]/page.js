"use client";

import React, { useEffect, useState } from "react";

import TeamBuild from "@/app/components/contentCards/TeamBuild";
import { useSkillData } from "@/app/components/dataHooks/skills";
import { useData } from "@/app/components/DataProvider";
import Icon from "@/app/components/icons/Icon";
import IdentityIcon from "@/app/components/icons/IdentityIcon";
import KeywordIcon from "@/app/components/icons/KeywordIcon";
import RarityIcon from "@/app/components/icons/RarityIcon";
import SinnerIcon from "@/app/components/icons/SinnerIcon";
import MarkdownRenderer from "@/app/components/markdown/MarkdownRenderer";
import NumberInputWithButtons from "@/app/components/objects/NumberInputWithButtons";
import UptieSelector from "@/app/components/selectors/UptieSelector";
import PassiveCard from "@/app/components/skill/PassiveCard";
import SkillCard from "@/app/components/skill/SkillCard";
import DiffedText from "@/app/components/texts/DiffedText";
import TooltipTemplate from "@/app/components/tooltips/TooltipTemplate";
import { searchBuilds } from "@/app/database/builds";
import { ColoredResistance } from "@/app/lib/colors";
import { getSeasonString, LEVEL_CAP, sinnerIdMapping } from "@/app/lib/constants";
import { constructDefenseLevel, constructHp, constructSpeed } from "@/app/lib/identity";
import { constructSkillLabel } from "@/app/lib/skill";

function NotesTab({ notes }) {
    if (!notes || !notes.usage) return <div style={{ color: "#777", textAlign: "center" }}>Not yet available...</div>;
    if (!notes.other)
        return <div style={{ display: "flex", flexDirection: "column" }}>
            {notes.usage.map((str, i) => <div key={i} style={{ display: "flex", flexDirection: "row", gap: "0.25rem", lineHeight: "1.4" }}>
                • <MarkdownRenderer content={str} />
            </div>)}
        </div>

    return <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ color: "#aaa", fontSize: "0.8rem" }}>Usage Tips</div>
        {notes.usage.map((str, i) => <div key={i} style={{ display: "flex", flexDirection: "row", gap: "0.25rem", lineHeight: "1.4" }}>
            • <MarkdownRenderer content={str} />
        </div>)}
        <div style={{ height: "0.5rem" }} />
        <div style={{ color: "#aaa", fontSize: "0.8rem" }}>Other Details</div>
        {notes.other.map((str, i) => <div key={i} style={{ display: "flex", flexDirection: "row", gap: "0.25rem", lineHeight: "1.4" }}>
            • <MarkdownRenderer content={str} />
        </div>)}
    </div>
}

function BuildsTab({ builds }) {
    if (!builds) return <div style={{ color: "#777", textAlign: "center" }}>Loading builds...</div>;
    if (builds.length === 0) return <div style={{ color: "#777", textAlign: "center" }}>No builds found.</div>;
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", marginLeft: "14px" }}>
        {builds.map(build => <TeamBuild key={build.id} build={build} size={"M"} complete={false} />)}
    </div>
}

export default function Identity({ params }) {
    const { id } = React.use(params);
    const [identities, identitiesLoading] = useData("identities");
    const [level, setLevel] = useState(LEVEL_CAP);
    const [uptie, setUptie] = useState(4);
    const [preuptie, setPreuptie] = useState(1);
    const [activeTab, setActiveTab] = useState("notes");
    const [builds, setBuilds] = useState(null);
    const [compareMode, setCompareMode] = useState(false);

    const identityData = identitiesLoading ? null : identities[id];
    const { skills: preSkills, combatPassives: preCombatPassives, supportPassives: preSupportPassives } = useSkillData("identity", id, preuptie);
    const { skills, combatPassives, supportPassives, notes } = useSkillData("identity", id, uptie);

    useEffect(() => {
        const fetchBuilds = async () => {
            setBuilds(await searchBuilds({ "identities": [id], published: true, sortBy: "popular" }, 1, 6) || []);
        }

        if (activeTab === "builds" && !builds) fetchBuilds();
    }, [activeTab, builds, id])

    useEffect(() => {
        if (identityData) document.title = `${sinnerIdMapping[identityData.sinnerId]} ${identityData.name} | Limbus Company Tools`;
    }, [identityData])

    if (identitiesLoading) return null;

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

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
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
                    <div style={{ display: "flex", flexDirection: "column", border: "1px #777 dotted", padding: "0.2rem" }}>
                        <span>Release Date</span>
                        <span>{identityData.date}</span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", border: "1px #777 dotted", padding: "0.2rem" }}>
                        <span>Season</span>
                        <span>{getSeasonString(identityData.season)}</span>
                    </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", textAlign: "center" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", alignItems: "center", border: "1px #777 dotted" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}><Icon path={"hp"} style={{ width: "32px", height: "32px" }} /></div>
                        <span style={{ borderLeft: "1px #777 dotted" }}>{constructHp(identityData, level)}</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", alignItems: "center", border: "1px #777 dotted" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}><Icon path={"speed"} style={{ width: "32px", height: "32px" }} /></div>
                        <span style={{ borderLeft: "1px #777 dotted" }}>{
                            compareMode ?
                                <DiffedText before={constructSpeed(identityData, preuptie)} after={constructSpeed(identityData, uptie)} /> :
                                constructSpeed(identityData, uptie)
                        }</span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", alignItems: "center", border: "1px #777 dotted" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}><Icon path={"defense level"} style={{ width: "32px", height: "32px" }} /></div>
                        <span style={{ borderLeft: "1px #777 dotted" }}>{constructDefenseLevel(identityData, level)}</span>
                    </div>
                </div>
                <div style={{ border: "1px #777 dotted", padding: "0.2rem", textAlign: "center" }}>Resists</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", textAlign: "center" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", alignItems: "center", border: "1px #777 dotted" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}><KeywordIcon id={"Slash"} /></div>
                        <span style={{ borderLeft: "1px #777 dotted" }}><ColoredResistance resist={identityData.resists.slash} /></span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", alignItems: "center", border: "1px #777 dotted" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}><KeywordIcon id={"Pierce"} /></div>
                        <span style={{ borderLeft: "1px #777 dotted" }}><ColoredResistance resist={identityData.resists.pierce} /></span>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", alignItems: "center", border: "1px #777 dotted" }}>
                        <div style={{ display: "flex", justifyContent: "center" }}><KeywordIcon id={"Blunt"} /></div>
                        <span style={{ borderLeft: "1px #777 dotted" }}><ColoredResistance resist={identityData.resists.blunt} /></span>
                    </div>
                </div>
                <div style={{ border: "1px #777 dotted", padding: "0.2rem", textAlign: "center", display: "flex", flexDirection: "column" }}>
                    <div style={{ borderBottom: "1px #777 dotted" }}>Keywords</div>
                    <div style={{ marginTop: "0.2rem" }}>{(identityData.skillKeywordList || []).map(x => <KeywordIcon key={x} id={x} />)}</div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", border: "1px #777 dotted", padding: "0.5rem", gap: "0.2rem" }}>
                    <div style={{ display: "flex", gap: "1rem", alignSelf: "center" }}>
                        <div data-tooltip-id="identity-notes" className={`tab-header ${activeTab === "notes" ? "active" : ""}`} style={{ fontSize: "1rem" }} onClick={() => setActiveTab("notes")}>Tips/Summary</div>
                        <div data-tooltip-id="identity-builds" className={`tab-header ${activeTab === "builds" ? "active" : ""}`} style={{ fontSize: "1rem" }} onClick={() => setActiveTab("builds")}>Popular Builds</div>
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
                    <TooltipTemplate id="identity-builds" contentFunc={() => <div style={{ padding: "0.5rem" }}>Loads the most popular builds that use this identity.</div>} />
                    {
                        activeTab === "notes" ?
                            <NotesTab notes={notes} /> :
                            <BuildsTab builds={builds} />
                    }
                </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", minWidth: "min(480px, 100%)", flex: 1, gap: "0.5rem" }}>
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
                            <div style={{ color: "#aaa", fontWeight: "bold", fontSize: "1.25rem" }}>Combat Passives</div>
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
                            <div style={{ color: "#aaa", fontWeight: "bold", fontSize: "1.25rem" }}>Support Passives</div>
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
        </div>
    </div>
}
