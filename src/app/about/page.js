import NoPrefetchLink from "../components/NoPrefetchLink";

export default function AboutPage() {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "start", maxWidth: "1000px", gap: "1rem", lineHeight: "1.3" }}>
            <h2 style={{ margin: 0 }}>About this Site</h2>
            <span>This is a community-driven site combining user-submitted posts, tools, and a reference database for the game Limbus Company.</span>
            <span>Users can browse or share content such as team builds and md plans, use one of the many tools available on the site, or explore database pages covering game content.</span>
            <span>This site is currently maintained by one person, with support from the community as it continues to grow.</span>

            <div style={{ border: "1px #777 solid", width: "100%" }} />

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
                Yes. All tools and most features are available without an account, but posting requires signing in. Any posts created without an account are only saved locally on your device.
            </details>

            <details>
                <summary>How often does the site update?</summary>
                New content from the game is usually added within 24 hours of release, depending on my personal availability. 
                <br/>
                New features and other updates are added whenever they are ready and have no fixed schedule.
            </details>

            <details>
                <summary>Do you work with creators?</summary>
                Yes. The site is open to collaboration with creators. 
                <br/>
                Send me a message on Discord or use the <NoPrefetchLink href={"/feedback"}>Contact</NoPrefetchLink> page. 
                <br/>
                You can also check out the <NoPrefetchLink href={"/supporters"}>Supporters</NoPrefetchLink> page.
            </details>

            <details>
                <summary>How can I support the site?</summary>
                Sharing the site and contributing content is the best way to help. 
                <br/>
                More ways to support the site may be added in the future once it grows further.
            </details>
        </div>
    </div>;
}
