"use client";

import SocialsDisplay from "../components/user/SocialsDisplay";

const creators = [
    {
        name: "Kamui Ever",
        socials: [
            {type: "youtube", value: "@KamuiEver"}
        ]
    }
]

function Creator({ creator }) {
    return <div style={{ padding: "0.5rem", border: "1px #aaa solid", borderRadius: "0.5rem" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
            <span>{creator.name}</span>
            <SocialsDisplay socials={creator.socials} />
        </div>
    </div>
}

export default function SupportersPage() {
    return <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%", containerType: "inline-size" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "start", maxWidth: "1000px", gap: "0.5rem" }}>
            <h2 style={{ margin: 0 }}>Supporters</h2>
            <span>
                A big thank you to everyone who supports the site, whether by sharing, using, or contributing to it.
            </span>

            <h3 style={{ margin: 0 }}>Creator Friends</h3>
            <span style={{ fontSize: "0.9rem", color: "#aaa" }}>Creators who support or collaborate with the site.</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {creators.map((c, i) => <Creator key={i} creator={c} />)}
            </div>
        </div>
    </div>;
}
