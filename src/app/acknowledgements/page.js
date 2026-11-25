import SupporterIcon from "../components/icons/SupporterIcon";
import NoPrefetchLink from "../components/NoPrefetchLink";
import SocialsDisplay from "../components/socials/SocialsDisplay";

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

export default async function SupportPage() {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "start", maxWidth: "1000px", gap: "1rem" }}>
            <h1 style={{ fontSize: "1.75rem", margin: 0, alignSelf: "center" }}>Acknowledgements</h1>
            <span style={{ lineHeight: "1.3" }}>
                Limbus Company Tools is completely free to use and will remain that way. Thank you for being part of the community.
            </span>

            <span style={{ lineHeight: "1.3" }}>
                If you&apos;d like to participate in our community, you can contribute by submitting builds, md plans, ratings, or reviews. You can also like or comment on posts by other users, upvote reviews, or share the site with friends or other members of the community. Reporting bugs and suggesting features through the <NoPrefetchLink className="text-link" href="/feedback">Feedback</NoPrefetchLink> page or through Discord also helps a lot in improving the site.
            </span>

            <h3 style={{ margin: 0 }}>Creator Friends</h3>
            <span className="sub-text">
                Creators who helped promote the site or collaborated with us. Check them out if you&apos;re interested!
            </span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {creators.map((c, i) => <Creator key={i} creator={c} />)}
            </div>
        </div>
    </div>;
}
