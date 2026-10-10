import { useState } from "react";

import PointsDisplay from "./PointsDisplay";
import { biasText } from "./util";
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

        {clashBattle.isHost ?
            <button
                onClick={clashBattle.isPublic ? clashBattle.closeToPublic : clashBattle.openToPublic}
                {...getGeneralTooltipProps("Opening the room to the public allows other players to find the room on the host/join room screen. Rooms are automatically closed when reaching 8 players. Note that players can still join the room even if it's closed if they already know the room id.")}
                disabled={clashBattle.participants.length >= 8}
            >
                {clashBattle.isPublic ? "Close" : "Open"} to public
            </button> :
            <span>
                Room is {clashBattle.isPublic ? "Opened" : "Closed"} to public
            </span>
        }

        <span style={{ maxWidth: "1000px", textAlign: "center" }}>
            Choose your settings
        </span>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, auto)", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "end", fontSize: "1.1rem", textAlign: "end" }}>
                Team Size:
            </div>

            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                <NumberInput min={1} max={10} value={clashBattle.settings.teamSize}
                    onChange={x => {
                        clashBattle.setSetting("teamSize", x);
                        if (clashBattle.settings.rounds > x * 6) clashBattle.setSetting("rounds", x * 6);
                    }}
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

            <div style={{ textAlign: "end" }}>
                <span
                    className="hover-text"
                    {...getGeneralTooltipProps("Each time you draft, you get points that you spend to choose an identity. Choosing an identity that costs less points allows you to save points for later picks.")}
                >
                    Points per Draft:
                </span>
            </div>
            <NumberInput min={1} max={10}
                value={clashBattle.isHost ? pointsPerDraft : String(clashBattle.settings["pointsPerDraft"])}
                onChange={x => {
                    clashBattle.setSetting("pointsPerDraft", x);
                    setPointsPerDraft(x);
                }}
                style={{ textAlign: "center", width: "5ch" }}
                disabled={!clashBattle.isHost || pointsDisabled}
            />

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

            <div style={{ gridColumn: "1 / span 4", display: "flex", flexDirection: "column", gap: "0.5rem", justifySelf: "center", alignItems: "start" }}>
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

                <label
                    {...getGeneralTooltipProps("Include E.G.O in the draft.\nE.G.O will be drafted after all identities are finished being drafted. Players will get half the points they normally get per drafting round (rounded up). E.G.O are single use throughout the entire game. Awakenings and Corrosions share the same single use.")}
                >
                    <input type="checkbox"
                        checked={clashBattle.settings.egoDraft}
                        onChange={e => clashBattle.setSetting("egoDraft", e.target.checked)}
                        disabled={!clashBattle.isHost}
                    />
                    <span className="hover-text">
                        Enable E.G.O Drafting
                    </span>
                </label>

                <label
                    {...getGeneralTooltipProps("When enabled, players enter a blacklist phase after every 2 rounds of drafting identities. Each player gets to vote for an identity to blacklist. All identities that get at least one vote get blacklisted for the rest of the game.\nWARNING: The game has no recovery method if a player is unable to draft an identity. Be careful when blacklisting if there are a lot of players and the team size is large.")}
                >
                    <input type="checkbox"
                        checked={clashBattle.settings.blacklisting}
                        onChange={e => clashBattle.setSetting("blacklisting", e.target.checked)}
                        disabled={!clashBattle.isHost}
                    />
                    <span className="hover-text">
                        Enable Blacklist Phases
                    </span>
                </label>

            </div>
        </div>

        <button onClick={() => setAdvancedOpen(p => !p)}>{advancedOpen ? "Close" : "Open"} Advanced Settings</button>
        {advancedOpen &&
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, auto)", alignItems: "start", gap: "0.5rem" }}>
                <div style={{ display: "grid", gridTemplateColumns: "auto auto", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "end", fontSize: "1.1rem", textAlign: "end" }}>
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
                        <span className="hover-text"
                            {...getGeneralTooltipProps("Rounds may generate faction or keyword bonuses. When a bonus is active, picking a skill from an identity who shares a faction or keyword with the player's other drafted identities will give the skill bonuses to clash power.")}
                            onClick={() => clashBattle.setSetting("teamBonuses", !clashBattle.settings.teamBonuses)}
                        >
                            Enable Team Bonuses:
                        </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", height: "100%" }}>
                        <input type="checkbox"
                            checked={clashBattle.settings.teamBonuses}
                            onChange={e => clashBattle.setSetting("teamBonuses", e.target.checked)}
                            disabled={!clashBattle.isHost}
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

                    <div style={{ display: "flex", justifyContent: "end", fontSize: "1.1rem", textAlign: "end" }}>
                        <span className="hover-text" {...getGeneralTooltipProps("Bias SP towards rolling higher or lower values.")}>
                            SP Bias:
                        </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <input
                            type="range" min={-5} max={5} step={1} value={clashBattle.settings.spBias}
                            onChange={(e) => clashBattle.setSetting("spBias", Number(e.target.value))}
                            style={{ width: "100px" }} disabled={!clashBattle.isHost}
                        />
                        <span>
                            {biasText(clashBattle.settings.spBias)}
                        </span>
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
