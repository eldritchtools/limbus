import KeywordIcon from "../components/icons/KeywordIcon";
import { uiColors } from "../lib/colors";
import { getNextDayOfWeek } from "../timers/timerFunc";
import { isDaysAway, TimeString } from "../timers/TimersTable";

const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

const cellStyle = { display: "flex", alignItems: "center", justifyContent: "center", border: "1px var(--secondary-border-color) solid", padding: "0.25rem" }

export default function LuxTable() {
    return <div style={{ display: "flex", flexDirection: "column", textAlign: "center", gap: "0.5rem" }}>
        <div className="title-text">Luxcavation Cheatsheet</div>
        <span className="sub-text">Encounters to be added in the future</span>
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
                <div className="title-text" style={{ ...cellStyle, gridColumn: "span 7", gap: "0.5rem" }}><KeywordIcon id={"slash"} />SLASH</div>
                <div className="title-text" style={cellStyle}>XP (Lvl 18, 38)</div>
                <div className="title-text" style={{ ...cellStyle, gridColumn: "span 7", gap: "0.5rem" }}><KeywordIcon id={"pierce"} />PIERCE</div>
                <div className="title-text" style={cellStyle}>XP (Lvl 28, 43)</div>
                <div className="title-text" style={{ ...cellStyle, gridColumn: "span 7", gap: "0.5rem" }}><KeywordIcon id={"blunt"} />BLUNT</div>
                <div className="title-text" style={cellStyle}>XP (Lvl 48, 53, 58)</div>
                <div className="title-text" style={{ ...cellStyle, gap: "0.5rem" }}>
                    <KeywordIcon id={"slash"} />
                    <KeywordIcon id={"pierce"} />
                    <KeywordIcon id={"blunt"} />
                    ALL
                </div>
                <div className="title-text" style={{ ...cellStyle, gridColumn: "span 2", gap: "0.5rem" }}><KeywordIcon id={"slash"} />SLASH</div>
                <div className="title-text" style={{ ...cellStyle, gridColumn: "span 2", gap: "0.5rem" }}><KeywordIcon id={"pierce"} />PIERCE</div>
                <div className="title-text" style={{ ...cellStyle, gridColumn: "span 2", gap: "0.5rem" }}><KeywordIcon id={"blunt"} />BLUNT</div>
                <div className="title-text" style={cellStyle}>THREAD (ALL LEVELS)</div>
                <div className="title-text" style={{ ...cellStyle, gap: "0.5rem" }}><KeywordIcon id={"wrath"} />WRATH</div>
                <div className="title-text" style={{ ...cellStyle, gap: "0.5rem" }}><KeywordIcon id={"lust"} />LUST</div>
                <div className="title-text" style={{ ...cellStyle, gap: "0.5rem" }}><KeywordIcon id={"sloth"} />SLOTH</div>
                <div className="title-text" style={{ ...cellStyle, gap: "0.5rem" }}><KeywordIcon id={"gluttony"} />GLUTTONY</div>
                <div className="title-text" style={{ ...cellStyle, gap: "0.5rem" }}><KeywordIcon id={"gloom"} />GLOOM</div>
                <div className="title-text" style={{ ...cellStyle, gap: "0.5rem" }}><KeywordIcon id={"pride"} />PRIDE</div>
                <div className="title-text" style={{ ...cellStyle, gap: "0.5rem" }}><KeywordIcon id={"envy"} />ENVY</div>
            </div>
        </div>
    </div>
}