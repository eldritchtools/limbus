import KeywordIcon from "../components/icons/KeywordIcon";
import MarkdownRenderer from "../components/markdown/MarkdownRenderer";
import { uiColors } from "../lib/colors";
import { threadLux } from "../lib/training";
import { getNextDayOfWeek } from "../timers/timerFunc";
import { isDaysAway, TimeString } from "../timers/TimersTable";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const cellStyle = { display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", border: "1px var(--secondary-border-color) solid", padding: "0.25rem" };

function CellTitle({ ids, title }) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
        {ids.map(id => <KeywordIcon key={id} id={id} />)}
        {title}
    </div>
}

function EncountersComponent({ levels, type }) {
    const str = levels.map(x => `{encounter:luxcavation|${x}-${type}}`).join("\n");
    return <MarkdownRenderer content={str} />
}

export default function LuxTable() {
    const threadLevels = [...Object.keys(threadLux)];

    return <div style={{ display: "flex", flexDirection: "column", textAlign: "center", gap: "0.5rem" }}>
        <div className="title-text">Luxcavation Cheatsheet</div>
        <div style={{ overflowX: "auto", maxWidth: "95vw" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(8, minmax(100px, 1fr))", width: "max-content" }}>
                <div />
                {
                    days.map((day, i) => {
                        const date = getNextDayOfWeek(i);
                        const today = isDaysAway(date, 6);
                        return <div key={i} style={{ ...cellStyle, flexDirection: "column", textAlign: "center" }}>
                            <span className="title-text" style={{ color: today ? uiColors.green : "inherit" }}>{today ? `>${day}<` : day}</span>
                            <TimeString date={date} />
                        </div>
                    })
                }
                <div className="title-text" style={cellStyle}>XP (Lvl 8, 33)</div>
                <div className="title-text" style={{ ...cellStyle, gridColumn: "span 7" }}>
                    <CellTitle ids={["slash"]} title={"SLASH"} />
                </div>
                <div className="title-text" style={cellStyle}>XP (Lvl 18, 38)</div>
                <div className="title-text" style={{ ...cellStyle, gridColumn: "span 7" }}>
                    <CellTitle ids={["pierce"]} title={"PIERCE"} />
                </div>
                <div className="title-text" style={cellStyle}>XP (Lvl 28, 43)</div>
                <div className="title-text" style={{ ...cellStyle, gridColumn: "span 7" }}>
                    <CellTitle ids={["blunt"]} title={"BLUNT"} />
                </div>
                <div className="title-text" style={cellStyle}>XP (Lvl 48, 53, 58)</div>
                <div className="title-text" style={{ ...cellStyle }}>
                    <CellTitle ids={["slash", "pierce", "blunt"]} title={"ALL"} />
                </div>
                <div className="title-text" style={{ ...cellStyle, gridColumn: "span 2" }}>
                    <CellTitle ids={["slash"]} title={"SLASH"} />
                </div>
                <div className="title-text" style={{ ...cellStyle, gridColumn: "span 2" }}>
                    <CellTitle ids={["pierce"]} title={"PIERCE"} />
                </div>
                <div className="title-text" style={{ ...cellStyle, gridColumn: "span 2" }}>
                    <CellTitle ids={["blunt"]} title={"BLUNT"} />
                </div>
                <div className="title-text" style={cellStyle}>THREAD (ALL LEVELS)</div>
                <div className="title-text" style={cellStyle}>
                    <CellTitle ids={["wrath"]} title={"WRATH"} />
                </div>
                <div className="title-text" style={cellStyle}>
                    <CellTitle ids={["lust"]} title={"Lust"} />
                </div>
                <div className="title-text" style={cellStyle}>
                    <CellTitle ids={["sloth"]} title={"SLOTH"} />
                </div>
                <div className="title-text" style={cellStyle}>
                    <CellTitle ids={["gluttony"]} title={"GLUTTONY"} />
                </div>
                <div className="title-text" style={cellStyle}>
                    <CellTitle ids={["gloom"]} title={"GLOOM"} />
                </div>
                <div className="title-text" style={cellStyle}>
                    <CellTitle ids={["pride"]} title={"PRIDE"} />
                </div>
                <div className="title-text" style={cellStyle}>
                    <CellTitle ids={["envy"]} title={"ENVY"} />
                </div>
            </div>
        </div>

        <div className="title-text">Encounter Links</div>
        <div style={{ display: "flex", flexWrap: "wrap", alignSelf: "center", fontWeight: "bold", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <CellTitle ids={["slash"]} title={"SLASH"} />
                <EncountersComponent levels={[8, 33, 48, 53, 58]} type={"slash"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <CellTitle ids={["pierce"]} title={"PIERCE"} />
                <EncountersComponent levels={[18, 38, 48, 53, 58]} type={"pierce"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <CellTitle ids={["blunt"]} title={"BLUNT"} />
                <EncountersComponent levels={[28, 43, 48, 53, 58]} type={"blunt"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <CellTitle ids={["wrath"]} title={"WRATH"} />
                <EncountersComponent levels={threadLevels} type={"wrath"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <CellTitle ids={["lust"]} title={"Lust"} />
                <EncountersComponent levels={threadLevels} type={"lust"} />
            </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", alignSelf: "center", fontWeight: "bold", gap: "1rem" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <CellTitle ids={["sloth"]} title={"SLOTH"} />
                <EncountersComponent levels={threadLevels} type={"sloth"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <CellTitle ids={["gluttony"]} title={"GLUTTONY"} />
                <EncountersComponent levels={threadLevels} type={"gluttony"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <CellTitle ids={["gloom"]} title={"GLOOM"} />
                <EncountersComponent levels={threadLevels} type={"gloom"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <CellTitle ids={["pride"]} title={"PRIDE"} />
                <EncountersComponent levels={threadLevels} type={"pride"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
                <CellTitle ids={["envy"]} title={"ENVY"} />
                <EncountersComponent levels={threadLevels} type={"envy"} />
            </div>
        </div>
    </div>
}