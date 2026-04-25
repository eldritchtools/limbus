"use client";

import SupporterIcon from "../components/icons/SupporterIcon";
import SocialsDisplay from "../components/user/SocialsDisplay";

const creators = [
    {
        name: "Kamui Ever",
        iconPath: "kamui.jpg",
        socials: [
            { type: "youtube", value: "@KamuiEver" },
            { type: "discord-server", value: "https://discord.com/invite/syKtRq6hFC"},
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

export default function SupportersPage() {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "start", maxWidth: "1000px", gap: "0.5rem" }}>
            <h2 style={{ margin: 0 }}>Supporters</h2>
            <span style={{ lineHeight: "1.3" }}>
                A big thank you to everyone who keeps the site alive, whether by sharing, using, or contributing to it.
                <br />
                This page is here to give an extra spotlight to a few members of the community.
            </span>

            <div style={{ height: "0.5rem" }} />

            <h3 style={{ margin: 0 }}>Creator Friends</h3>
            <span style={{ fontSize: "0.9rem", color: "#aaa" }}>Creators who support or collaborate with the site. Check them out if you&apos;re interested!</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {creators.map((c, i) => <Creator key={i} creator={c} />)}
            </div>
        </div>
    </div>;
}
