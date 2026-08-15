import NoPrefetchLink from "../components/NoPrefetchLink";
import { HorizontalDivider } from "../components/objects/Dividers";
import SocialsDisplay from "../components/user/SocialsDisplay";
import { CONTACT_EMAIL, DISCORD_LINK, GITHUB_REPO, KOFI, TWITTER, YOUTUBE_CHANNEL } from "../lib/socials";

export default function AboutPage() {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "start", maxWidth: "1000px", gap: "1rem", lineHeight: "1.3" }}>
            <h1 style={{ fontSize: "1.75rem", margin: 0 }}>About this Site</h1>
            <p>
                Limbus Company Tools is an unofficial fan-made project created for the Limbus Company community.
                <br /> <br />
                It provides tools, reference databases, and community features to support gameplay planning and experimentation.
                <br /> <br />
                This site is independently maintained by a single developer, with feedback and support from the community.
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
                <summary>Can I contribute?</summary>
                Yes! You can sign up to create and post your own content and help the site grow over time.
            </details>

            <details>
                <summary>Can I use the site without an account?</summary>
                Yes. All tools and most features are available without an account, but posting requires signing in.
                <br />
                Any posts created without an account are only saved locally on your device.
            </details>

            <details>
                <summary>How often does the site update?</summary>
                New content from the game is usually added within 24 hours of release, depending on my personal availability.
                <br />
                New features and other updates are added whenever they are ready and have no fixed schedule.
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
