import MarkdownRendererServer from "@/app/components/markdown/MarkdownRendererServer";
import PassiveCard from "@/app/components/skill/PassiveCard";
import SkillCard from "@/app/components/skill/SkillCard";
import { constructSkillLabel } from "@/app/lib/skill";


export function NotesTab({ notes }) {
    return <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {(!notes || !notes.main) &&
            <div style={{ color: "var(--disabled-text-color)", textAlign: "center" }}>Not yet available...</div>
        }
        {notes && notes.main && <>
            {notes.other && <div className="sub-text">Main</div>}
            {notes.main.map((str, i) => <div key={i} style={{ display: "flex", flexDirection: "row", gap: "0.25rem", lineHeight: "1.4" }}>
                • <MarkdownRendererServer content={str} />
            </div>)}
        </>
        }
        {notes && notes.other && <>
            <div style={{ height: "0.5rem" }} />
            <div className="sub-text">Other</div>
            {notes.other.map((str, i) => <div key={i} style={{ display: "flex", flexDirection: "row", gap: "0.25rem", lineHeight: "1.4" }}>
                • <MarkdownRendererServer content={str} />
            </div>)}
        </>}
        {/* <HorizontalDivider />
        <span style={{ textAlign: "center" }}>Check out the Community Rating or Community Reviews tabs to view the community&apos;s thoughts or leave your own!</span> */}
    </div>
}

export function SkillsTab({ awakeningSkills, preAwakeningSkills, corrosionSkills, preCorrosionSkills, passives, prePassives, compareMode, preuptie, serverText }) {
    return <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "0.25rem" }}>
        <div className="title-text">Skills</div>
        <div style={{ display: "flex", flexDirection: "row", flexWrap: "wrap" }}>
            {awakeningSkills.map((skill, i) => <div key={i} style={{ flex: 1, minWidth: "min(500px, 100%)" }}>
                <SkillCard
                    skill={skill.data}
                    label={constructSkillLabel("awakening")}
                    pre={compareMode ? preAwakeningSkills[i].data : null}
                    noBorder={true}
                    serverText={serverText}
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
                    serverText={serverText}
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
                            serverText={serverText}
                        />
                    return <PassiveCard key={i}
                        passive={passive}
                        pre={compareMode ? prePassives[i] : null}
                        noBorder={true}
                        serverText={serverText}
                    />
                })}
            </div> :
            null
        }
    </div>
}