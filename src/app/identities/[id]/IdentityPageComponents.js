import MarkdownRendererServer from "@/app/components/markdown/MarkdownRendererServer";
import PassiveCard from "@/app/components/skill/PassiveCard";
import SkillCard from "@/app/components/skill/SkillCard";
import { constructSkillLabel } from "@/app/lib/skill";

export function NotesTab({ notes }) {
    return <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {(!notes || !notes.usage) &&
            <div style={{ color: "var(--disabled-text-color)", textAlign: "center" }}>Not yet available...</div>
        }
        {notes && notes.usage && <>
            {notes.other && <div className="sub-text">Usage Tips</div>}
            {notes.usage.map((str, i) => <div key={i} style={{ display: "flex", flexDirection: "row", gap: "0.25rem", lineHeight: "1.4" }}>
                • <MarkdownRendererServer content={str} />
            </div>)}
        </>
        }
        {notes && notes.other && <>
            <div style={{ height: "0.5rem" }} />
            <div className="sub-text">Other Details</div>
            {notes.other.map((str, i) => <div key={i} style={{ display: "flex", flexDirection: "row", gap: "0.25rem", lineHeight: "1.4" }}>
                • <MarkdownRendererServer content={str} />
            </div>)}
        </>}
    </div>
}

export function SkillsTab({ identityData, level, skills, preSkills, combatPassives, supportPassives, passivesPreMapping, compareMode, serverText }) {
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
                            serverText={serverText}
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
                        serverText={serverText}
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
                                    serverText={serverText}
                                /> :
                                <PassiveCard
                                    passive={passive}
                                    background={"rgba(46, 160, 67, 0.35)"}
                                    noBorder={true}
                                    serverText={serverText}
                                />
                        ) :
                            <PassiveCard
                                passive={passive}
                                noBorder={true}
                                serverText={serverText}
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
                                        serverText={serverText}
                                    /> :
                                    <PassiveCard
                                        passive={passive}
                                        background={"rgba(46, 160, 67, 0.35)"}
                                        noBorder={true}
                                        serverText={serverText}
                                    />
                            ) :
                                <PassiveCard
                                    passive={passive}
                                    noBorder={true}
                                    serverText={serverText}
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