import Select from "react-select";

import NumberInput from "../components/objects/NumberInput";
import { trimPrefixes } from "../components/realtime/realtimeUtil";
import DistortedText from "../components/texts/DistortedText";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";
import { selectStyle } from "../styles/selectStyle";

export const difficulties = [
    { value: "easy", label: "Easy" },
    { value: "normal", label: "Normal" },
    { value: "hard", label: "Hard" },
    { value: "distort", label: <DistortedText>DISTORT</DistortedText> },
]

export default function SetupScreen({ mode, settings, setSettings, leaveRoom, onStart, onReset, isHost, roomId, participants }) {
    const handleSetSettings = (key, value) => {
        setSettings(p => ({ ...p, [key]: value }))
    }

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "1000px", gap: "1rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Voiceline Guesser</h1>

        {mode === "multi" && roomId && <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                Room ID: {trimPrefixes(roomId)}
            </span>
            <span className="sub-text">
                Share this ID to others so they can join this game.
            </span>
        </div>
        }

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
                    disabled={settings.infinite || (mode === "multi" && !isHost)}
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
            <NumberInput min={1} max={10} value={mode === "multi" ? 1 : settings.guesses}
                onChange={x => handleSetSettings("guesses", x)}
                style={{ textAlign: "center", width: "3ch" }}
                disabled={mode === "multi"}
            />
            {mode === "multi" && <>
                <div />
                <span className="sub-text">Guesses locked to 1 for multiplayer</span>
            </>}

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
                    disabled={mode === "multi" && !isHost}
                />
            </div>
        </div>

        {(mode === "standard" || isHost) &&
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <button onClick={() => onReset()} disabled={mode === "multi" && !isHost}>Reset to Default</button>
                <div style={{ display: "flex" }}>
                    {mode === "multi" &&
                        <button onClick={() => leaveRoom()}>
                            Leave Room
                        </button>
                    }
                    <button onClick={() => onStart()} style={{ background: "#1e7e34" }} disabled={mode === "multi" && !isHost}>
                        Begin!
                    </button>
                </div>
            </div>
        }

        {mode === "multi" && !isHost &&
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <button onClick={() => leaveRoom()}>
                    Leave Room
                </button>
            </div>
        }

        {mode === "multi" &&
            <div style={{ display: "flex", flexDirection: "column", textAlign: "center" }}>
                <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Participants: {participants.length}</span>
                {participants.map((x, i) => <span key={`${x}-${i}`}>{x}</span>)}
            </div>
        }
    </div >
}