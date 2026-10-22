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
        <span className="sub-text">Play with up to 100 players. Players draft simultaneously and can pick identities and E.G.O. already picked by other players. Blacklisting phases are unavailable in this mode.</span>
        <span className="sub-text">Note: Performance may be affected when many players are in the same room. The player limit may be adjusted in the future as necessary to maintain server stability.</span>

        <span style={{ textAlign: "center", marginTop: "1rem" }}>Oct 23, 2026 Note</span>
        <p style={{ maxWidth: "1280px", textAlign: "center" }}>
            The formula used to assign point values to identities has been updated.
            <br /> <br />
            Previously, point values were calculated based on estimated average clash values of their skills. This means S1s were weighed 3x as much as S3s since they had three times as many uses, so identities with weaker S1s had their averages pulled down, making them cost fewer points.
            <br /> <br />
            This made sense for games that lasted long enough for most of skills to be consumed. However, it quickly becomes a problem for shorter games where most S1s aren&apos;t even used. Most games currently being played fall under this category, which means S1s are having a disproportionately large impact on point values despite being largely irrelevant. To balance this, S1s, S2s, and S3s all now weigh the same in the calculation.
            <br /> <br />
            Additionally, identities that have skill modifiers (ascended skills and bonus skill uses) are currently too strong, so I have increased the bonuses that modifiers gave in the calculation, which should make the affected identities cost more points. Identities that generate bonus skill uses have also been adjusted to generate fewer bonus uses over longer games.
            <br /> <br />
            Hopefully, these changes will provide a more balanced experience for everyone.
        </p>
    </div>
}