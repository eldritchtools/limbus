import { additionalInfoLabels, categories } from "./util";
import NumberInput from "../components/objects/NumberInput";
import PageHeader from "../components/pageTemplates/PageHeader";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";

export default function SetupScreen({ settings, setSettings, onStart, onReset }) {
    const handleSetSettings = (key, value) => {
        setSettings(p => ({ ...p, [key]: value }))
    }

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: "1000px", gap: "1rem" }}>
        <PageHeader
            title={"Shadow Guesser"}
            mainDesc={<>
                Guess what the silhouette belongs to.
                <br /> <br />
                You will be shown a silhouette of something from the game. Try your best to guess what it belongs to.
                <br /> <br />
                Unlike the other guessers, Daily and Multiplayer mode are unavailable. More features will be added over time.
            </>}
            showAd={false}
        ></PageHeader>

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
                    {...getGeneralTooltipProps("Whether to show the category of the current round.")}
                    onClick={() => handleSetSettings("showCategory", !settings.showCategory)}
                >
                    Show Category:
                </span>
            </div>

            <div style={{ display: "flex" }}>
                <label>
                    <input type="checkbox" checked={settings.showCategory} onChange={e => handleSetSettings("showCategory", e.target.checked)} />
                </label>
            </div>

            <div style={{ display: "flex", justifyContent: "end" }}>
                <span className="hover-text" style={{ fontSize: "1.1rem", textAlign: "end" }}
                    {...getGeneralTooltipProps("Show additional info as hints for the current round.")}
                >
                    Additional Info:
                </span>
            </div>

            <div style={{ display: "flex" }}>
                <select value={settings.additionalInfo} onChange={x => handleSetSettings("additionalInfo", x.target.value)}>
                    {additionalInfoLabels.map((x, i) => <option key={i} value={i}>{x}</option>)}
                </select>
            </div>

            <div style={{ display: "flex", justifyContent: "end" }}>
                <span style={{ fontSize: "1.1rem", textAlign: "end" }}>
                    Categories:
                </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", alignItems: "start", gap: "0.2rem" }}>
                {Object.entries(categories).map(([id, data]) =>
                    <label key={id}>
                        <input type="checkbox"
                            checked={settings.categories.includes(id)}
                            onChange={e => {
                                if (e.target.checked)
                                    handleSetSettings("categories", [...settings.categories, id])
                                else
                                    handleSetSettings("categories", settings.categories.filter(x => x !== id))
                            }}
                        />
                        <span>{data.label}</span>
                    </label>
                )}
                <span className="sub-text">
                    More categories will be added over time.
                </span>
            </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <button onClick={() => onReset()}>Reset to Default</button>
            <button onClick={() => onStart()} style={{ background: "#1e7e34" }}>
                Begin!
            </button>
        </div>
    </div>
}