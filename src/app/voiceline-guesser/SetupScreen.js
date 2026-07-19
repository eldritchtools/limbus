import Select from "react-select";

import NumberInput from "../components/objects/NumberInput";
import DistortedText from "../components/texts/DistortedText";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { selectStyle } from "../styles/selectStyle";

export const difficulties = [
    { value: "easy", label: "Easy" },
    { value: "normal", label: "Normal" },
    { value: "hard", label: "Hard" },
    { value: "distort", label: <DistortedText>DISTORT</DistortedText> },
]

export default function SetupScreen({ settings, setSettings, onStart, onReset }) {
    const handleSetSettings = (key, value) => {
        setSettings(p => ({ ...p, [key]: value }))
    }

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "1000px", gap: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Voiceline Guesser</h1>
        <span style={{ maxWidth: "1000px", textAlign: "center" }}>
            Choose your settings
        </span>

        <div style={{ display: "grid", gridTemplateColumns: "auto auto", alignItems: "center", gap: "0.5rem", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "end" }}>
                <span style={{ fontSize: "1.1rem", textAlign: "end" }}>
                    Number of Rounds:
                </span>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <NumberInput min={1} max={100} value={settings.rounds}
                    onChange={x => handleSetSettings("rounds", x)}
                    style={{ textAlign: "center", width: "5ch" }}
                    disabled={settings.infinite}
                />
                <label>
                    <input type="checkbox" checked={settings.infinite} onChange={e => handleSetSettings("infinite", e.target.checked)} />
                    <span>
                        Infinite
                    </span>
                </label>
            </div>

            <div style={{ display: "flex", justifyContent: "end" }}>
                <span className="hover-text" style={{ fontSize: "1.1rem", textAlign: "end" }}
                    {...getGeneralTooltipProps("Number of chances you get to guess the answer per round.")}
                >
                    Guesses per Round:
                </span>
            </div>
            <NumberInput min={1} max={10} value={settings.guesses}
                onChange={x => handleSetSettings("guesses", x)}
                style={{ textAlign: "center", width: "3ch" }}
            />

            <div style={{ display: "flex", justifyContent: "end" }}>
                <span className="hover-text" style={{ fontSize: "1.1rem", textAlign: "end" }}
                    {...getGeneralTooltipProps("Higher difficulties will play shorter segments of or begin at random points in the voiceline. The Distort difficulty applies transformations on the clip.")}
                >
                    Difficulty:
                </span>
            </div>

            <div style={{ display: "flex" }}>
                <Select
                    options={difficulties}
                    styles={selectStyle}
                    value={difficulties.find(x => x.value === settings.difficulty)}
                    onChange={x => handleSetSettings("difficulty", x.value)}
                />
            </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <button onClick={() => onReset()}>Reset to Default</button>
            <div style={{ display: "flex" }}>
                <button onClick={() => onStart()} style={{ background: "#1e7e34" }}>
                    Begin!
                </button>
            </div>
        </div>
    </div >
}