"use client";

import SupporterIcon from "../components/icons/SupporterIcon";
import NoPrefetchLink from "../components/NoPrefetchLink";
import SocialsDisplay from "../components/user/SocialsDisplay";

const creators = [
    {
        name: "Kamui Ever",
        iconPath: "kamui.jpg",
        socials: [
            { type: "youtube", value: "@KamuiEver" },
            { type: "discord-server", value: "https://discord.com/invite/syKtRq6hFC" },
            { type: "twitter", value: "KamuiEver" }
        ]
    }
]

function Creator({ creator }) {
    return <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <SupporterIcon path={creator.iconPath} style={{ width: "64px", height: "64px", borderRadius: "50%" }} />
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem", alignItems: "start" }}>
            <span style={{ fontSize: "1.2rem", fontWeight: "bold" }}>{creator.name}</span>
            <SocialsDisplay socials={creator.socials} expandedDefault={true} button={true} />
        </div>
    </div>
}

export default function SupportPage() {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "start", maxWidth: "1000px", gap: "1rem" }}>
            <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Support Limbus Company Tools</h1>
            <span style={{ lineHeight: "1.3" }}>
                Limbus Company Tools is completely free to use and will remain that way. If you&apos;ve found the site useful and would like to help keep it running and improving, there are several ways you can support the project.
                <br /> <br />
                Support is always optional. Whether you choose to support the site or just use it, thank you for being part of the community.
            </span>

            <h2 style={{ fontSize: "1.25rem", margin: 0, alignSelf: "center" }}>Financial Support</h2>
            <span style={{ lineHeight: "1.3" }}>
                For financial support, you can directly support hosting and development costs through Patreon. Every contribution helps keep the project alive. Ko-Fi is also available as an alternative for those who prefer it, though it won&apos;t be updated as frequently.
            </span>
            <div style={{ alignSelf: "center" }}>
                <SocialsDisplay socials={[
                    { type: "patreon", value: "EldritchTools" },
                    { type: "ko-fi", value: "eldritch80763" }
                ]} expandedDefault={true} button={true} />
            </div>
            <span style={{ lineHeight: "1.3" }}>
                In the future, I may introduce a small number of unobtrusive ads to help cover costs. There is an option in the <NoPrefetchLink className="text-link" href="/site-customization">Site Customization</NoPrefetchLink> page to disable them, but if you don&apos;t mind seeing them, leaving them enabled is an easy way to support the site without spending any money.
            </span>

            <h2 style={{ fontSize: "1.25rem", margin: 0, alignSelf: "center" }}>Other Support</h2>
            <span style={{ lineHeight: "1.3" }}>
                Sharing the site with friends or other members of the community is one of the best ways to help it grow.
                <br /> <br />
                You can also simply continue using the site. Contributing builds, ratings, and reviews, liking or commenting on other posts, upvoting reviews, and any other site activity helps out a lot. You can also report bugs and suggest features through the <NoPrefetchLink className="text-link" href="/feedback">Feedback</NoPrefetchLink> page.
            </span>

            <div style={{ height: "0.5rem" }} />
            <h2 style={{ fontSize: "1.25rem", margin: 0, alignSelf: "center" }}>Supporters</h2>
            <span style={{ lineHeight: "1.3" }}>
                Thank you to everyone who helps make the site possible!
            </span>

            <h3 style={{ margin: 0 }}>Creator Friends</h3>
            <span className="sub-text">
                Creators who support or collaborate with the site. Check them out if you&apos;re interested!
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {creators.map((c, i) => <Creator key={i} creator={c} />)}
            </div>

            <h3 style={{ margin: 0 }}>Patrons</h3>
            <span className="sub-text">
                Coming soon!
            </span>
        </div>
    </div>;
}
