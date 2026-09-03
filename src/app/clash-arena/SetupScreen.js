import { useState } from "react";

import PointsDisplay from "./PointsDisplay";
import NumberInput from "../components/objects/NumberInput";
import RangeInput from "../components/objects/RangeInput";
import { trimPrefixes } from "../components/realtime/realtimeUtil";
import { getGeneralTooltipProps } from "../components/tooltips/GeneralTooltip";

export default function SetupScreen({ clashBattle }) {
    const [advancedOpen, setAdvancedOpen] = useState(false);
    const [pointsPerDraft, setPointsPerDraft] = useState(clashBattle.settings.pointsPerDraft === 0 ? 6 : clashBattle.settings.pointsPerDraft);
    const [pointsDisabled, setPointsDisabled] = useState(clashBattle.settings.pointsPerDraft === 0);

    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", gap: "1rem" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Clash Arena</h1>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>
                Room ID: {trimPrefixes(clashBattle.roomId)}
            </span>
            <span className="sub-text">
                Share this ID to others so they can join this game.
            </span>
        </div>

        <span style={{ maxWidth: "1000px", textAlign: "center" }}>
            Choose your settings
        </span>

        <div style={{ display: "grid", gridTemplateColumns: "auto auto", alignItems: "center", gap: "0.5rem", width: "100%" }}>
            <div style={{ display: "flex", justifyContent: "end", fontSize: "1.1rem", textAlign: "end" }}>
                Team Size:
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <NumberInput min={1} max={10} value={clashBattle.settings.teamSize}
                    onChange={x => clashBattle.setSetting("teamSize", x)}
                    style={{ textAlign: "center", width: "5ch" }}
                    disabled={!clashBattle.isHost}
                />
            </div>

            <div style={{ display: "flex", justifyContent: "end", fontSize: "1.1rem", textAlign: "end" }}>
                Number of Rounds:
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <NumberInput min={1} max={clashBattle.settings.teamSize * 6} value={clashBattle.settings.rounds}
                    onChange={x => clashBattle.setSetting("rounds", x)}
                    style={{ textAlign: "center", width: "5ch" }}
                    disabled={!clashBattle.isHost}
                />
            </div>

            <div
                style={{ display: "flex", justifyContent: "end", fontSize: "1.1rem", textAlign: "end" }}
            >
                <span
                    className="hover-text"
                    {...getGeneralTooltipProps("Each time you draft, you get points that you spend to choose an identity. Choosing an identity that costs less points allows you to save points for later picks.")}
                >
                    Points per Draft:
                </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "start" }}>
                <NumberInput min={1} max={10} 
                    value={clashBattle.isHost ? pointsPerDraft : String(clashBattle.settings["pointsPerDraft"])}
                    onChange={x => {
                        clashBattle.setSetting("pointsPerDraft", x);
                        setPointsPerDraft(x);
                    }}
                    style={{ textAlign: "center", width: "5ch" }}
                    disabled={!clashBattle.isHost || pointsDisabled}
                />
                <label
                    {...getGeneralTooltipProps("Disable point limitations, allowing players to choose any identity while drafting.")}
                >
                    <input type="checkbox" 
                        checked={clashBattle.isHost ? pointsDisabled : (clashBattle.settings["pointsPerDraft"] === 0)}
                        onChange={() => {
                            const disabled = !pointsDisabled;
                            setPointsDisabled(disabled);
                            clashBattle.setSetting(
                                "pointsPerDraft",
                                disabled ? 0 : pointsPerDraft
                            );
                        }}
                        disabled={!clashBattle.isHost}
                    />
                    <span className="hover-text">
                        Disable points during drafting
                    </span>
                </label>
            </div>

            <div style={{ display: "flex", justifyContent: "end", fontSize: "1.1rem", textAlign: "end" }}>
                <span
                    className="hover-text"
                    {...getGeneralTooltipProps("Cycle: Players draft in the same order for each identity.\nSnake: The order players draft each identity is reversed after each set of drafts.\nRandom: Players draft each identity in a random order.")}
                >
                    Draft Order:
                </span>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <select
                    value={clashBattle.settings.draftOrder}
                    onChange={e => clashBattle.setSetting("draftOrder", e.target.value)}
                    disabled={!clashBattle.isHost}
                >
                    <option value="cycle">Cycle</option>
                    <option value="snake">Snake</option>
                    <option value="random">Random</option>
                </select>
            </div>
        </div>

        <button onClick={() => setAdvancedOpen(p => !p)}>{advancedOpen ? "Close" : "Open"} Advanced Settings</button>
        {advancedOpen &&
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", alignItems: "start", gap: "0.5rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "auto auto", alignItems: "center", gap: "0.5rem" }}>
                    <div
                        style={{ display: "flex", justifyContent: "end", fontSize: "1.1rem", textAlign: "end" }}
                        {...getGeneralTooltipProps("Number of Primary statuses per round. These are the 7 main archetypes plus Ammo. Most identities benefit from one or two of these.")}
                    >
                        <span className="hover-text" >Number of Statuses:</span>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <RangeInput
                            min={1} max={10}
                            value={clashBattle.settings.numStatus}
                            onChange={x => clashBattle.setSetting("numStatus", x)}
                            disabled={!clashBattle.isHost}
                        />
                    </div>

                    <div
                        style={{ display: "flex", justifyContent: "end", fontSize: "1.1rem", textAlign: "end" }}
                        {...getGeneralTooltipProps("Chance to generate a secondary status. These are general statuses like Haste/Bind that only a small number of identities benefit from.")}
                    >
                        <span className="hover-text" >Secondary Status Chance:</span>
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <NumberInput
                            min={0} max={100}
                            value={clashBattle.settings.secondaryStatusChance}
                            onChange={x => clashBattle.setSetting("secondaryStatusChance", x)}
                            disabled={!clashBattle.isHost}
                            style={{ width: "5ch" }}
                        />
                    </div>

                </div>

                <div style={{ display: "grid", gridTemplateColumns: "auto auto", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "end", fontSize: "1.1rem", textAlign: "end" }}>
                        HP Percent Range:
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <RangeInput
                            min={1} max={100}
                            value={clashBattle.settings.hp}
                            onChange={x => clashBattle.setSetting("hp", x)}
                            disabled={!clashBattle.isHost}
                        />
                    </div>

                    <div style={{ display: "flex", justifyContent: "end", fontSize: "1.1rem", textAlign: "end" }}>
                        Speed Range:
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <RangeInput
                            min={1} max={20}
                            value={clashBattle.settings.speed}
                            onChange={x => clashBattle.setSetting("speed", x)}
                            disabled={!clashBattle.isHost}
                        />
                    </div>

                    <div style={{ display: "flex", justifyContent: "end", fontSize: "1.1rem", textAlign: "end" }}>
                        SP Range:
                    </div>

                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <RangeInput
                            min={-45} max={45}
                            value={clashBattle.settings.sp}
                            onChange={x => clashBattle.setSetting("sp", x)}
                            disabled={!clashBattle.isHost}
                        />
                    </div>
                </div>
            </div>
        }

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            {clashBattle.isHost &&
                <button onClick={() => clashBattle.resetSettings()}>Reset to Default</button>
            }
            <div style={{ display: "flex" }}>
                <button onClick={() => clashBattle.leaveRoom()}>
                    Leave Room
                </button>
                {clashBattle.isHost &&
                    <button onClick={() => clashBattle.startDraft()} style={{ background: "#1e7e34" }} disabled={clashBattle.loading}>
                        Begin!
                    </button>
                }
            </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", textAlign: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>Players: {clashBattle.participants.length}</span>
            <span className="sub-text">Max Players: 8</span>
            {clashBattle.participants.map((x, i) => <span key={`${x}-${i}`}>{x}</span>)}
        </div>

        <PointsDisplay clashBattle={clashBattle} />
    </div >
}
