import { useState } from "react";

import NoPrefetchLink from "../components/NoPrefetchLink";
import { useSiteCustomization } from "../components/SiteCustomizationProvider";
import useLocalState from "../lib/useLocalState";

export default function RoomSetupScreen({ clashBattle, profile }) {
    const { getCustomizationValue, setCustomizationValue } = useSiteCustomization();
    const [displayName, setDisplayName] = useLocalState("chatDisplayName", profile?.username ?? "Guest");
    const [roomInput, setRoomInput] = useState("");
    const [joinMessage, setJoinMessage] = useState("");

    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Clash Arena</h1>
        <span style={{ maxWidth: "1000px", textAlign: "center", marginBottom: "1rem" }}>
            Clash Arena is a multiplayer game where players draft teams to complete in clashing scenarios with each other. Once teams are drafted, players are provided multiple rounds of randomized scenarios where they will choose a skill to clash with the enemy. The player(s) with the highest clash values win the round and get a point. Once a skill has been used, it is removed from your available pool of skills, so choose carefully when you decide to use them!
            <br /><br />
            Clash Arena uses a simplified simulation of Limbus Company clashing. Some skills and conditionals have been simplified, modified, or omitted due to limitations of the simulator. This is still an early version of the game, so some of the omitted conditionals may be introduced later on, along with additional mechanics, balance changes, or fixes for inaccurate conditionals. You can submit any issues or suggestions on the <NoPrefetchLink className="text-link" href={"/feedback"}>Feedback page</NoPrefetchLink> or in our Discord.
            <br /><br />
            This minigame is a work in progress and there are plans to update it with more features and mechanics over time.
        </span>

        <h2>Join Settings</h2>
        <div style={{ display: "grid", gridTemplateColumns: "auto auto", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ textAlign: "end" }}>Display Name:</span>
            <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Display name"
            />
            <span style={{ textAlign: "end" }}>Room Code:</span>
            <input
                value={roomInput}
                onChange={e => setRoomInput(e.target.value)}
            />
        </div>
        <span className="sub-text">Code used to join a hosted room. Ignored when hosting a new room.</span>

        <label style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
            <input type="checkbox"
                checked={getCustomizationValue("autoConnectChat")}
                onChange={e => setCustomizationValue("autoConnectChat", e.target.checked)}
            />
            <span>Automatically join chat room</span>
        </label>

        <h2>Choose an option</h2>
        <span
            className="text-link" style={{ fontSize: "1.2rem" }}
            onClick={() => clashBattle.joinRoom(true, displayName, roomInput, setJoinMessage)}
        >
            Host Room
        </span>
        <span className="sub-text">Host a room. Hosts choose the settings and decide when the game advances.</span>
        <span
            className="text-link" style={{ fontSize: "1.2rem" }}
            onClick={() => clashBattle.joinRoom(false, displayName, roomInput, setJoinMessage)}
        >
            Join Room
        </span>
        <span className="sub-text">Join a room hosted by someone else.</span>
        {joinMessage && <span>{joinMessage}</span>}
    </div>
}