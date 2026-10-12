import NoPrefetchLink from "../components/NoPrefetchLink";

export default function ModeSelectScreen({ clashBattle }) {
    return <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Clash Arena</h1>
        <span style={{ maxWidth: "1280px", textAlign: "center", marginBottom: "1rem" }}>
            Clash Arena is a multiplayer game where players draft teams to compete in clashing scenarios with each other. Once teams are drafted, players are presented with multiple rounds of randomized scenarios where they choose a skill to clash with the enemy. The player(s) with the highest clash values win the round and gain a point. Once a skill has been used, it is removed from your available pool of skills, so choose carefully when you decide to use them!
            <br /><br />
            Clash Arena uses a simplified simulation of Limbus Company clashing. Some skills and conditionals have been simplified or modified to better fit the mechanics and limitations of the game. Certain mechanics like resonance or deploying specific identities have been omitted entirely. You can submit any issues or suggestions on the <NoPrefetchLink className="text-link" href={"/feedback"}>Feedback page</NoPrefetchLink> or in our Discord.
            <br /><br />
            Please note that games may occasionally be interrupted by server restarts for updates or maintenance. I try to minimize these interruptions, but unfortunately they can&apos;t be avoided entirely.
        </span>

        <h2>Select a mode</h2>
        <span
            className="text-link" style={{ fontSize: "1.2rem" }}
            onClick={() => clashBattle.selectMode("standard")}
        >
            Standard
        </span>
        <span className="sub-text">Play with up to 8 players. Players draft one by one and cannot repeat identities and E.G.O already picked by other players.</span>
        <span
            className="text-link" style={{ fontSize: "1.2rem" }}
            onClick={() => clashBattle.selectMode("battleRoyale")}
        >
            Battle Royale
        </span>
        <span className="sub-text">Play with up to 200 players. Players draft simultaneously and can pick identities and E.G.O. already picked by other players. Blacklisting phases are unavailable in this mode.</span>
        <span className="sub-text">Note: Performance may be affected when many players are in the same room. The player limit may be adjusted in the future as necessary to maintain server stability.</span>
   </div>
}