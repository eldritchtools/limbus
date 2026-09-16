import NoPrefetchLink from "../components/NoPrefetchLink";
import { HorizontalDivider } from "../components/objects/Dividers";
import SocialsDisplay from "../components/socials/SocialsDisplay";
import { CONTACT_EMAIL, DISCORD_LINK, GITHUB_REPO, KOFI, PATREON, TWITTER, YOUTUBE_CHANNEL } from "../lib/socials";

export default function AboutPage() {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "start", maxWidth: "1280px", gap: "1rem", lineHeight: "1.3" }}>
            <h1 style={{ fontSize: "1.75rem", margin: 0 }}>About this Site</h1>
            <p>
                Limbus Company Tools is an unofficial fan-made project created for the Limbus Company community.
                <br /> <br />
                The site provides reference databases for Identities, E.G.O, Mirror Dungeon content, encounters, and other game information, along with tools for team building, planning, calculations, simulations, and other gameplay-related tasks. Community features also let users create and share team builds, Mirror Dungeon plans, reviews, collections, and other content. The site also provides Limbus Company-related minigames for users to play both solo or with friends.
                <br /> <br />
                This site is independently maintained by a single developer, with feedback and support from the community. New game content is generally added within 24 hours of release, depending on my availability, while new features and other updates are added whenever they are ready.
            </p>

            <h2 style={{ margin: 0 }}>Site Links</h2>
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <SocialsDisplay
                    socials={[
                        { type: "discord-server", value: DISCORD_LINK },
                        { type: "github", value: GITHUB_REPO },
                        { type: "email", value: CONTACT_EMAIL },
                        { type: "youtube", value: YOUTUBE_CHANNEL },
                        { type: "twitter", value: TWITTER },
                        { type: "patreon", value: PATREON },
                        { type: "ko-fi", value: KOFI }

                    ]}
                    expandedDefault={true} button={true}
                />
            </div>

            <h2 style={{ margin: 0 }}>Official Limbus Company Links</h2>
            <SocialsDisplay
                socials={[
                    { type: "web", value: "https://limbuscompany.com/" },
                    { type: "youtube", value: "@ProjectMoonOfficial" },
                    { type: "twitter", value: "LimbusCompany_B" }
                ]}
                expandedDefault={true} button={true}
            />

            <HorizontalDivider />

            <h2 style={{ margin: 0 }}>FAQ</h2>

            <details>
                <summary>What is this site for?</summary>
                This site brings together community content, tools, and reference material for the game Limbus Company.
            </details>

            <details>
                <summary>Is this site affiliated with Project Moon?</summary>
                No. Limbus Company Tools is an unofficial fan-made project and is not affiliated with, endorsed by, or sponsored by Project Moon.
            </details>

            <details>
                <summary>Can I contribute?</summary>
                Yes! You can sign up to create and post your own content and help the site grow over time. You can also submit feedback, report incorrect information, or suggest improvements through the <NoPrefetchLink href={"/feedback"} className="text-link">Feedback</NoPrefetchLink> page.
            </details>

            <details>
                <summary>Can I use the site without an account?</summary>
                Yes. All tools and most features are available without an account, but posting requires signing in.
                <br />
                Any posts created without an account are only saved locally on your device.
            </details>

            <details>
                <summary>Do you work with creators?</summary>
                Yes. The site is open to collaboration with creators.
                <br />
                Send me a message on Discord or use the <NoPrefetchLink href={"/feedback"} className="text-link">Contact</NoPrefetchLink> page.
            </details>

            <details>
                <summary>How can I support the site?</summary>
                Check out the <NoPrefetchLink href={"/support"} className="text-link">Support</NoPrefetchLink> page for more details.
            </details>
        </div>
    </div>;
}
