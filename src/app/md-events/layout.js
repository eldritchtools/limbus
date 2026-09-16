import JsonLd, { getWebPageSchema } from "../lib/jsonLd";

const name = "Choice Events";
const desc = "Browse choice events available in Limbus Company Mirror Dungeons.";
const path = "/md-events";

export const metadata = {
    title: name,
    description: desc,
    alternates: {
        canonical: path
    },
    openGraph: {
        title: name,
        description: desc,
        url: path,
        type: "website",
    },

    twitter: {
        card: "summary",
        title: name,
        description: desc
    }
};

const schema = {
    "@context": "https://schema.org",
    "@graph": [
        getWebPageSchema({
            title: name,
            description: desc,
            url: `https://limbus.eldritchtools.com${path}`
        })
    ]
};

export default function MdEventsLayout({ children }) {
    return <div style={{ display: "flex", flexDirection: "column", width: "100%", alignItems: "center", gap: "1rem", justifyContent: "start" }}>
        <JsonLd data={schema} />

        <h1 style={{ fontSize: "1.75rem", margin: 0 }}>Choice Events</h1>
        <p style={{ margin: 0 }}>
            Browse all Mirror Dungeon Choice Events.
        </p>
        <p className="sub-text" style={{ margin: 0, textAlign: "center", maxWidth: "1280px" }}>
            Browse all Mirror Dungeon choice events and their possible outcomes.
            <br /><br />
            Search events by their name, choice text, or possible E.G.O Gift rewards. You can also filter events by the Theme Packs they appear in.
            <br /><br />
            Each event shows its possible Gift rewards and any affinities that receive a bonus or handicap when the event includes a check. Expand an event to view its description and all of its choices, including branching options and the details of their checks, requirements, and outcomes.
        </p>
        {children}
    </div>
}