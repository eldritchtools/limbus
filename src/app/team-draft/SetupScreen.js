"use client";

import { defaultSettings } from "./page";
import styles from "./SetupScreen.module.css";
import NoPrefetchLink from "../components/NoPrefetchLink";
import NumberInput from "../components/objects/NumberInput";
import WbList from "../components/objects/WbList";
import { getGeneralTooltipProps } from "../components/tooltips/TooltipProps";

export default function SetupScreen({ settings, setSettings, wbState, wbOpen, setWbOpen, onStart, loading }) {
    const handleSetSettings = (key, value) => {
        setSettings(p => ({ ...p, [key]: value }))
    }

    const resetSettings = () => {
        setSettings(defaultSettings)
    }

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "start", width: "100%", maxWidth: "1000px", gap: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Team Draft</h1>
        <span style={{ maxWidth: "1000px", textAlign: "start" }}>
            Build a full team one sinner at a time.
            <br /> <br />
            Over up to 12 rounds, you will be presented with multiple randomly generated options, each consisting of one Identity and a number of E.G.O. You have a limited time to choose one option before moving to the next round. If you fail to choose, one option will be selected at random.
            <br /> <br />
            After all rounds are complete, your team can be exported as a team code for use in Mirror Dungeons, Refraction Railways, Reflectrials, or other content.
            <br /> <br />
            To limit the available options to Identities and E.G.O you own, use the black/whitelist to apply your Company data. This requires it to be set in the  <NoPrefetchLink className="text-link" href="/company">Company</NoPrefetchLink> page.
        </span>

        <div className={styles.setupLayout}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    <span className="hover-text" style={{ fontSize: "1.2rem", textAlign: "end" }}
                        {...getGeneralTooltipProps("This is the number of identities you'll end up picking. Setting this to a lower value means leaving some sinners without an identity.")}
                    >
                        Number of Rounds:
                    </span>
                    <NumberInput min={1} max={12} value={settings.rounds}
                        onChange={x => handleSetSettings("rounds", x)}
                        style={{ textAlign: "center", width: "3ch" }}
                    />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    <span className="hover-text" style={{ fontSize: "1.2rem", textAlign: "end" }}
                        {...getGeneralTooltipProps("Maximum number of generated choices per round. The actual number of choices generated may be less if there aren't enough possible options remaining.")}
                    >
                        Choices per Round:
                    </span>
                    <NumberInput min={2} max={10} value={settings.choices}
                        onChange={x => handleSetSettings("choices", x)}
                        style={{ textAlign: "center", width: "3ch" }}
                    />
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    <span className="hover-text" style={{ fontSize: "1.2rem", textAlign: "end" }}
                        {...getGeneralTooltipProps("The number of seconds you get to choose an option. Setting this to 0 will disable the timer allowing you to draft without time pressure.")}
                    >
                        Timer Length:
                    </span>
                    <NumberInput min={0} max={60} value={settings.choiceTime}
                        onChange={x => handleSetSettings("choiceTime", x)}
                        style={{ textAlign: "center", width: "3ch" }}
                    />
                </div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <label>
                    <input type="checkbox" checked={settings.autoAdvance} onChange={e => handleSetSettings("autoAdvance", e.target.checked)} />
                    <span className="hover-text" style={{ fontSize: "1.2rem" }}
                        {...getGeneralTooltipProps("If set, the countdown to the next round immediately begins after selecting an option in the previous round.")}
                    >
                        Auto-advance rounds
                    </span>
                </label>


                <div style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    <span className="hover-text" style={{ fontSize: "1.2rem", textAlign: "end" }}
                        {...getGeneralTooltipProps("The probability of having empty E.G.O slots in options. ZAYIN is always guaranteed to have something.")}
                    >
                        Unset E.G.O Chance:
                    </span>
                    <div style={{ display: "flex", alignItems: "center" }}>
                        <NumberInput min={0} max={100} value={settings.emptyEgoProb} onChange={x => handleSetSettings("emptyEgoProb", x)} style={{ textAlign: "center", width: "3ch" }} />
                        <span>%</span>
                    </div>
                </div>

                <span>Randomization Rule:</span>
                <div style={{ display: "flex", flexDirection: "row", gap: "0.5rem" }}>
                    <label>
                        <input type="radio" value="strict" checked={settings.randomizationRule === "strict"} onChange={e => handleSetSettings("randomizationRule", e.target.value)} />
                        <span {...getGeneralTooltipProps("All options will use identities and E.G.O of the same sinner.")}
                            className="hover-text"
                        >
                            Strict
                        </span>
                    </label>
                    <label>
                        <input type="radio" value="standard" checked={settings.randomizationRule === "standard"} onChange={e => handleSetSettings("randomizationRule", e.target.value)} />
                        <span {...getGeneralTooltipProps("Options will choose identities of random sinners. E.G.O will be for the corresponding sinner only. Identities that appear in a round cannot appear again in future rounds unless there are no longer any options.")}
                            className="hover-text"
                        >
                            Standard
                        </span>
                    </label>
                    <label>
                        <input type="radio" value="chaos" checked={settings.randomizationRule === "chaos"} onChange={e => handleSetSettings("randomizationRule", e.target.value)} />
                        <span {...getGeneralTooltipProps("All options will use identities and E.G.O of completely random sinners. Identities that appear in a round cannot appear again in future rounds unless there are no longer any options.")}
                            className="hover-text"
                        >
                            Chaos
                        </span>
                    </label>
                </div>
            </div>

            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
                <button onClick={() => resetSettings()}>Reset to Default</button>
                <button onClick={() => setWbOpen(p => !p)}>
                    {wbOpen ? "Hide " : "Show "}Black/Whitelist{wbState.list.length > 0 ? ` (${wbState.list.length})` : null}
                </button>
                <div style={{ display: "flex" }}>
                    <button onClick={() => onStart()} style={{ background: "#1e7e34" }} disabled={loading}>
                        {loading ? "Loading..." : "Begin Draft!"}
                    </button>
                </div>
            </div>
        </div>

        {wbOpen && <WbList wbState={wbState} />}
    </div>
}